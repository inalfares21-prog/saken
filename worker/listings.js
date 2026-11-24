import { cities } from '../src/data/cities.js';

const CITY_NAMES = new Set(cities.map((city) => city.name));

const SORTS = {
  'price-asc': 'price ASC',
  'price-desc': 'price DESC',
  rating: 'rating DESC, reviews DESC',
  newest: 'created_at DESC',
};

export function toListing(row) {
  return {
    id: row.id,
    kind: row.kind,
    type: row.type ?? undefined,
    title: row.title,
    city: row.city,
    district: row.district ?? undefined,
    wilaya: row.wilaya ?? undefined,
    price: row.price,
    priceUnit: row.price_unit,
    beds: row.beds,
    baths: row.baths,
    area: row.area,
    guests: row.guests,
    furnished: Boolean(row.furnished),
    available: row.available ?? undefined,
    rating: row.rating,
    reviews: row.reviews,
    image: row.image ?? undefined,
    featured: Boolean(row.featured),
    badge: row.badge ?? undefined,
    amenities: JSON.parse(row.amenities || '[]'),
    description: row.description ?? '',
    owner: {
      name: row.owner_name ?? 'Saken owner',
      role: row.owner_role ?? 'Individual owner',
      since: row.owner_since ?? undefined,
      verified: Boolean(row.owner_verified),
      responseTime: row.owner_response ?? undefined,
    },
    hotel: row.hotel_stars
      ? { stars: row.hotel_stars, checkIn: row.hotel_check_in, checkOut: row.hotel_check_out }
      : undefined,
    status: row.status,
    createdAt: row.created_at,
  };
}

/** Public search. Never returns drafts or listings still under review. */
export async function listListings(env, url) {
  const params = url.searchParams;
  const where = ["status = 'published'"];
  const values = [];

  const kind = params.get('kind');
  if (kind === 'rental') {
    where.push("kind = 'rental'");
  } else if (kind === 'stay') {
    where.push("kind != 'rental'");
  } else if (kind) {
    where.push('kind = ?');
    values.push(kind);
  }

  const city = params.get('city');
  if (city && city !== 'All cities') {
    where.push('city = ?');
    values.push(city);
  }

  const max = Number(params.get('max'));
  if (params.get('max') && Number.isFinite(max)) {
    where.push('price <= ?');
    values.push(max);
  }

  const type = params.get('type');
  if (type && type !== 'any') {
    where.push('type = ?');
    values.push(type);
  }

  if (params.get('furnished') === '1') where.push('furnished = 1');
  if (params.get('featured') === '1') where.push('featured = 1');

  const order = SORTS[params.get('sort')] ?? 'featured DESC, rating DESC';
  const limit = Math.min(Math.max(Number(params.get('limit')) || 60, 1), 100);

  const { results } = await env.DB.prepare(
    `SELECT * FROM listings WHERE ${where.join(' AND ')} ORDER BY ${order} LIMIT ${limit}`,
  )
    .bind(...values)
    .all();

  return results.map(toListing);
}

export async function findListing(env, id) {
  const row = await env.DB.prepare("SELECT * FROM listings WHERE id = ? AND status = 'published'")
    .bind(id)
    .first();
  return row ? toListing(row) : null;
}

/** Same-section listings, best rated first — the "you may also like" row. */
export async function similarListings(env, listing, limit = 3) {
  const section = listing.kind === 'rental' ? "kind = 'rental'" : "kind != 'rental'";
  const { results } = await env.DB.prepare(
    `SELECT * FROM listings WHERE status = 'published' AND ${section} AND id != ? ORDER BY rating DESC LIMIT ?`,
  )
    .bind(listing.id, limit)
    .all();
  return results.map(toListing);
}

export async function listOwnListings(env, userId) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM listings WHERE owner_id = ? ORDER BY created_at DESC',
  )
    .bind(userId)
    .all();
  return results.map((row) => ({ ...toListing(row), contact: contactOf(row) }));
}

/** All listings in a given status, newest first — used by the admin review queue. */
export async function listListingsByStatus(env, status, limit = 100) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM listings WHERE status = ? ORDER BY created_at DESC LIMIT ?',
  )
    .bind(status, limit)
    .all();
  return results.map((row) => ({ ...toListing(row), contact: contactOf(row) }));
}

/** Approve or reject a listing by setting its status. */
export async function setListingStatus(env, id, status) {
  const result = await env.DB.prepare('UPDATE listings SET status = ? WHERE id = ?')
    .bind(status, id)
    .run();
  return (result.meta?.changes ?? 0) > 0;
}

function contactOf(row) {
  return { name: row.contact_name, phone: row.contact_phone, email: row.contact_email };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9][0-9 ().-]{5,24}$/;

function str(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function integer(value, min, max) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) return null;
  return number;
}

/**
 * Validates the create-listing payload and returns the row values. The rules
 * mirror the ones the form shows inline, so a mismatch is a real bug.
 */
export function validateListing(body) {
  const errors = {};
  const kindInput = str(body.kind);
  const kind = kindInput === 'stay' || kindInput === 'hotel' || kindInput === 'vacation'
    ? kindInput === 'stay'
      ? 'vacation'
      : kindInput
    : 'rental';

  const title = str(body.title);
  if (title.length < 6) errors.title = 'Add a title of at least 6 characters.';
  else if (title.length > 120) errors.title = 'Keep the title under 120 characters.';

  const city = str(body.city);
  if (!CITY_NAMES.has(city)) errors.city = 'Choose the city from the list.';

  const district = str(body.district);
  if (district.length < 2) errors.district = 'Enter the district or neighbourhood.';
  else if (district.length > 80) errors.district = 'Keep the district under 80 characters.';

  const description = str(body.description);
  if (description.length < 30) errors.description = 'Describe the place in at least 30 characters.';
  else if (description.length > 2000) errors.description = 'Keep the description under 2 000 characters.';

  const area = integer(body.area, 10, 5000);
  if (area === null) errors.area = 'Enter the surface area in m² (10 to 5 000).';

  const price = integer(body.price, 1000, 5000000);
  if (price === null) errors.price = 'Enter the rent or nightly rate in dinars.';

  const beds = integer(body.beds ?? 1, 0, 20);
  const baths = integer(body.baths ?? 1, 0, 20);
  const guests = integer(body.guests ?? 1, 0, 40);
  if (beds === null) errors.beds = 'Enter the number of bedrooms.';
  if (baths === null) errors.baths = 'Enter the number of bathrooms.';
  if (guests === null) errors.guests = 'Enter how many people it fits.';

  const contact = body.contact && typeof body.contact === 'object' ? body.contact : {};
  const contactName = str(contact.name);
  const contactPhone = str(contact.phone);
  const contactEmail = str(contact.email).toLowerCase();
  if (contactName.length < 2) errors.contactName = 'Enter your full name.';
  if (!PHONE.test(contactPhone)) errors.contactPhone = 'Enter a phone number tenants can reach.';
  if (!EMAIL.test(contactEmail)) errors.contactEmail = 'Enter a valid email address.';

  const available = str(body.available).slice(0, 60) || (kind === 'rental' ? 'Available now' : 'Rooms available');
  const badge = str(body.badge).slice(0, 40) || (kind === 'rental' ? 'New listing' : 'New stay');
  // Either a bundled sample photo or a photo the account uploaded itself.
  const image = str(body.image);
  const SAMPLE_IMAGE = /^\/images\/[a-z0-9-]+\.(jpg|jpeg|png|webp)$/i;
  const UPLOADED_IMAGE = /^\/api\/images\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (image && !SAMPLE_IMAGE.test(image) && !UPLOADED_IMAGE.test(image)) {
    errors.image = 'Upload a JPEG, PNG or WebP photo, or pick a sample one.';
  }

  const amenities = Array.isArray(body.amenities)
    ? body.amenities.map(str).filter(Boolean).slice(0, 20)
    : [];

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    values: {
      kind,
      type: kind === 'rental' ? 'apartment' : null,
      title,
      city,
      district,
      wilaya: city,
      price,
      priceUnit: kind === 'rental' ? 'month' : 'night',
      beds,
      baths,
      area,
      guests,
      furnished: body.furnished ? 1 : 0,
      available,
      image: image || (kind === 'rental' ? '/images/apt-hydra.jpg' : '/images/hotel-pool.jpg'),
      badge,
      amenities,
      description,
      contactName,
      contactPhone,
      contactEmail,
    },
  };
}

export async function createListing(env, userId, profile, values) {
  const id = `${slugify(values.title)}-${crypto.randomUUID().slice(0, 6)}`;
  const year = new Date().getFullYear();

  await env.DB.prepare(
    `INSERT INTO listings (
      id, owner_id, kind, type, title, city, district, wilaya, price, price_unit, beds, baths,
      area, guests, furnished, available, image, badge, amenities, description,
      owner_name, owner_role, owner_since, owner_verified, owner_response,
      contact_name, contact_phone, contact_email, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, 'review')`,
  )
    .bind(
      id,
      userId,
      values.kind,
      values.type,
      values.title,
      values.city,
      values.district,
      values.wilaya,
      values.price,
      values.priceUnit,
      values.beds,
      values.baths,
      values.area,
      values.guests,
      values.furnished,
      values.available,
      values.image,
      values.badge,
      JSON.stringify(values.amenities),
      values.description,
      profile.name,
      profile.role === 'owner' ? 'Individual owner' : 'Owner',
      year,
      'Usually replies within a day',
      values.contactName,
      values.contactPhone,
      values.contactEmail,
    )
    .run();

  const row = await env.DB.prepare('SELECT * FROM listings WHERE id = ?').bind(id).first();
  return { ...toListing(row), contact: contactOf(row) };
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}
