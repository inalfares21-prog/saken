import { createFreebuffAuth, isSameOriginRequest } from '@freebuff/auth';
import { ensureDatabase } from './db.js';
import { addEnquiry, countEnquiriesForOwner, listEnquiriesForOwner } from './enquiries.js';
import {
  createListing,
  findListing,
  listListings,
  listOwnListings,
  similarListings,
  validateListing,
} from './listings.js';
import { badRequest, json, notFound, readJson, unauthorized } from './http.js';

let app;

/**
 * One auth instance per isolate: it caches OIDC discovery and signing keys.
 * `wrap` serves /auth/freebuff/* and keeps the session cookie fresh.
 */
function getApp(env) {
  if (app) return app;

  const auth = createFreebuffAuth({
    clientId: env.FREEBUFF_CLIENT_ID,
    issuer: env.FREEBUFF_ISSUER,
    baseUrl: env.APP_ORIGIN,
    allowInsecureLocalhost: env.APP_ORIGIN.startsWith('http://'),
  });

  app = auth.wrap(async (request, workerEnv) => {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return workerEnv.ASSETS.fetch(request);

    await ensureDatabase(workerEnv);
    return handleApi(request, workerEnv, auth, url);
  });

  return app;
}

async function handleApi(request, env, auth, url) {
  const path = url.pathname;
  const method = request.method;

  if (path === '/api/health') {
    return json({ ok: true });
  }

  if (path === '/api/listings' && method === 'GET') {
    return json({ listings: await listListings(env, url) });
  }

  if (path.startsWith('/api/listings/') && method === 'GET') {
    const listing = await findListing(env, path.slice('/api/listings/'.length));
    if (!listing) return notFound();
    return json({ listing, similar: await similarListings(env, listing) });
  }

  if (path === '/api/listings' && method === 'POST') {
    if (!isSameOriginRequest(request, env.APP_ORIGIN)) return json({ error: 'Cross-origin request refused' }, { status: 403 });
    const user = await auth.getUser(request);
    if (!user) return unauthorized();

    const body = await readJson(request);
    if (!body) return badRequest({ form: 'Send the listing as JSON.' });

    const result = validateListing(body);
    if (!result.ok) return badRequest(result.errors);

    const profile = await profileFor(env, user);
    const listing = await createListing(env, user.sub, profile, result.values);
    return json({ listing }, { status: 201 });
  }

  if (path === '/api/enquiries' && method === 'POST') {
    if (!isSameOriginRequest(request, env.APP_ORIGIN)) return json({ error: 'Cross-origin request refused' }, { status: 403 });

    const body = await readJson(request);
    if (!body) return badRequest({ form: 'Send the message as JSON.' });

    const result = await addEnquiry(env, body, await auth.getUser(request));
    if (!result.ok) return badRequest(result.errors);

    return json({ ok: true }, { status: 201 });
  }

  if (path === '/api/me' && method === 'GET') {
    const user = await auth.getUser(request);
    if (!user) return unauthorized();
    return json({ user: await profileFor(env, user) });
  }

  if (path === '/api/me' && method === 'PATCH') {
    if (!isSameOriginRequest(request, env.APP_ORIGIN)) return json({ error: 'Cross-origin request refused' }, { status: 403 });
    const user = await auth.getUser(request);
    if (!user) return unauthorized();

    const body = await readJson(request);
    const role = body?.role;
    if (role !== 'tenant' && role !== 'owner') return badRequest({ role: 'Choose tenant or owner.' });

    await profileFor(env, user);
    await env.DB.prepare('UPDATE users SET role = ? WHERE id = ?').bind(role, user.sub).run();
    return json({ user: await profileFor(env, user) });
  }

  if (path === '/api/me/listings' && method === 'GET') {
    const user = await auth.getUser(request);
    if (!user) return unauthorized();

    return json({
      listings: await listOwnListings(env, user.sub),
      enquiries: await countEnquiriesForOwner(env, user.sub),
    });
  }

  if (path === '/api/me/enquiries' && method === 'GET') {
    const user = await auth.getUser(request);
    if (!user) return unauthorized();

    return json({ enquiries: await listEnquiriesForOwner(env, user.sub) });
  }

  return notFound();
}

/** Creates the account row on first sight and returns the stored profile. */
async function profileFor(env, user) {
  await env.DB.prepare(
    `INSERT INTO users (id, email, name) VALUES (?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       email = COALESCE(excluded.email, users.email),
       name = COALESCE(excluded.name, users.name)`,
  )
    .bind(user.sub, user.email ?? null, user.name ?? null)
    .run();

  const row = await env.DB.prepare('SELECT id, role, name, email FROM users WHERE id = ?')
    .bind(user.sub)
    .first();

  return {
    id: row.id,
    role: row.role,
    name: row.name || user.name || 'Saken member',
    email: row.email || user.email || null,
    picture: user.picture ?? null,
  };
}

export default {
  fetch(request, env) {
    return getApp(env)(request, env);
  },
};
