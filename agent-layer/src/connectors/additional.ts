/**
 * Site Connectors - Additional connectors for more sites
 */

import { SiteConnector, type RawPlace } from './base.js';
import type { Place } from '../models/schema-sqlite.js';

/**
 * EdmontonPlayground Connector
 * Syncs indoor playgrounds in Edmonton area
 */
export class EdmontonPlaygroundConnector extends SiteConnector {
  siteId = 'edmontonplayground';
  vertical = 'playground';

  private dataUrl: string;

  constructor(dataUrl?: string) {
    super();
    this.dataUrl = dataUrl || process.env.EDMONTONPLAYGROUND_DATA_URL || '';
  }

  async fetchAll(): Promise<RawPlace[]> {
    // If we have a data URL, fetch from it
    if (this.dataUrl) {
      try {
        const response = await fetch(this.dataUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json() as RawPlace[];
      } catch (err: any) {
        console.warn(`[${this.siteId}] Failed to fetch from URL: ${err.message}`);
      }
    }

    // Fallback: return sample data structure for Edmonton area playgrounds
    // In production, this would scrape or fetch from the actual site
    return [
      {
        id: 'launchpad-trampoline',
        name: 'Launchpad Trampoline Park',
        city: 'edmonton',
        province: 'AB',
        category: 'indoor-playground',
        address: '6141 Currents Dr NW, Edmonton, AB T6W 0L7',
        phone: '(780) 760-5867',
        website: 'https://launchpadtrampoline.ca',
        rating: 4.5,
        ratingCount: 234,
        tags: ['trampoline', 'birthday-parties', 'toddler-friendly'],
        description: 'Indoor trampoline park with foam pits, dodgeball, and birthday party packages.',
        features: ['Trampolines', 'Foam Pit', 'Dodgeball', 'Cafe', 'Party Rooms'],
        ageRange: 'All ages',
        latitude: 53.4269,
        longitude: -113.6224
      },
      {
        id: 'funderdome',
        name: 'Edmonton Funderdome',
        city: 'edmonton',
        province: 'AB',
        category: 'indoor-playground',
        address: '10325 51 Ave NW, Edmonton, AB T6H 0K7',
        phone: '(780) 436-3833',
        website: 'https://edmontonfunderdome.ca',
        rating: 4.3,
        ratingCount: 187,
        tags: ['indoor-playground', 'climbing', 'slides', 'birthday-parties'],
        description: 'Large indoor playground featuring climbing structures, slides, and soft play areas.',
        features: ['Climbing Structures', 'Slides', 'Ball Pit', 'Cafe', 'Private Party Rooms'],
        ageRange: '0-12 years',
        latitude: 53.4878,
        longitude: -113.4965
      },
      {
        id: 'treehouse',
        name: 'The Edmonton Treehouse',
        city: 'edmonton',
        province: 'AB',
        category: 'indoor-playground',
        address: '10104 103 Ave NW, Edmonton, AB T5J 0H8',
        phone: '(780) 990-8733',
        website: 'https://edmontontreehouse.ca',
        rating: 4.6,
        ratingCount: 156,
        tags: ['indoor-playground', 'toddler-zone', 'cafe', 'wifi'],
        description: 'Multi-level indoor playground with dedicated toddler area and parent-friendly amenities.',
        features: ['Multi-level Structure', 'Toddler Zone', 'Parent Lounge', 'WiFi', 'Coffee Bar'],
        ageRange: '0-10 years',
        latitude: 53.5452,
        longitude: -113.4938
      },
      {
        id: 'lollipop',
        name: 'Lollipop Playland',
        city: 'st-albert',
        province: 'AB',
        category: 'indoor-playground',
        address: '700 St Albert Trail, St Albert, AB T8N 7A5',
        phone: '(780) 459-8687',
        website: 'https://lollipopplayland.com',
        rating: 4.4,
        ratingCount: 203,
        tags: ['indoor-playground', 'toddler-friendly', 'birthday-parties'],
        description: 'Bright and colorful indoor playground with multiple play zones for different age groups.',
        features: ['Play Zones', 'Toddler Area', 'Party Rooms', 'Snack Bar'],
        ageRange: '0-8 years',
        latitude: 53.6532,
        longitude: -113.6242
      },
      {
        id: 'shakers',
        name: 'Shakers Fun Centre',
        city: 'edmonton',
        province: 'AB',
        category: 'indoor-playground',
        address: '1725 99 St NW, Edmonton, AB T6N 1K5',
        phone: '(780) 466-4626',
        website: 'https://shakersfuncentre.com',
        rating: 4.2,
        ratingCount: 312,
        tags: ['indoor-playground', 'arcade', 'laser-tag', 'go-karts'],
        description: 'Family fun centre with indoor playground, arcade games, laser tag, and go-karts.',
        features: ['Indoor Playground', 'Arcade', 'Laser Tag', 'Go-Karts', 'Mini Golf'],
        ageRange: 'All ages',
        latitude: 53.4456,
        longitude: -113.4723
      }
    ];
  }

  protected transform(raw: RawPlace): Omit<Place, 'id' | 'createdAt' | 'updatedAt'> {
    const baseTransform = super.transform(raw);
    
    return {
      ...baseTransform,
      vertical: 'playground',
      lat: raw.latitude || null,
      lng: raw.longitude || null,
      tags: [
        ...(raw.tags || []),
        raw.category,
        ...(raw.features || [])
      ],
      rawData: {
        ...raw,
        features: raw.features,
        ageRange: raw.ageRange,
        admissionFee: raw.admissionFee
      }
    };
  }
}

/**
 * Alberta Clinics Connector
 * Syncs medical clinics and healthcare providers
 */
export class AlbertaClinicsConnector extends SiteConnector {
  siteId = 'albertaclinics';
  vertical = 'clinic';

  private dataUrl: string;

  constructor(dataUrl?: string) {
    super();
    this.dataUrl = dataUrl || process.env.ALBERTACLINICS_DATA_URL || '';
  }

  async fetchAll(): Promise<RawPlace[]> {
    // If we have a data URL, fetch from it
    if (this.dataUrl) {
      try {
        const response = await fetch(this.dataUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json() as RawPlace[];
      } catch (err: any) {
        console.warn(`[${this.siteId}] Failed to fetch from URL: ${err.message}`);
      }
    }

    // Fallback: return sample data for Alberta clinics
    // In production, this would scrape or fetch from the actual site
    return [
      {
        id: 'calgary-medical-clinic',
        name: 'Calgary Medical Clinic',
        city: 'calgary',
        province: 'AB',
        category: 'family-clinic',
        address: '100-123 Main St SW, Calgary, AB T2P 4H2',
        phone: '(403) 234-5678',
        website: 'https://calgarymedicalclinic.ca',
        rating: 4.7,
        ratingCount: 89,
        tags: ['family-medicine', 'walk-in', 'primary-care'],
        description: 'Full-service family medical clinic accepting new patients. Walk-in and appointments available.',
        features: ['Family Medicine', 'Walk-in Clinic', 'Lab Services', 'Immunizations'],
        email: 'info@calgarymedicalclinic.ca',
        latitude: 51.0447,
        longitude: -114.0719
      },
      {
        id: 'edmonton-urgent-care',
        name: 'Edmonton Urgent Care Centre',
        city: 'edmonton',
        province: 'AB',
        category: 'urgent-care',
        address: '1500 102 Ave NW, Edmonton, AB T5N 0B1',
        phone: '(780) 455-1234',
        website: 'https://edmontonurgentcare.com',
        rating: 4.3,
        ratingCount: 156,
        tags: ['urgent-care', 'x-ray', 'minor-emergency'],
        description: 'Urgent care facility providing treatment for non-life-threatening emergencies.',
        features: ['Urgent Care', 'X-Ray', 'Lab Services', 'Fracture Care', 'Stitches'],
        email: 'contact@edmontonurgentcare.com',
        latitude: 53.5461,
        longitude: -113.4937
      },
      {
        id: 'south-calgary-health',
        name: 'South Calgary Health Campus',
        city: 'calgary',
        province: 'AB',
        category: 'multi-specialty',
        address: '31 Sunpark Plaza SE, Calgary, AB T2X 3V5',
        phone: '(403) 943-9300',
        website: 'https://southcalgaryhealth.ca',
        rating: 4.5,
        ratingCount: 234,
        tags: ['multi-specialty', 'specialists', 'surgery'],
        description: 'Comprehensive healthcare campus with multiple specialties and surgical services.',
        features: ['Cardiology', 'Orthopedics', 'General Surgery', 'Diagnostic Imaging', 'Physiotherapy'],
        email: 'info@southcalgaryhealth.ca',
        latitude: 50.8963,
        longitude: -114.0577
      },
      {
        id: 'whyte-ave-clinic',
        name: 'Whyte Avenue Medical Clinic',
        city: 'edmonton',
        province: 'AB',
        category: 'walk-in-clinic',
        address: '8215 102 St NW, Edmonton, AB T6E 4E1',
        phone: '(780) 433-2020',
        website: 'https://whyteaveclinic.com',
        rating: 4.2,
        ratingCount: 178,
        tags: ['walk-in', 'student-friendly', 'travel-medicine'],
        description: 'Walk-in clinic serving the university area and Whyte Avenue community.',
        features: ['Walk-in Clinic', 'Travel Medicine', 'Student Health', 'Mental Health'],
        email: 'appointments@whyteaveclinic.com',
        latitude: 53.5181,
        longitude: -113.4914
      },
      {
        id: 'foothills-medical',
        name: 'Foothills Medical Centre',
        city: 'calgary',
        province: 'AB',
        category: 'hospital',
        address: '1403 29 St NW, Calgary, AB T2N 2T9',
        phone: '(403) 944-1110',
        website: 'https://albertahealthservices.ca',
        rating: 4.4,
        ratingCount: 423,
        tags: ['hospital', 'emergency', 'surgery', 'icu'],
        description: 'Major tertiary care hospital providing comprehensive medical and surgical services.',
        features: ['Emergency Department', 'ICU', 'Surgery', 'Cancer Care', 'Research'],
        latitude: 51.0640,
        longitude: -114.1358
      },
      {
        id: 'royal-alexandra',
        name: 'Royal Alexandra Hospital',
        city: 'edmonton',
        province: 'AB',
        category: 'hospital',
        address: '10240 Kingsway NW, Edmonton, AB T5H 3V9',
        phone: '(780) 477-4111',
        website: 'https://albertahealthservices.ca',
        rating: 4.1,
        ratingCount: 389,
        tags: ['hospital', 'emergency', 'trauma', 'baby'],
        description: 'Major hospital with Level I trauma centre and comprehensive women\'s health services.',
        features: ['Emergency', 'Trauma Centre', 'Women\'s Health', 'NICU', 'Surgery'],
        latitude: 53.5574,
        longitude: -113.4966
      }
    ];
  }

  protected transform(raw: RawPlace): Omit<Place, 'id' | 'createdAt' | 'updatedAt'> {
    const baseTransform = super.transform(raw);
    
    return {
      ...baseTransform,
      vertical: 'clinic',
      lat: raw.latitude || null,
      lng: raw.longitude || null,
      tags: [
        ...(raw.tags || []),
        raw.category,
        ...(raw.features || [])
      ],
      rawData: {
        ...raw,
        features: raw.features,
        email: raw.email
      }
    };
  }
}

/**
 * ABControl Connector
 * Syncs industrial and B2B service providers
 */
export class ABControlConnector extends SiteConnector {
  siteId = 'abcontrol';
  vertical = 'industrial';

  private dataUrl: string;

  constructor(dataUrl?: string) {
    super();
    this.dataUrl = dataUrl || process.env.ABCONTROL_DATA_URL || '';
  }

  async fetchAll(): Promise<RawPlace[]> {
    if (this.dataUrl) {
      try {
        const response = await fetch(this.dataUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json() as RawPlace[];
      } catch (err: any) {
        console.warn(`[${this.siteId}] Failed to fetch from URL: ${err.message}`);
      }
    }

    // Fallback: sample data for industrial/B2B services
    return [
      {
        id: 'alberta-controls',
        name: 'Alberta Controls Ltd',
        city: 'calgary',
        province: 'AB',
        category: 'automation',
        address: '2500 14 St NE, Calgary, AB T2E 8G5',
        phone: '(403) 291-2500',
        website: 'https://albertacontrols.com',
        rating: 4.8,
        ratingCount: 45,
        tags: ['automation', 'controls', 'industrial', 'engineering'],
        description: 'Industrial automation and control systems integrator serving oil & gas, manufacturing, and utilities.',
        features: ['PLC Programming', 'SCADA Systems', 'HMI Design', 'Panel Building', 'Field Services'],
        email: 'sales@albertacontrols.com',
        latitude: 51.0771,
        longitude: -114.0296
      },
      {
        id: 'edmonton-industrial',
        name: 'Edmonton Industrial Solutions',
        city: 'edmonton',
        province: 'AB',
        category: 'industrial-services',
        address: '18005 118 Ave NW, Edmonton, AB T5S 2W7',
        phone: '(780) 447-1234',
        website: 'https://edmontonindustrial.com',
        rating: 4.5,
        ratingCount: 67,
        tags: ['maintenance', 'repair', 'fabrication', 'industrial'],
        description: 'Full-service industrial maintenance and fabrication company.',
        features: ['Equipment Repair', 'Welding', 'Fabrication', 'Millwright', 'Preventive Maintenance'],
        email: 'info@edmontonindustrial.com',
        latitude: 53.5703,
        longitude: -113.6316
      },
      {
        id: 'calgary-pump',
        name: 'Calgary Pump & Compressor',
        city: 'calgary',
        province: 'AB',
        category: 'pump-services',
        address: '7450 48 St SE, Calgary, AB T2C 4N1',
        phone: '(403) 236-3333',
        website: 'https://calgarypump.com',
        rating: 4.6,
        ratingCount: 34,
        tags: ['pumps', 'compressors', 'service', 'rental'],
        description: 'Pump and compressor sales, service, and rentals for industrial applications.',
        features: ['Pump Sales', 'Compressor Service', 'Equipment Rental', 'Emergency Repair', 'Parts'],
        email: 'service@calgarypump.com',
        latitude: 50.9862,
        longitude: -113.9584
      }
    ];
  }

  protected transform(raw: RawPlace): Omit<Place, 'id' | 'createdAt' | 'updatedAt'> {
    const baseTransform = super.transform(raw);
    
    return {
      ...baseTransform,
      vertical: 'industrial',
      lat: raw.latitude || null,
      lng: raw.longitude || null,
      tags: [
        ...(raw.tags || []),
        raw.category,
        ...(raw.features || [])
      ],
      rawData: {
        ...raw,
        features: raw.features,
        email: raw.email
      }
    };
  }
}

// Export all additional connectors
export const additionalConnectors = {
  EdmontonPlaygroundConnector,
  AlbertaClinicsConnector,
  ABControlConnector
};
