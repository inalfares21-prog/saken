/**
 * Renders the D1 schema and the sample listings as plain SQL on stdout.
 *
 * The Worker creates and seeds the database itself on its first request
 * (see worker/db.js), but that only happens once it is running. This script
 * exists so the same schema and seed data can be applied to a new database
 * directly, without deploying anything:
 *
 *   node dev/seed-sql.mjs > seed.generated.sql
 *   npx wrangler d1 execute saken --remote --file=seed.generated.sql
 *
 * Development tooling only; nothing here ships to the deployed site.
 */
import { schemaStatements } from '../worker/schema.js';
import { listings } from '../src/data/listings.js';

const INSERT_SEED = `INSERT INTO listings (
  id, kind, type, title, city, district, wilaya, price, price_unit, beds, baths, area,
  guests, furnished, available, rating, reviews, image, featured, badge, amenities,
  description, owner_name, owner_role, owner_since, owner_verified, owner_response,
  hotel_stars, hotel_check_in, hotel_check_out, status
) VALUES`;

const quote = (value) => {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
};

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
    'published',
  ];
}

const lines = ['PRAGMA foreign_keys = ON;'];

for (const statement of schemaStatements) {
  lines.push(`${statement.trim()};`);
}

for (const listing of listings) {
  const values = seedValues(listing).map(quote).join(', ');
  lines.push(`${INSERT_SEED}\n  (${values})\n  ON CONFLICT(id) DO NOTHING;`);
}

process.stdout.write(`${lines.join('\n\n')}\n`);
