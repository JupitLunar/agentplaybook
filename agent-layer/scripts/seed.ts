/**
 * Database seed script - Add sample data for development
 */

import { db, sqlite } from '../src/utils/db.js';
import { places } from '../src/models/schema-sqlite.js';
import { generateId, createSlug } from '../src/utils/id.js';

async function seed() {
  console.log('Seeding database...');

  const samplePlaces = [
    {
      name: 'Hayahay Massage & Wellness',
      vertical: 'wellness' as const,
      province: 'AB',
      city: 'calgary',
      address: '5809 Macleod Trl SW, Calgary, AB',
      phone: '(587) 832-0122',
      website: 'https://hayahaymassage.ca',
      rating: 5.0,
      reviewCount: 1116,
      tags: ['massage', 'wellness', 'spa']
    },
    {
      name: 'Massage Square',
      vertical: 'wellness' as const,
      province: 'AB',
      city: 'edmonton',
      address: '1050 91 St SW, Edmonton, AB',
      phone: '(780) 123-4567',
      website: 'https://www.massagesquareinc.com',
      rating: 4.9,
      reviewCount: 573,
      tags: ['massage', 'rmt', 'therapeutic']
    }
  ];

  for (const data of samplePlaces) {
    const id = generateId('place', data.city);
    
    await db.insert(places).values({
      id,
      name: data.name,
      slug: createSlug(data.name),
      vertical: data.vertical,
      province: data.province,
      city: data.city,
      address: data.address,
      phone: data.phone,
      website: data.website,
      rating: data.rating,
      reviewCount: data.reviewCount,
      tags: data.tags,
      images: [],
      sources: [{ kind: 'manual', externalId: id }],
      siteRefs: {},
      rawData: {}
    }).onConflictDoNothing();
    
    console.log(`  ✓ ${data.name}`);
  }

  console.log('✅ Seed complete');
}

seed().catch(console.error);
