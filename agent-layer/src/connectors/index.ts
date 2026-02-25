/**
 * Site Connectors - Extract data from existing sites and sync to Alberta Graph
 */

import fs from 'fs/promises';
import path from 'path';

// Re-export from base
export { SiteConnector, type RawPlace, type SyncResult } from './base.js';

// Import additional connectors
import { EdmontonPlaygroundConnector, AlbertaClinicsConnector, ABControlConnector } from './additional.js';

// Registry of all connectors
export const connectors: import('./base.js').SiteConnector[] = [];

export function registerConnector(connector: import('./base.js').SiteConnector) {
  connectors.push(connector);
}

// Auto-register default connectors
export function registerDefaultConnectors() {
  registerConnector(new EdmontonPlaygroundConnector());
  registerConnector(new AlbertaClinicsConnector());
  registerConnector(new ABControlConnector());
}

/**
 * Sync all registered sites
 */
export async function syncAllSites(): Promise<import('./base.js').SyncResult[]> {
  const results: import('./base.js').SyncResult[] = [];
  
  for (const connector of connectors) {
    console.log(`[Sync] Starting ${connector.siteId}...`);
    const result = await connector.sync();
    results.push(result);
    console.log(`[Sync] ${connector.siteId}: +${result.created} new, ~${result.updated} updated, ${result.errors.length} errors (${result.duration}ms)`);
  }
  
  return results;
}

/**
 * JSON File connector - reads from local JSON files
 */
export class JsonFileConnector extends (await import('./base.js')).SiteConnector {
  constructor(
    public siteId: string,
    public vertical: string,
    private filePath: string
  ) {
    super();
  }

  async fetchAll(): Promise<import('./base.js').RawPlace[]> {
    const content = await fs.readFile(this.filePath, 'utf8');
    return JSON.parse(content);
  }
}

/**
 * Calgarywellness data connector
 */
export class CalgarywellnessConnector extends (await import('./base.js')).SiteConnector {
  siteId = 'calgarywellness';
  vertical = 'wellness';
  
  private dataDir: string;
  
  constructor(dataDir: string) {
    super();
    this.dataDir = dataDir;
  }

  async fetchAll(): Promise<import('./base.js').RawPlace[]> {
    const places: import('./base.js').RawPlace[] = [];
    
    // Read all city/category combinations
    const cities = ['calgary', 'edmonton'];
    const categories = ['massages', 'spas'];
    
    for (const city of cities) {
      for (const category of categories) {
        try {
          const filePath = path.join(this.dataDir, city, `${category}.json`);
          const content = await fs.readFile(filePath, 'utf8');
          const data = JSON.parse(content);
          
          if (Array.isArray(data)) {
            // Add category tag to each place
            data.forEach((place: import('./base.js').RawPlace) => {
              place.category = category.slice(0, -1); // 'massages' -> 'massage'
              places.push(place);
            });
          }
        } catch (err) {
          console.warn(`[${this.siteId}] Could not read ${city}/${category}.json`);
        }
      }
    }
    
    return places;
  }
}
