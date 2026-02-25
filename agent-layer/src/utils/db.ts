/**
 * Database connection
 * Using SQLite for development, PostgreSQL for production
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import * as schema from '../models/schema-sqlite.js';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

// Use /data for Render, or local path for development
const defaultDbPath = process.env.NODE_ENV === 'production' ? '/data/agent_layer.db' : './agent_layer.db';
const dbPath = process.env.DATABASE_URL?.replace('sqlite:', '') || defaultDbPath;

// Ensure directory exists
const dbDir = dirname(dbPath);
try {
  mkdirSync(dbDir, { recursive: true });
} catch (e) {
  // Directory may already exist or permission denied
}

const sqlite: DatabaseType = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
export { schema };
export { sqlite };
