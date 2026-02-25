/**
 * SQLite Migration - Create tables
 */

import { sqlite } from '../src/utils/db.js';

console.log('Creating SQLite tables...');

// Create places table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS places (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    vertical TEXT NOT NULL,
    province TEXT NOT NULL,
    city TEXT NOT NULL,
    neighborhood TEXT,
    address TEXT,
    lat REAL,
    lng REAL,
    phone TEXT,
    website TEXT,
    booking_url TEXT,
    description TEXT,
    images TEXT DEFAULT '[]',
    tags TEXT DEFAULT '[]',
    rating REAL,
    review_count INTEGER DEFAULT 0,
    sources TEXT DEFAULT '[]',
    last_verified INTEGER,
    site_refs TEXT DEFAULT '{}',
    raw_data TEXT DEFAULT '{}',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
`);

// Create leads table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    action_type TEXT NOT NULL,
    vertical TEXT NOT NULL,
    province TEXT NOT NULL,
    city TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    name TEXT,
    place_ids TEXT DEFAULT '[]',
    message TEXT,
    requirements TEXT,
    payload TEXT DEFAULT '{}',
    status TEXT DEFAULT 'new',
    priority TEXT DEFAULT 'medium',
    assigned_to TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
`);

// Create api_keys table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    scopes TEXT DEFAULT '["read"]',
    rate_limit INTEGER DEFAULT 100,
    created_at INTEGER NOT NULL,
    last_used_at INTEGER,
    expires_at INTEGER,
    is_active INTEGER DEFAULT 1
  );
`);

// Create indexes
sqlite.exec(`CREATE INDEX IF NOT EXISTS places_province_idx ON places(province);`);
sqlite.exec(`CREATE INDEX IF NOT EXISTS places_city_idx ON places(city);`);
sqlite.exec(`CREATE INDEX IF NOT EXISTS places_vertical_idx ON places(vertical);`);
sqlite.exec(`CREATE INDEX IF NOT EXISTS places_slug_city_idx ON places(slug, city);`);
sqlite.exec(`CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);`);
sqlite.exec(`CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);`);

console.log('✅ Tables created');
