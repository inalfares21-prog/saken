const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function str(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function addEnquiry(env, body, user) {
  const errors = {};
  const name = str(body.name, 80);
  const email = str(body.email, 120).toLowerCase();
  const phone = str(body.phone, 30);
  const message = str(body.message, 2000);
  const listingId = str(body.listingId, 80) || null;

  if (name.length < 2) errors.name = 'Enter your name.';
  if (!EMAIL.test(email)) errors.email = 'Enter a valid email address.';
  if (message.length < 10) errors.message = 'Write a message of at least 10 characters.';
  else if (message.length > 2000) errors.message = 'Keep the message under 2 000 characters.';

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  if (listingId) {
    const listing = await env.DB.prepare('SELECT id FROM listings WHERE id = ? AND status = ?')
      .bind(listingId, 'published')
      .first();
    if (!listing) return { ok: false, errors: { listingId: 'That listing is no longer available.' } };
  }

  await env.DB.prepare(
    'INSERT INTO enquiries (id, listing_id, user_id, name, email, phone, message) VALUES (?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(crypto.randomUUID(), listingId, user?.sub ?? null, name, email, phone || null, message)
    .run();

  return { ok: true };
}

/** Newest enquiries across the owner's listings, for the dashboard panel. */
export async function listEnquiriesForOwner(env, userId, limit = 20) {
  const { results } = await env.DB.prepare(
    `SELECT e.id, e.name, e.email, e.phone, e.message, e.created_at,
            l.id AS listing_id, l.title AS listing_title
     FROM enquiries e
     JOIN listings l ON l.id = e.listing_id
     WHERE l.owner_id = ?
     ORDER BY e.created_at DESC
     LIMIT ?`,
  )
    .bind(userId, limit)
    .all();
  return results;
}

export async function countEnquiriesForOwner(env, userId) {
  const row = await env.DB.prepare(
    `SELECT COUNT(*) AS count FROM enquiries e
     JOIN listings l ON l.id = e.listing_id
     WHERE l.owner_id = ?`,
  )
    .bind(userId)
    .first();
  return row?.count ?? 0;
}
