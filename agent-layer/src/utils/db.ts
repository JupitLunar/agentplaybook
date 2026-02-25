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

// Use /data for Render (if disk mounted), /tmp as fallback, or local path for dev
function getDbPath(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL.replace('sqlite:', '');
  }
  
  // Try /data first (Render disk), fallback to /tmp
  const paths = ['/data/agent_layer.db', '/tmp/agent_layer.db', './agent_layer.db'];
  for (const path of paths) {
    try {
      const dir = dirname(path);
      mkdirSync(dir, { recursive: true });
      // Test if directory is writable
      const testFile = `${dir}/.write_test`;
      import('fs').then(fs => {
        fs.writeFileSync(testFile, '');
        fs.unlinkSync(testFile);
      });
      console.log(`Using database path: ${path}`);
      return path;
    } catch (e) {
      console.log(`Cannot use ${path}, trying next...`);
    }
  }
  return './agent_layer.db';
}

const dbPath = getDbPath();

// Ensure directory exists
try {
  mkdirSync(dirname(dbPath), { recursive: true });
} catch (e) {
  console.error('Failed to create database directory:', e);
}

console.log(`Opening database at: ${dbPath}`);
const sqlite: DatabaseType = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
export { schema };
export { sqlite };
