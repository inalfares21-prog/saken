import { authOptions, getAuth } from './auth.js';
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
import { badRequest, isSameOriginRequest, json, notFound, readJson, unauthorized } from './http.js';

export default {
  async fetch(request, env) {
    const options = authOptions(env);
    const auth = getAuth(env);
    const url = new URL(request.url);

    // Better Auth owns /api/auth/*: sign-up, sign-in, sign-out, session.
    if (url.pathname.startsWith(options.basePath)) {
      await ensureDatabase(env, options);
      return auth.handler(request);
    }

    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

    await ensureDatabase(env, options);
    return handleApi(request, env, auth, url);
  },
};

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
    const user = await currentUser(auth, request);
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

    const result = await addEnquiry(env, body, await currentUser(auth, request));
    if (!result.ok) return badRequest(result.errors);

    return json({ ok: true }, { status: 201 });
  }

  if (path === '/api/me' && method === 'GET') {
    const user = await currentUser(auth, request);
    if (!user) return unauthorized();
    return json({ user: await profileFor(env, user) });
  }

  if (path === '/api/me' && method === 'PATCH') {
    if (!isSameOriginRequest(request, env.APP_ORIGIN)) return json({ error: 'Cross-origin request refused' }, { status: 403 });
    const user = await currentUser(auth, request);
    if (!user) return unauthorized();

    const body = await readJson(request);
    const role = body?.role;
    if (role !== 'tenant' && role !== 'owner') return badRequest({ role: 'Choose tenant or owner.' });

    await profileFor(env, user);
    await env.DB.prepare('UPDATE users SET role = ? WHERE id = ?').bind(role, user.sub).run();
    return json({ user: await profileFor(env, user) });
  }

  if (path === '/api/me/listings' && method === 'GET') {
    const user = await currentUser(auth, request);
    if (!user) return unauthorized();

    return json({
      listings: await listOwnListings(env, user.sub),
      enquiries: await countEnquiriesForOwner(env, user.sub),
    });
  }

  if (path === '/api/me/enquiries' && method === 'GET') {
    const user = await currentUser(auth, request);
    if (!user) return unauthorized();

    return json({ enquiries: await listEnquiriesForOwner(env, user.sub) });
  }

  return notFound();
}

/**
 * Reads the Better Auth session from the request cookie and returns the shape
 * the rest of the API expects (`sub` is the account id).
 */
async function currentUser(auth, request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return null;

  return {
    sub: session.user.id,
    email: session.user.email ?? null,
    name: session.user.name ?? null,
    picture: session.user.image ?? null,
  };
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
