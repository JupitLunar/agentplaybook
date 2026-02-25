/**
 * Database connection
 * Using SQLite for development, PostgreSQL for production
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import * as schema from '../models/schema-sqlite.js';

const dbPath = process.env.DATABASE_URL?.replace('sqlite:', '') || './agent_layer.db';

const sqlite: DatabaseType = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
export { schema };
export { sqlite };
