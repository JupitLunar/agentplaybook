/**
 * Base Site Connector class
 */

import { placeService } from '../services/placeService.js';
import { createSlug } from '../utils/id.js';
import type { Place } from '../models/schema-sqlite.js';

// Raw data from external sites
export interface RawPlace {
  id: string;
  name: string;
  city: string;
  province: string;
  category: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  ratingCount?: number;
  reviews?: Array<{
    author: string;
    rating: number;
    text: string;
  }>;
  image?: { url?: string };
  images?: Array<{ url?: string }>;
  tags?: string[];
  latitude?: number;
  longitude?: number;
  // Extended fields for specific connectors
  description?: string;
  email?: string;
  hours?: Record<string, string>;
  features?: string[];
  ageRange?: string;
  admissionFee?: string;
}

export interface SyncResult {
  siteId: string;
  created: number;
  updated: number;
  errors: string[];
  duration: number;
}

export abstract class SiteConnector {
  abstract siteId: string;
  abstract vertical: string;
  
  abstract fetchAll(): Promise<RawPlace[]>;
  
  async sync(): Promise<SyncResult> {
    const start = Date.now();
    const result: SyncResult = {
      siteId: this.siteId,
      created: 0,
      updated: 0,
      errors: [],
      duration: 0
    };

    try {
      const places = await this.fetchAll();
      
      for (const raw of places) {
        try {
          const transformed = this.transform(raw);
          const { isNew } = await placeService.upsertBySiteRef(
            this.siteId,
            raw.id,
            transformed
          );
          
          if (isNew) result.created++;
          else result.updated++;
        } catch (err: any) {
          result.errors.push(`${raw.id}: ${err.message}`);
        }
      }
    } catch (err: any) {
      result.errors.push(`Fetch failed: ${err.message}`);
    }

    result.duration = Date.now() - start;
    return result;
  }

  protected transform(raw: RawPlace): Omit<Place, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      name: raw.name,
      slug: createSlug(raw.name),
      vertical: this.vertical as any,
      province: (raw.province || 'AB').toUpperCase(),
      city: raw.city.toLowerCase(),
      neighborhood: null,
      address: raw.address,
      lat: raw.latitude || null,
      lng: raw.longitude || null,
      phone: raw.phone || null,
      website: raw.website || null,
      bookingUrl: null,
      description: null,
      images: this.extractImages(raw),
      tags: raw.tags || [raw.category],
      rating: raw.rating || null,
      reviewCount: raw.ratingCount || 0,
      sources: [{
        kind: 'partner',
        externalId: raw.id,
        url: raw.website
      }],
      lastVerified: new Date(),
      siteRefs: {},
      rawData: raw
    };
  }

  private extractImages(raw: RawPlace): string[] {
    const images: string[] = [];
    if (raw.image?.url) images.push(raw.image.url);
    if (raw.images) {
      raw.images.forEach(img => {
        if (img.url) images.push(img.url);
      });
    }
    return images;
  }
}
