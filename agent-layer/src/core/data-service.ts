/**
 * Supabase Data Layer
 * Unified interface to all vertical data stored in Supabase
 * Supports hybrid mode: Supabase for clinics, SQLite for local playgrounds
 */

import { createClient } from '@supabase/supabase-js';
import Database from 'better-sqlite3';
import type { 
  UnifiedPlace, 
  VerticalType, 
  SearchIntent, 
  ClinicAttributes, 
  PlaygroundAttributes,
  WellnessAttributes 
} from './schema.js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://lalpxtoxziyjibifibsx.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Initialize SQLite for local playgrounds (fallback when Supabase table doesn't exist)
let sqliteDb: Database.Database | null = null;
try {
  sqliteDb = new Database('/tmp/agent_layer_v2.db');
  console.log('[DataService] SQLite connected for playgrounds');
} catch (err) {
  console.warn('[DataService] SQLite not available:', (err as Error).message);
}

// Table mapping for verticals
const VERTICAL_TABLES: Record<VerticalType, string> = {
  clinic: 'clinics',
  playground: 'playgrounds',
  wellness: 'wellness',
  travel: 'travel_places',
  food: 'food_places',
  industrial: 'industrial_services'
};

/**
 * Transform Supabase clinic row to UnifiedPlace
 */
function transformClinic(row: any): UnifiedPlace {
  const attributes: ClinicAttributes = {
    isWalkIn: row.is_walk_in || false,
    acceptingNewPatients: row.accepting_new_patients || false,
    services: row.services || [],
    specialties: row.raw_data?.specialties,
    physicians: row.raw_data?.physicians
  };

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    vertical: 'clinic',
    category: row.raw_data?.category || 'clinic',
    subcategories: row.services,
    location: {
      address: row.address,
      city: row.city,
      province: row.city === 'calgary' ? 'AB' : 'AB', // Infer from city
      postalCode: row.postal_code,
      country: 'CA',
      coordinates: row.lat && row.lng ? { lat: row.lat, lng: row.lng } : undefined
    },
    contact: {
      phone: row.phone,
      email: row.email,
      website: row.website
    },
    description: row.raw_data?.description,
    images: [], // Clinics don't have images in current schema
    rating: row.rating,
    reviewCount: row.review_count || 0,
    attributes,
    availability: row.working_hours ? {
      hours: row.working_hours
    } : undefined,
    tags: [
      ...(row.services || []),
      ...(row.languages || []),
      row.is_walk_in ? 'walk-in' : null,
      row.accepting_new_patients ? 'accepting-new-patients' : null
    ].filter(Boolean) as string[],
    languages: row.languages,
    source: {
      type: 'supabase',
      table: 'clinics',
      externalId: row.slug,
      lastVerified: new Date(row.last_verified_at || row.updated_at),
      claimed: row.is_claimed || false
    },
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

/**
 * Transform Supabase playground row to UnifiedPlace
 */
function transformPlayground(row: any): UnifiedPlace {
  const raw = row.raw_data || {};
  const attributes: PlaygroundAttributes = {
    ageRange: raw.ageRange ? 
      (typeof raw.ageRange === 'string' ? 
        parseAgeRange(raw.ageRange) : 
        raw.ageRange) : 
      { min: 0, max: 12 },
    features: raw.features || [],
    capacity: raw.capacity,
    partyPackages: raw.partyPackages || false,
    admissionFee: raw.admissionFee,
    supervisionRequired: raw.supervisionRequired,
    safetyCertifications: raw.safetyCertifications
  };

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    vertical: 'playground',
    category: raw.category || 'indoor-playground',
    location: {
      address: row.address,
      city: row.city,
      province: 'AB',
      country: 'CA',
      coordinates: row.lat && row.lng ? { lat: row.lat, lng: row.lng } : undefined
    },
    contact: {
      phone: row.phone,
      website: row.website
    },
    description: raw.description,
    images: raw.images || [],
    rating: row.rating,
    reviewCount: row.review_count || 0,
    attributes,
    tags: [
      ...(raw.tags || []),
      ...(raw.features || []),
      raw.partyPackages ? 'birthday-parties' : null
    ].filter(Boolean) as string[],
    amenities: raw.features,
    source: {
      type: 'supabase',
      table: 'playgrounds',
      externalId: row.slug,
      lastVerified: new Date(row.updated_at),
      claimed: false
    },
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

/**
 * Transform SQLite playground row to UnifiedPlace
 */
function transformPlaygroundSQLite(row: any): UnifiedPlace {
  const attributes: PlaygroundAttributes = {
    ageRange: row.age_range ? parseAgeRange(row.age_range) : { min: 0, max: 12 },
    features: row.features ? row.features.split(',') : [],
    partyPackages: row.tags?.includes('birthday-parties') || false
  };

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    vertical: 'playground',
    category: row.category || 'indoor-playground',
    location: {
      address: row.address,
      city: row.city,
      province: row.province || 'AB',
      country: 'CA',
      coordinates: row.lat && row.lng ? { lat: row.lat, lng: row.lng } : undefined
    },
    contact: {
      phone: row.phone,
      website: row.website
    },
    description: undefined,
    images: [],
    rating: row.rating,
    reviewCount: 0,
    attributes,
    tags: row.tags ? row.tags.split(',') : [],
    amenities: row.features ? row.features.split(',') : [],
    source: {
      type: 'sqlite',
      table: 'playgrounds',
      externalId: row.slug,
      lastVerified: new Date(row.created_at),
      claimed: false
    },
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.created_at)
  };
}

/**
 * Parse age range string like "0-12 years" to object
 */
function parseAgeRange(range: string): { min: number; max?: number } {
  const match = range.match(/(\d+)(?:\s*-\s*(\d+))?/);
  if (!match) return { min: 0 };
  return {
    min: parseInt(match[1]),
    max: match[2] ? parseInt(match[2]) : undefined
  };
}

/**
 * Unified Data Service
 */
export class DataService {
  
  /**
   * Search places across all or specific verticals
   */
  async search(intent: SearchIntent): Promise<{ places: UnifiedPlace[]; total: number }> {
    const { vertical, location, filters, query } = intent;
    
    // If vertical specified, search that table
    if (vertical) {
      return this.searchVertical(vertical, { location, filters, query });
    }
    
    // Otherwise search all verticals (parallel)
    const verticals: VerticalType[] = ['clinic', 'playground', 'wellness'];
    const results = await Promise.all(
      verticals.map(v => this.searchVertical(v, { location, filters, query }).catch(() => ({ places: [], total: 0 })))
    );
    
    const allPlaces = results.flatMap(r => r.places);
    return { places: allPlaces, total: allPlaces.length };
  }
  
  /**
   * Search specific vertical
   */
  private async searchVertical(
    vertical: VerticalType, 
    params: { location?: SearchIntent['location']; filters?: Record<string, any>; query?: string }
  ): Promise<{ places: UnifiedPlace[]; total: number }> {
    // For playgrounds, try SQLite first (local fallback)
    if (vertical === 'playground' && sqliteDb) {
      return this.searchPlaygroundsSQLite(params);
    }
    
    const table = VERTICAL_TABLES[vertical];
    
    let dbQuery = supabase
      .from(table)
      .select('*', { count: 'exact' });
    
    // Apply location filters
    if (params.location?.city) {
      dbQuery = dbQuery.ilike('city', params.location.city);
    }
    
    // Apply text search if query provided
    if (params.query) {
      dbQuery = dbQuery.or(`name.ilike.%${params.query}%,address.ilike.%${params.query}%`);
    }
    
    // Apply vertical-specific filters
    if (vertical === 'clinic' && params.filters) {
      if (params.filters.isWalkIn) {
        dbQuery = dbQuery.eq('is_walk_in', true);
      }
      if (params.filters.acceptingNewPatients) {
        dbQuery = dbQuery.eq('accepting_new_patients', true);
      }
    }
    
    // Limit results
    dbQuery = dbQuery.limit(params.filters?.limit || 20);
    
    const { data, error, count } = await dbQuery;
    
    if (error) {
      console.error(`[DataService] Error searching ${vertical}:`, error);
      // Fallback to SQLite for playgrounds if Supabase fails
      if (vertical === 'playground' && sqliteDb) {
        return this.searchPlaygroundsSQLite(params);
      }
      return { places: [], total: 0 };
    }
    
    // Transform to unified format
    const transformFn = vertical === 'clinic' ? transformClinic : 
                       vertical === 'playground' ? transformPlayground :
                       transformPlayground; // fallback
    
    const places = (data || []).map(transformFn);
    return { places, total: count || places.length };
  }
  
  /**
   * Search playgrounds from SQLite (local fallback)
   */
  private searchPlaygroundsSQLite(
    params: { location?: SearchIntent['location']; filters?: Record<string, any>; query?: string }
  ): { places: UnifiedPlace[]; total: number } {
    if (!sqliteDb) {
      return { places: [], total: 0 };
    }
    
    try {
      let sql = 'SELECT * FROM playgrounds WHERE 1=1';
      const queryParams: any[] = [];
      
      // Apply location filter
      if (params.location?.city) {
        sql += ' AND LOWER(city) = LOWER(?)';
        queryParams.push(params.location.city);
      }
      
      // Apply text search
      if (params.query) {
        sql += ' AND (LOWER(name) LIKE ? OR LOWER(address) LIKE ?)';
        const searchTerm = `%${params.query.toLowerCase()}%`;
        queryParams.push(searchTerm, searchTerm);
      }
      
      sql += ' ORDER BY rating DESC';
      
      // Apply limit
      const limit = params.filters?.limit || 20;
      sql += ' LIMIT ?';
      queryParams.push(limit);
      
      const stmt = sqliteDb.prepare(sql);
      const rows = stmt.all(...queryParams);
      
      const places = rows.map((row: any) => transformPlaygroundSQLite(row));
      
      // Get total count
      const countStmt = sqliteDb.prepare('SELECT COUNT(*) as count FROM playgrounds');
      const countResult = countStmt.get() as { count: number };
      
      return { places, total: countResult.count };
    } catch (err) {
      console.error('[DataService] SQLite error:', err);
      return { places: [], total: 0 };
    }
  }
  
  /**
   * Get place by ID
   */
  async getById(id: string, vertical?: VerticalType): Promise<UnifiedPlace | null> {
    // If vertical specified, search that table
    if (vertical) {
      const table = VERTICAL_TABLES[vertical];
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) return null;
      
      const transformFn = vertical === 'clinic' ? transformClinic : transformPlayground;
      return transformFn(data);
    }
    
    // Otherwise search all tables
    const verticals: VerticalType[] = ['clinic', 'playground'];
    for (const v of verticals) {
      const place = await this.getById(id, v);
      if (place) return place;
    }
    
    return null;
  }
  
  /**
   * Get place by slug and city
   */
  async getBySlug(slug: string, city: string, vertical?: VerticalType): Promise<UnifiedPlace | null> {
    if (vertical) {
      const table = VERTICAL_TABLES[vertical];
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('slug', slug)
        .ilike('city', city)
        .single();
      
      if (error || !data) return null;
      
      const transformFn = vertical === 'clinic' ? transformClinic : transformPlayground;
      return transformFn(data);
    }
    
    // Search all verticals
    const verticals: VerticalType[] = ['clinic', 'playground'];
    for (const v of verticals) {
      const place = await this.getBySlug(slug, city, v);
      if (place) return place;
    }
    
    return null;
  }
  
  /**
   * Get counts by city for a vertical
   */
  async getCityCounts(vertical: VerticalType): Promise<Record<string, number>> {
    // For playgrounds, use SQLite if available
    if (vertical === 'playground' && sqliteDb) {
      try {
        const stmt = sqliteDb.prepare('SELECT city, COUNT(*) as count FROM playgrounds GROUP BY city');
        const rows = stmt.all() as Array<{ city: string; count: number }>;
        const counts: Record<string, number> = {};
        for (const row of rows) {
          counts[row.city.toLowerCase()] = row.count;
        }
        return counts;
      } catch (err) {
        console.error('[DataService] SQLite getCityCounts error:', err);
        return {};
      }
    }
    
    const table = VERTICAL_TABLES[vertical];
    const { data, error } = await supabase
      .from(table)
      .select('city');
    
    if (error || !data) return {};
    
    const counts: Record<string, number> = {};
    for (const row of data) {
      const city = row.city?.toLowerCase();
      if (city) {
        counts[city] = (counts[city] || 0) + 1;
      }
    }
    
    return counts;
  }
}

export const dataService = new DataService();
