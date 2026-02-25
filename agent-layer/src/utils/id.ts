/**
 * ID generation utilities
 */

import { nanoid } from 'nanoid';

export function generateId(prefix: string, namespace?: string): string {
  const ns = namespace ? `${namespace}_` : '';
  return `${prefix}_${ns}${nanoid(12)}`;
}

export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function createCursor(score: number, id: string): string {
  return Buffer.from(`${score}:${id}`).toString('base64url');
}

export function parseCursor(cursor: string): { score: number; id: string } {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString();
    const [score, id] = decoded.split(':');
    return { score: parseFloat(score), id };
  } catch {
    throw new Error('Invalid cursor');
  }
}
