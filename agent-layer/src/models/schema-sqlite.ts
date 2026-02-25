/**
 * Alberta Graph - Database Schema (SQLite compatible)
 */

import { 
  sqliteTable, 
  text, 
  integer,
  real
} from 'drizzle-orm/sqlite-core';

// ==================== Core Tables ====================

export const places = sqliteTable('places', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  vertical: text('vertical').notNull(), // 'wellness' | 'travel' | 'clinic' | 'playground' | 'industrial'
  
  // Location
  province: text('province').notNull(),
  city: text('city').notNull(),
  neighborhood: text('neighborhood'),
  address: text('address'),
  lat: real('lat'),
  lng: real('lng'),
  
  // Contact
  phone: text('phone'),
  website: text('website'),
  bookingUrl: text('booking_url'),
  
  // Content
  description: text('description'),
  images: text('images', { mode: 'json' }).$type<string[]>().default([]),
  tags: text('tags', { mode: 'json' }).$type<string[]>().default([]),
  
  // Social proof
  rating: real('rating'),
  reviewCount: integer('review_count').default(0),
  
  // Trust signals
  sources: text('sources', { mode: 'json' }).default('[]'),
  lastVerified: integer('last_verified', { mode: 'timestamp' }),
  
  // Cross-site mapping
  siteRefs: text('site_refs', { mode: 'json' }).default('{}'),
  
  // Raw data backup
  rawData: text('raw_data', { mode: 'json' }).default('{}'),
  
  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const leads = sqliteTable('leads', {
  id: text('id').primaryKey(),
  
  actionType: text('action_type').notNull(),
  vertical: text('vertical').notNull(),
  
  // Region
  province: text('province').notNull(),
  city: text('city'),
  
  // Contact
  email: text('email').notNull(),
  phone: text('phone'),
  name: text('name'),
  
  // Request details
  placeIds: text('place_ids', { mode: 'json' }).$type<string[]>().default([]),
  message: text('message'),
  requirements: text('requirements'),
  payload: text('payload', { mode: 'json' }).default('{}'),
  
  // Tracking
  status: text('status').default('new'), // 'new' | 'contacted' | 'qualified' | 'closed' | 'converted'
  priority: text('priority').default('medium'), // 'low' | 'medium' | 'high'
  assignedTo: text('assigned_to'),
  
  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const apiKeys = sqliteTable('api_keys', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  keyHash: text('key_hash').notNull().unique(),
  scopes: text('scopes', { mode: 'json' }).$type<string[]>().default(['read']),
  rateLimit: integer('rate_limit').default(100),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

// ==================== Types ====================

export interface SourceRef {
  kind: 'google_places' | 'osm' | 'official_site' | 'manual' | 'partner';
  url?: string;
  externalId?: string;
  fetchedAt?: string;
}

export type Place = typeof places.$inferSelect;
export type NewPlace = typeof places.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
