/**
 * Alberta Graph - Database Schema
 * Single source of truth for all places across Jing's portfolio
 */

import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  jsonb, 
  real, 
  integer,
  boolean,
  index,
  uniqueIndex,
  pgEnum
} from 'drizzle-orm/pg-core';

// ==================== Enums ====================

export const verticalEnum = pgEnum('vertical', [
  'wellness', 
  'travel', 
  'clinic', 
  'playground',
  'industrial'
]);

export const sourceKindEnum = pgEnum('source_kind', [
  'google_places',
  'osm', 
  'official_site',
  'manual',
  'partner'
]);

export const leadStatusEnum = pgEnum('lead_status', [
  'new',
  'contacted',
  'qualified',
  'closed',
  'converted'
]);

export const priorityEnum = pgEnum('priority', [
  'low',
  'medium', 
  'high'
]);

// ==================== Core Tables ====================

export const places = pgTable('places', {
  // Primary ID - stable global ID
  id: varchar('id', { length: 64 }).primaryKey(),
  
  // Core info
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  vertical: verticalEnum('vertical').notNull(),
  
  // Location (indexed for fast region queries)
  province: varchar('province', { length: 8 }).notNull(),
  city: varchar('city', { length: 64 }).notNull(),
  neighborhood: varchar('neighborhood', { length: 64 }),
  address: text('address'),
  lat: real('lat'),
  lng: real('lng'),
  
  // Contact
  phone: varchar('phone', { length: 32 }),
  website: text('website'),
  bookingUrl: text('booking_url'),
  
  // Content
  description: text('description'),
  images: jsonb('images').$type<string[]>().default([]).notNull(),
  tags: jsonb('tags').$type<string[]>().default([]).notNull(),
  
  // Social proof
  rating: real('rating'),
  reviewCount: integer('review_count').default(0),
  
  // Trust signals
  sources: jsonb('sources').$type<SourceRef[]>().default([]).notNull(),
  lastVerified: timestamp('last_verified', { withTimezone: true }),
  
  // Cross-site mapping: site_id -> external_id
  siteRefs: jsonb('site_refs').$type<Record<string, string>>().default({}).notNull(),
  
  // Raw data backup
  rawData: jsonb('raw_data').default({}),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  // Search indexes
  provinceIdx: index('places_province_idx').on(table.province),
  cityIdx: index('places_city_idx').on(table.city),
  verticalIdx: index('places_vertical_idx').on(table.vertical),
  tagsIdx: index('places_tags_idx').using('gin', table.tags),
  geoIdx: index('places_geo_idx').on(table.lat, table.lng),
  
  // Unique constraint: slug must be unique per city
  slugCityUnique: uniqueIndex('places_slug_city_idx').on(table.slug, table.city),
}));

// ==================== Leads Table ====================

export const leads = pgTable('leads', {
  id: varchar('id', { length: 64 }).primaryKey(),
  
  // Action type
  actionType: varchar('action_type', { length: 64 }).notNull(),
  vertical: verticalEnum('vertical').notNull(),
  
  // Region
  province: varchar('province', { length: 8 }).notNull(),
  city: varchar('city', { length: 64 }),
  
  // Contact
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 32 }),
  name: varchar('name', { length: 128 }),
  
  // Request details
  placeIds: jsonb('place_ids').$type<string[]>().default([]).notNull(),
  message: text('message'),
  requirements: text('requirements'),
  payload: jsonb('payload').default({}),
  
  // Tracking
  status: leadStatusEnum('status').default('new').notNull(),
  priority: priorityEnum('priority').default('medium').notNull(),
  assignedTo: varchar('assigned_to', { length: 64 }),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  statusIdx: index('leads_status_idx').on(table.status),
  emailIdx: index('leads_email_idx').on(table.email),
  createdIdx: index('leads_created_idx').on(table.createdAt),
}));

// ==================== API Keys Table ====================

export const apiKeys = pgTable('api_keys', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: varchar('name', { length: 128 }).notNull(),
  keyHash: varchar('key_hash', { length: 255 }).notNull().unique(),
  scopes: jsonb('scopes').$type<string[]>().default(['read']).notNull(),
  rateLimit: integer('rate_limit').default(100).notNull(), // per minute
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true).notNull(),
});

// ==================== Types ====================

export interface SourceRef {
  kind: 'google_places' | 'osm' | 'official_site' | 'manual' | 'partner';
  url?: string;
  externalId?: string;
  fetchedAt?: string;
}

// Drizzle inferred types
export type Place = typeof places.$inferSelect;
export type NewPlace = typeof places.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
