/**
 * Database connection
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../models/schema-sqlite.js';

const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/agent_layer';

// Client for queries
const queryClient = postgres(connectionString, { 
  prepare: false,
  max: 10
});

export const db = drizzle(queryClient, { schema });

// Client for migrations (single connection)
export const migrateClient = postgres(connectionString, { max: 1 });

export { schema };
