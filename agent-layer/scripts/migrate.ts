/**
 * Database migration script
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/agent_layer';

async function runMigrations() {
  console.log('Running migrations...');
  console.log(`Database: ${connectionString.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')}`);
  
  const client = postgres(connectionString, { max: 1 });
  
  await migrate(drizzle(client), {
    migrationsFolder: './drizzle'
  });
  
  console.log('✅ Migrations complete');
  await client.end();
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
