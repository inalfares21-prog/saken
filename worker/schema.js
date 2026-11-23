/**
 * D1 schema. Every statement is idempotent so the Worker can apply it on the
 * first request of an isolate (there is no deploy-time migration step).
 */
export const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'tenant',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS listings (
    id TEXT PRIMARY KEY,
    owner_id TEXT,
    kind TEXT NOT NULL DEFAULT 'rental',
    type TEXT,
    title TEXT NOT NULL,
    city TEXT NOT NULL,
    district TEXT,
    wilaya TEXT,
    price INTEGER NOT NULL,
    price_unit TEXT NOT NULL DEFAULT 'month',
    beds INTEGER NOT NULL DEFAULT 1,
    baths INTEGER NOT NULL DEFAULT 1,
    area INTEGER NOT NULL DEFAULT 0,
    guests INTEGER NOT NULL DEFAULT 1,
    furnished INTEGER NOT NULL DEFAULT 0,
    available TEXT,
    rating REAL NOT NULL DEFAULT 0,
    reviews INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    featured INTEGER NOT NULL DEFAULT 0,
    badge TEXT,
    amenities TEXT NOT NULL DEFAULT '[]',
    description TEXT,
    owner_name TEXT,
    owner_role TEXT,
    owner_since INTEGER,
    owner_verified INTEGER NOT NULL DEFAULT 0,
    owner_response TEXT,
    hotel_stars INTEGER,
    hotel_check_in TEXT,
    hotel_check_out TEXT,
    contact_name TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    status TEXT NOT NULL DEFAULT 'published',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE INDEX IF NOT EXISTS listings_kind_status ON listings (kind, status)`,
  `CREATE INDEX IF NOT EXISTS listings_city ON listings (city)`,
  `CREATE INDEX IF NOT EXISTS listings_owner ON listings (owner_id)`,

  `CREATE TABLE IF NOT EXISTS enquiries (
    id TEXT PRIMARY KEY,
    listing_id TEXT,
    user_id TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE INDEX IF NOT EXISTS enquiries_listing ON enquiries (listing_id)`,

  `CREATE TABLE IF NOT EXISTS favorites (
    user_id TEXT NOT NULL,
    listing_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, listing_id)
  )`,
];
