import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

// Supabase project reference
const projectRef = 'lalpxtoxziyjibifibsx';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHB4dG94eml5amliaWZpYnN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYyNTkyMywiZXhwIjoyMDY5MjAxOTIzfQ.RyLwb38dy5h1DM0jpR0KD_HHZhb6SshE3ZhMKdIWyyY';

// Connection via session pooler (port 5432)
const config = {
  host: `aws-0-us-west-1.pooler.supabase.com`,
  port: 5432,
  database: 'postgres',
  user: `postgres`,
  password: serviceRoleKey,
  ssl: {
    rejectUnauthorized: false
  }
};

async function createPlaygroundsTable() {
  console.log('Creating playgrounds table...\n');
  
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✓ Connected to Supabase\n');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS playgrounds (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        province TEXT DEFAULT 'AB',
        phone TEXT,
        website TEXT,
        email TEXT,
        category TEXT DEFAULT 'indoor-playground',
        description TEXT,
        rating DECIMAL(2,1),
        tags TEXT[],
        features TEXT[],
        age_range TEXT,
        lat DECIMAL(10, 8),
        lng DECIMAL(11, 8),
        raw_data JSONB DEFAULT '{}',
        source_type TEXT DEFAULT 'manual',
        is_claimed BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
      
      CREATE INDEX IF NOT EXISTS idx_playgrounds_city ON playgrounds(city);
      CREATE INDEX IF NOT EXISTS idx_playgrounds_category ON playgrounds(category);
      
      ALTER TABLE playgrounds ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Allow public read" ON playgrounds;
      CREATE POLICY "Allow public read" ON playgrounds FOR SELECT USING (true);
    `;
    
    await client.query(createTableSQL);
    console.log('✓ Playgrounds table created\n');
    
    // Insert sample data
    const playgrounds = [
      { id: 'launchpad-trampoline', name: 'Launchpad Trampoline Park', slug: 'launchpad-trampoline-park', address: '6141 Currents Dr NW, Edmonton, AB', city: 'edmonton', phone: '(780) 760-5867', website: 'https://launchpadtrampoline.ca', rating: 4.5, category: 'trampoline-park', tags: ['trampoline','birthday-parties'], features: ['Trampolines','Foam Pit','Dodgeball'], age_range: 'All ages', lat: 53.4269, lng: -113.6224 },
      { id: 'edmonton-funderdome', name: 'Edmonton Funderdome', slug: 'edmonton-funderdome', address: '10325 51 Ave NW, Edmonton, AB', city: 'edmonton', phone: '(780) 436-3833', website: 'https://edmontonfunderdome.ca', rating: 4.3, category: 'indoor-playground', tags: ['indoor-playground','climbing','slides'], features: ['Climbing Structures','Slides','Ball Pit'], age_range: '0-12 years', lat: 53.4878, lng: -113.4965 },
      { id: 'edmonton-treehouse', name: 'The Edmonton Treehouse', slug: 'edmonton-treehouse', address: '10104 103 Ave NW, Edmonton, AB', city: 'edmonton', phone: '(780) 990-8733', website: 'https://edmontontreehouse.ca', rating: 4.6, category: 'indoor-playground', tags: ['indoor-playground','toddler-zone','cafe'], features: ['Multi-level Structure','Toddler Zone','Parent Lounge'], age_range: '0-10 years', lat: 53.5452, lng: -113.4938 },
      { id: 'lollipop-playland', name: 'Lollipop Playland', slug: 'lollipop-playland', address: '700 St Albert Trail, St Albert, AB', city: 'st-albert', phone: '(780) 459-8687', website: 'https://lollipopplayland.com', rating: 4.4, category: 'indoor-playground', tags: ['indoor-playground','toddler-friendly'], features: ['Play Zones','Toddler Area','Party Rooms'], age_range: '0-8 years', lat: 53.6532, lng: -113.6242 },
      { id: 'shakers-fun-centre', name: 'Shakers Fun Centre', slug: 'shakers-fun-centre', address: '1725 99 St NW, Edmonton, AB', city: 'edmonton', phone: '(780) 466-4626', website: 'https://shakersfuncentre.com', rating: 4.2, category: 'family-fun-centre', tags: ['arcade','laser-tag','go-karts'], features: ['Indoor Playground','Arcade','Laser Tag'], age_range: 'All ages', lat: 53.4456, lng: -113.4723 },
      { id: 'hide-n-seek', name: 'Hide N Seek Trampoline Park', slug: 'hide-n-seek', address: '49 Aero Dr NE, Calgary, AB', city: 'calgary', phone: '(403) 457-5333', website: 'https://hidenseekcalgary.com', rating: 4.6, category: 'trampoline-park', tags: ['trampoline','ninja','climbing'], features: ['Trampolines','Ninja Course','Climbing Wall'], age_range: 'All ages', lat: 51.0954, lng: -114.0356 },
      { id: 'calgary-funderdome', name: 'Calgary Funderdome', slug: 'calgary-funderdome', address: '3838 10 St NE, Calgary, AB', city: 'calgary', phone: '(403) 777-0123', website: 'https://calgaryfunderdome.ca', rating: 4.4, category: 'indoor-playground', tags: ['indoor-playground','obstacle-course'], features: ['Obstacle Course','Slides','Ball Pit'], age_range: '0-12 years', lat: 51.0872, lng: -114.0423 }
    ];
    
    for (const pg of playgrounds) {
      await client.query(`
        INSERT INTO playgrounds (id, name, slug, address, city, phone, website, rating, category, tags, features, age_range, lat, lng)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO NOTHING
      `, [pg.id, pg.name, pg.slug, pg.address, pg.city, pg.phone, pg.website, pg.rating, pg.category, pg.tags, pg.features, pg.age_range, pg.lat, pg.lng]);
    }
    console.log(`✓ Inserted ${playgrounds.length} playgrounds\n`);
    
    await client.end();
    console.log('✓ Playgrounds setup complete!');
    
  } catch (err) {
    console.error('✗ Error:', err.message);
    try {
      await client.end();
    } catch (e) {}
    process.exit(1);
  }
}

createPlaygroundsTable();