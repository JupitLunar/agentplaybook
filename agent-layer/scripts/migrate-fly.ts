/**
 * Database migration script for Fly.io PostgreSQL
 * Run this after deployment to set up the database
 */

import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { migrateClient, db } from '../src/utils/db-postgres.js';
import * as schema from '../src/models/schema.js';

async function runMigration() {
  console.log('🔄 Starting database migration...');
  
  try {
    // Run migrations
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Migrations completed');

    // Verify connection
    const result = await migrateClient`SELECT NOW()`;
    console.log('📅 Database time:', result[0].now);

    // Get table counts
    const tables = ['places', 'leads', 'api_keys'];
    for (const table of tables) {
      try {
        const count = await migrateClient`SELECT COUNT(*) FROM ${migrateClient(table)}`;
        console.log(`📊 ${table}: ${count[0].count} rows`);
      } catch (err) {
        console.log(`⚠️  Could not count ${table}: ${err.message}`);
      }
    }

    console.log('🎉 Database setup complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await migrateClient.end();
  }
}

runMigration();
