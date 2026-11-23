import { schemaStatements } from './schema.js';
import { listings as seedListings } from '../src/data/listings.js';

/**
 * Applies the schema and, on an empty database, loads the sample listings that
 * used to live in the frontend bundle. Runs once per isolate.
 */
let ready;

export function ensureDatabase(env) {
  ready ??= (async () => {
    await env.DB.batch(schemaStatements.map((sql) => env.DB.prepare(sql)));

    const { count } = await env.DB.prepare('SELECT COUNT(*) AS count FROM listings').first();
    if (count > 0) return;

    await env.DB.batch(seedListings.map((listing) => env.DB.prepare(INSERT_SEED).bind(...seedValues(listing))));
  })().catch((error) => {
    ready = undefined;
    throw error;
  });

  return ready;
}

const INSERT_SEED = `INSERT INTO listings (
  id, kind, type, title, city, district, wilaya, price, price_unit, beds, baths, area,
  guests, furnished, available, rating, reviews, image, featured, badge, amenities,
  description, owner_name, owner_role, owner_since, owner_verified, owner_response,
  hotel_stars, hotel_check_in, hotel_check_out, status
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')`;

function seedValues(listing) {
  return [
    listing.id,
    listing.kind,
    listing.type ?? null,
    listing.title,
    listing.city,
    listing.district ?? null,
    listing.wilaya ?? null,
    listing.price,
    listing.priceUnit,
    listing.beds ?? 1,
    listing.baths ?? 1,
    listing.area ?? 0,
    listing.guests ?? 1,
    listing.furnished ? 1 : 0,
    listing.available ?? null,
    listing.rating ?? 0,
    listing.reviews ?? 0,
    listing.image ?? null,
    listing.featured ? 1 : 0,
    listing.badge ?? null,
    JSON.stringify(listing.amenities ?? []),
    listing.description ?? null,
    listing.owner?.name ?? null,
    listing.owner?.role ?? null,
    listing.owner?.since ?? null,
    listing.owner?.verified ? 1 : 0,
    listing.owner?.responseTime ?? null,
    listing.hotel?.stars ?? null,
    listing.hotel?.checkIn ?? null,
    listing.hotel?.checkOut ?? null,
  ];
}
