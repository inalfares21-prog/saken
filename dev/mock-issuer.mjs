/**
 * Local mock of the Freebuff OIDC issuer.
 *
 * The real issuer (https://freebuff.com/oidc) is unreachable from some
 * networks, which blocks every signed-in flow in development. This server
 * implements just the endpoints @freebuff/auth uses — discovery, JWKS,
 * /authorize, /token and /revoke — and signs real RS256 tokens with a
 * throwaway key, so the SDK's real validation code runs unchanged.
 *
 * It is development tooling only: the Worker never uses it unless it is
 * started with FREEBUFF_ISSUER pointing here (see `npm run api:mock`), and
 * nothing about it ships to the deployed site.
 *
 *   node dev/mock-issuer.mjs
 *
 * Pick who is signing in with /dev/as (a cookie, so it survives the redirect
 * dance): curl -c jar http://127.0.0.1:8790/dev/as?name=Sara&email=sara@example.dz
 */
import { createServer } from 'node:http';
import { createHash, createSign, generateKeyPairSync, randomBytes } from 'node:crypto';

const PORT = Number(process.env.MOCK_ISSUER_PORT ?? 8790);
const ISSUER = `http://127.0.0.1:${PORT}`;
const CLIENT_ID = process.env.MOCK_CLIENT_ID ?? '315076cd-6bff-4e31-9286-a5a4e8ce45b4';
const KID = 'local-dev-key';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: KID, alg: 'RS256', use: 'sig' };

const codes = new Map();
const refreshTokens = new Map();

const DEFAULT_USER = {
  sub: 'dev-owner-0001',
  name: 'Amine Belkacem',
  email: 'amine.belkacem@example.dz',
};

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function signJwt(claims, typ) {
  const header = { alg: 'RS256', kid: KID, typ };
  const body = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  const signature = createSign('RSA-SHA256').update(body).sign(privateKey).toString('base64url');
  return `${body}.${signature}`;
}

const now = () => Math.floor(Date.now() / 1000);

function tokensFor(user) {
  const issuedAt = now();
  const accessToken = signJwt(
    {
      iss: ISSUER,
      aud: CLIENT_ID,
      sub: user.sub,
      client_id: CLIENT_ID,
      scope: 'openid email profile',
      email: user.email,
      email_verified: true,
      name: user.name,
      iat: issuedAt,
      exp: issuedAt + 600,
    },
    'at+jwt',
  );
  const refreshToken = `fbrt_${randomBytes(24).toString('hex')}`;
  refreshTokens.set(refreshToken, user);
  return { access_token: accessToken, refresh_token: refreshToken };
}

function readBody(request) {
  return new Promise((resolve) => {
    let text = '';
    request.on('data', (chunk) => {
      text += chunk;
      if (text.length > 65_536) request.destroy();
    });
    request.on('end', () => resolve(new URLSearchParams(text)));
  });
}

function send(response, status, body, headers = {}) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  response.writeHead(status, {
    'content-type': typeof body === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...headers,
  });
  response.end(payload);
}

function readCookie(request, name) {
  const part = (request.headers.cookie ?? '')
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${name}=`));
  return part ? decodeURIComponent(part.slice(name.length + 1)) : null;
}

function currentUser(request) {
  const raw = readCookie(request, 'mock_user');
  if (!raw) return DEFAULT_USER;
  try {
    return { ...DEFAULT_USER, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_USER;
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, ISSUER);
  const path = url.pathname;

  if (path === '/.well-known/openid-configuration') {
    return send(response, 200, {
      issuer: ISSUER,
      authorization_endpoint: `${ISSUER}/authorize`,
      token_endpoint: `${ISSUER}/token`,
      revocation_endpoint: `${ISSUER}/revoke`,
      jwks_uri: `${ISSUER}/keys`,
      response_types_supported: ['code'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
      scopes_supported: ['openid', 'email', 'profile'],
      code_challenge_methods_supported: ['S256'],
    });
  }

  if (path === '/keys') {
    return send(response, 200, { keys: [jwk] });
  }

  // Choose or switch the mock account: ?sub=&name=&email=
  if (path === '/dev/as') {
    const user = {
      sub: url.searchParams.get('sub') || DEFAULT_USER.sub,
      name: url.searchParams.get('name') || DEFAULT_USER.name,
      email: url.searchParams.get('email') || DEFAULT_USER.email,
    };
    return send(response, 200, { user }, {
      'set-cookie': `mock_user=${encodeURIComponent(JSON.stringify(user))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`,
    });
  }

  if (path === '/authorize') {
    const clientId = url.searchParams.get('client_id');
    const redirectUri = url.searchParams.get('redirect_uri');
    const state = url.searchParams.get('state') ?? '';
    if (clientId !== CLIENT_ID || !redirectUri) {
      return send(response, 400, 'Unknown client or missing redirect_uri');
    }
    const code = randomBytes(24).toString('base64url');
    codes.set(code, {
      redirectUri,
      nonce: url.searchParams.get('nonce') ?? '',
      challenge: url.searchParams.get('code_challenge') ?? '',
      user: currentUser(request),
      expiresAt: now() + 600,
    });
    const target = new URL(redirectUri);
    target.searchParams.set('code', code);
    target.searchParams.set('state', state);
    // RFC 9207: the app refuses responses from any other issuer.
    target.searchParams.set('iss', ISSUER);
    response.writeHead(303, { location: target.href, 'cache-control': 'no-store' });
    return response.end();
  }

  if (path === '/token' && request.method === 'POST') {
    const body = await readBody(request);
    const grant = body.get('grant_type');

    if (grant === 'authorization_code') {
      const code = codes.get(body.get('code') ?? '');
      codes.delete(body.get('code') ?? '');
      if (!code || code.expiresAt < now() || code.redirectUri !== body.get('redirect_uri')) {
        return send(response, 400, { error: 'invalid_grant' });
      }
      const verifier = body.get('code_verifier') ?? '';
      const expected = createHash('sha256').update(verifier).digest('base64url');
      if (expected !== code.challenge) return send(response, 400, { error: 'invalid_grant' });

      const issuedAt = now();
      const idToken = signJwt(
        {
          iss: ISSUER,
          aud: CLIENT_ID,
          sub: code.user.sub,
          nonce: code.nonce,
          email: code.user.email,
          email_verified: true,
          name: code.user.name,
          iat: issuedAt,
          exp: issuedAt + 600,
        },
        'JWT',
      );
      return send(response, 200, {
        ...tokensFor(code.user),
        id_token: idToken,
        token_type: 'Bearer',
        expires_in: 600,
        scope: 'openid email profile',
      });
    }

    if (grant === 'refresh_token') {
      const user = refreshTokens.get(body.get('refresh_token') ?? '');
      if (!user) return send(response, 400, { error: 'invalid_grant' });
      refreshTokens.delete(body.get('refresh_token') ?? '');
      return send(response, 200, {
        ...tokensFor(user),
        id_token: signJwt(
          { iss: ISSUER, aud: CLIENT_ID, sub: user.sub, iat: now(), exp: now() + 600 },
          'JWT',
        ),
        token_type: 'Bearer',
        expires_in: 600,
      });
    }

    return send(response, 400, { error: 'unsupported_grant_type' });
  }

  if (path === '/revoke' && request.method === 'POST') {
    const body = await readBody(request);
    refreshTokens.delete(body.get('token') ?? '');
    return send(response, 200, {});
  }

  return send(response, 404, 'Not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Mock Freebuff issuer listening on ${ISSUER}`);
  console.log(`Signing in as: ${DEFAULT_USER.name} <${DEFAULT_USER.email}> (${DEFAULT_USER.sub})`);
  console.log(`Switch account: ${ISSUER}/dev/as?name=...&email=...`);
});
