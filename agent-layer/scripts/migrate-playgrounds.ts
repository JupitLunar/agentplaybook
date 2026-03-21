#!/usr/bin/env node
/**
 * Migrate SQLite playgrounds data to Supabase
 */

import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://lalpxtoxziyjibifibsx.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Connect to SQLite
const sqliteDb = new Database('./agent_layer.db');

async function migratePlaygrounds() {
  console.log('📦 Fetching playgrounds from SQLite...');
  
  const rows = sqliteDb.prepare('SELECT * FROM playgrounds').all();
  console.log(`Found ${rows.length} playgrounds in SQLite`);

  // Transform to unified schema
  const places = rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    slug: row.slug || row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    vertical: 'playground',
    category: 'playground',
    city: row.city,
    address: row.address,
    phone: row.phone,
    email: row.email,
    website: row.website,
    description: row.description,
    rating: row.rating || null,
    review_count: row.review_count || 0,
    lat: row.lat || null,
    lng: row.lng || null,
    raw_data: {
      age_range: row.age_range,
      activities: row.activities ? JSON.parse(row.activities) : [],
      amenities: row.amenities ? JSON.parse(row.amenities) : [],
      admission: row.admission,
      hours: row.hours ? JSON.parse(row.hours) : null
    },
    images: row.images ? JSON.parse(row.images) : [],
    is_claimed: row.is_claimed || false,
    last_verified_at: row.last_verified_at || new Date().toISOString(),
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString()
  }));

  console.log('⬆️ Uploading to Supabase...');
  
  // Insert in batches
  const batchSize = 50;
  let inserted = 0;
  
  for (let i = 0; i < places.length; i += batchSize) {
    const batch = places.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('playgrounds')
      .upsert(batch, { onConflict: 'id' });
    
    if (error) {
      console.error(`Error inserting batch ${i}:`, error);
    } else {
      inserted += batch.length;
      console.log(`✅ Inserted ${inserted}/${places.length}`);
    }
  }
  
  console.log(`\n🎉 Migration complete! ${inserted} playgrounds migrated.`);
}

migratePlaygrounds().catch(console.error).finally(() => {
  sqliteDb.close();
  process.exit(0);
});
