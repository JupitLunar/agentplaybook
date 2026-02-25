/**
 * Place Service - Core business logic for places (SQLite compatible)
 */

import { db } from '../utils/db.js';
import { places, type Place, type NewPlace } from '../models/schema-sqlite.js';
import { generateId, createCursor, parseCursor } from '../utils/id.js';
import { eq, and, desc, asc } from 'drizzle-orm';
import type { SearchQuery } from '../models/validation.js';

export interface SearchResult {
  results: Place[];
  total: number;
  nextCursor?: string;
  facets?: {
    cities: Record<string, number>;
    tags: Record<string, number>;
  };
}

export class PlaceService {
  
  async getById(id: string): Promise<Place | null> {
    const result = await db.query.places.findFirst({
      where: eq(places.id, id)
    });
    return result || null;
  }

  async getBySlug(slug: string, city: string): Promise<Place | null> {
    const result = await db.query.places.findFirst({
      where: and(eq(places.slug, slug), eq(places.city, city))
    });
    return result || null;
  }

  async search(query: SearchQuery): Promise<SearchResult> {
    const { vertical, q, region, tags, minRating, limit, cursor } = query;
    
    // Get all places (SQLite doesn't have advanced JSON operators)
    // For production, add proper pagination and indexing
    let allPlaces = await db.query.places.findMany({
      orderBy: [desc(places.rating), asc(places.id)]
    });

    // Filter in JavaScript
    let filtered = allPlaces.filter(place => {
      if (place.province !== region.province) return false;
      if (place.vertical !== vertical) return false;
      if (region.city && place.city !== region.city) return false;
      
      if (q) {
        const searchTerm = q.toLowerCase();
        const nameMatch = place.name?.toLowerCase().includes(searchTerm);
        const descMatch = place.description?.toLowerCase().includes(searchTerm);
        const tagMatch = place.tags?.some((t: string) => t.toLowerCase().includes(searchTerm));
        if (!nameMatch && !descMatch && !tagMatch) return false;
      }

      if (tags?.length) {
        const hasAllTags = tags.every(tag => place.tags?.includes(tag));
        if (!hasAllTags) return false;
      }

      if (minRating !== undefined && (place.rating || 0) < minRating) return false;

      return true;
    });

    // Cursor pagination
    if (cursor) {
      try {
        const { score, id } = parseCursor(cursor);
        const idx = filtered.findIndex(p => (p.rating || 0) < score || ((p.rating || 0) === score && p.id > id));
        if (idx > 0) filtered = filtered.slice(idx);
      } catch {
        // Invalid cursor, ignore
      }
    }

    const total = filtered.length;
    const hasMore = filtered.length > limit;
    const items = hasMore ? filtered.slice(0, limit) : filtered;

    // Generate next cursor
    let nextCursor: string | undefined;
    if (hasMore && items.length > 0) {
      const last = items[items.length - 1];
      nextCursor = createCursor(last.rating || 0, last.id);
    }

    // Get facets
    const facets = !cursor ? this.calculateFacets(filtered) : undefined;

    return { results: items, total, nextCursor, facets };
  }

  async create(data: Omit<NewPlace, 'id' | 'createdAt' | 'updatedAt'>): Promise<Place> {
    const id = generateId('place', data.city);
    const now = new Date();
    
    const [place] = await db.insert(places).values({
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    }).returning();

    return place;
  }

  async update(id: string, data: Partial<NewPlace>): Promise<Place | null> {
    const [updated] = await db.update(places)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(places.id, id))
      .returning();

    return updated || null;
  }

  async upsertBySiteRef(
    siteId: string,
    externalId: string,
    data: Omit<NewPlace, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ place: Place; isNew: boolean }> {
    // For SQLite, query all places and check siteRefs in JavaScript
    const allPlaces = await db.query.places.findMany();
    const existing = allPlaces.find(p => {
      const refs = p.siteRefs as Record<string, string>;
      return refs?.[siteId] === externalId;
    });

    if (existing) {
      const mergedSiteRefs = { ...(existing.siteRefs as Record<string, string>), [siteId]: externalId };
      const updated = await this.update(existing.id, {
        ...data,
        siteRefs: mergedSiteRefs
      });
      return { place: updated!, isNew: false };
    } else {
      const place = await this.create({
        ...data,
        siteRefs: { [siteId]: externalId }
      });
      return { place, isNew: true };
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(places).where(eq(places.id, id));
    return result.changes > 0;
  }

  // ==================== Private Methods ====================

  private calculateFacets(items: Place[]): SearchResult['facets'] {
    const cities: Record<string, number> = {};
    const tags: Record<string, number> = {};

    for (const place of items) {
      cities[place.city] = (cities[place.city] || 0) + 1;
      for (const tag of (place.tags || [])) {
        tags[tag] = (tags[tag] || 0) + 1;
      }
    }

    return { cities, tags };
  }
}

export const placeService = new PlaceService();
