/**
 * Create Playgrounds Table in Supabase
 * SQL schema matching unified vertical structure
 */

export const CREATE_PLAYGROUNDS_TABLE = `
-- Create playgrounds table
CREATE TABLE IF NOT EXISTS playgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT DEFAULT 'AB',
  postal_code TEXT,
  phone TEXT,
  website TEXT,
  email TEXT,
  
  -- Categorization
  category TEXT DEFAULT 'indoor-playground',
  subcategories TEXT[],
  
  -- Content
  description TEXT,
  images TEXT[],
  
  -- Ratings
  rating DECIMAL(2,1),
  review_count INTEGER DEFAULT 0,
  
  -- Attributes (JSON for flexibility)
  raw_data JSONB DEFAULT '{}',
  
  -- Location
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  
  -- Features/Tags
  tags TEXT[],
  amenities TEXT[],
  features TEXT[],
  age_range TEXT,
  
  -- Availability
  working_hours JSONB,
  
  -- Source tracking
  source_type TEXT DEFAULT 'manual',
  source_url TEXT,
  is_claimed BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_verified_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_playgrounds_city ON playgrounds(city);
CREATE INDEX IF NOT EXISTS idx_playgrounds_category ON playgrounds(category);
CREATE INDEX IF NOT EXISTS idx_playgrounds_slug ON playgrounds(slug);
CREATE INDEX IF NOT EXISTS idx_playgrounds_tags ON playgrounds USING GIN(tags);

-- Enable RLS
ALTER TABLE playgrounds ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read" ON playgrounds
  FOR SELECT USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_playgrounds_updated_at
  BEFORE UPDATE ON playgrounds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
`;

// Edmonton Playground data to migrate
export const EDMONTON_PLAYGROUND_DATA = [
  {
    id: 'launchpad-trampoline',
    name: 'Launchpad Trampoline Park',
    slug: 'launchpad-trampoline-park',
    address: '6141 Currents Dr NW, Edmonton, AB T6W 0L7',
    city: 'edmonton',
    phone: '(780) 760-5867',
    website: 'https://launchpadtrampoline.ca',
    rating: 4.5,
    category: 'trampoline-park',
    description: 'Indoor trampoline park with foam pits, dodgeball, and birthday party packages.',
    features: ['Trampolines', 'Foam Pit', 'Dodgeball', 'Cafe', 'Party Rooms'],
    tags: ['trampoline', 'birthday-parties', 'toddler-friendly', 'teen-friendly'],
    age_range: 'All ages',
    lat: 53.4269,
    lng: -113.6224
  },
  {
    id: 'edmonton-funderdome',
    name: 'Edmonton Funderdome',
    slug: 'edmonton-funderdome',
    address: '10325 51 Ave NW, Edmonton, AB T6H 0K7',
    city: 'edmonton',
    phone: '(780) 436-3833',
    website: 'https://edmontonfunderdome.ca',
    rating: 4.3,
    category: 'indoor-playground',
    description: 'Large indoor playground featuring climbing structures, slides, and soft play areas.',
    features: ['Climbing Structures', 'Slides', 'Ball Pit', 'Cafe', 'Private Party Rooms'],
    tags: ['indoor-playground', 'climbing', 'slides', 'birthday-parties'],
    age_range: '0-12 years',
    lat: 53.4878,
    lng: -113.4965
  },
  {
    id: 'edmonton-treehouse',
    name: 'The Edmonton Treehouse',
    slug: 'edmonton-treehouse',
    address: '10104 103 Ave NW, Edmonton, AB T5J 0H8',
    city: 'edmonton',
    phone: '(780) 990-8733',
    website: 'https://edmontontreehouse.ca',
    rating: 4.6,
    category: 'indoor-playground',
    description: 'Multi-level indoor playground with dedicated toddler area and parent-friendly amenities.',
    features: ['Multi-level Structure', 'Toddler Zone', 'Parent Lounge', 'WiFi', 'Coffee Bar'],
    tags: ['indoor-playground', 'toddler-zone', 'cafe', 'wifi', 'parents-welcome'],
    age_range: '0-10 years',
    lat: 53.5452,
    lng: -113.4938
  },
  {
    id: 'lollipop-playland',
    name: 'Lollipop Playland',
    slug: 'lollipop-playland',
    address: '700 St Albert Trail, St Albert, AB T8N 7A5',
    city: 'st-albert',
    phone: '(780) 459-8687',
    website: 'https://lollipopplayland.com',
    rating: 4.4,
    category: 'indoor-playground',
    description: 'Bright and colorful indoor playground with multiple play zones for different age groups.',
    features: ['Play Zones', 'Toddler Area', 'Party Rooms', 'Snack Bar'],
    tags: ['indoor-playground', 'toddler-friendly', 'birthday-parties'],
    age_range: '0-8 years',
    lat: 53.6532,
    lng: -113.6242
  },
  {
    id: 'shakers-fun-centre',
    name: 'Shakers Fun Centre',
    slug: 'shakers-fun-centre',
    address: '1725 99 St NW, Edmonton, AB T6N 1K5',
    city: 'edmonton',
    phone: '(780) 466-4626',
    website: 'https://shakersfuncentre.com',
    rating: 4.2,
    category: 'family-fun-centre',
    description: 'Family fun centre with indoor playground, arcade games, laser tag, and go-karts.',
    features: ['Indoor Playground', 'Arcade', 'Laser Tag', 'Go-Karts', 'Mini Golf'],
    tags: ['indoor-playground', 'arcade', 'laser-tag', 'go-karts', 'all-ages'],
    age_range: 'All ages',
    lat: 53.4456,
    lng: -113.4723
  },
  {
    id: 'cafe-o-play',
    name: 'Cafe O\'Play',
    slug: 'cafe-o-play',
    address: '5708 111 St NW, Edmonton, AB T6H 3G1',
    city: 'edmonton',
    phone: '(780) 433-7529',
    website: 'https://cafeoplay.com',
    rating: 4.5,
    category: 'cafe-playground',
    description: 'Coffee shop with attached indoor playground - parents can relax while kids play.',
    features: ['Coffee Shop', 'Play Area', 'Toddler Zone', 'WiFi', 'Snacks'],
    tags: ['cafe', 'playground', 'toddlers', 'parents', 'wifi'],
    age_range: '0-6 years',
    lat: 53.4938,
    lng: -113.5145
  },
  {
    id: 'tiny-tots-indoor-play',
    name: 'Tiny Tots Indoor Play',
    slug: 'tiny-tots-indoor-play',
    address: '9258 34 Ave NW, Edmonton, AB T6E 5T5',
    city: 'edmonton',
    phone: '(780) 988-0019',
    website: 'https://tinytotsindoorplay.com',
    rating: 4.7,
    category: 'toddler-playground',
    description: 'Safe indoor play space specifically designed for babies and toddlers.',
    features: ['Soft Play', 'Baby Area', 'Toddler Zone', 'Nursing Room', 'Sanitization Station'],
    tags: ['toddlers', 'babies', 'soft-play', 'safe', 'clean'],
    age_range: '0-4 years',
    lat: 53.4621,
    lng: -113.4789
  },
  {
    id: 'jungle-play',
    name: 'Jungle Play',
    slug: 'jungle-play',
    address: '200-5005 165 Ave NW, Edmonton, AB T5Y 0L8',
    city: 'edmonton',
    phone: '(780) 425-1526',
    website: 'https://jungleplay.ca',
    rating: 4.1,
    category: 'indoor-playground',
    description: 'Jungle-themed indoor playground with slides, ball pits, and climbing structures.',
    features: ['Slides', 'Ball Pit', 'Climbing', 'Jungle Theme', 'Party Area'],
    tags: ['indoor-playground', 'themed', 'birthday-parties'],
    age_range: '1-10 years',
    lat: 53.6254,
    lng: -113.4167
  }
];

// Calgary Playground data
export const CALGARY_PLAYGROUND_DATA = [
  {
    id: 'calgary-funderdome',
    name: 'Calgary Funderdome',
    slug: 'calgary-funderdome',
    address: '3838 10 St NE, Calgary, AB T2E 8T9',
    city: 'calgary',
    phone: '(403) 777-0123',
    website: 'https://calgaryfunderdome.ca',
    rating: 4.4,
    category: 'indoor-playground',
    description: 'Multi-level indoor playground with obstacle courses and party rooms.',
    features: ['Obstacle Course', 'Slides', 'Ball Pit', 'Party Rooms', 'Cafe'],
    tags: ['indoor-playground', 'obstacle-course', 'birthday-parties'],
    age_range: '0-12 years',
    lat: 51.0872,
    lng: -114.0423
  },
  {
    id: 'hide-n-seek',
    name: 'Hide N Seek Trampoline Park',
    slug: 'hide-n-seek',
    address: '49 Aero Dr NE, Calgary, AB T2E 8Z9',
    city: 'calgary',
    phone: '(403) 457-5333',
    website: 'https://hidenseekcalgary.com',
    rating: 4.6,
    category: 'trampoline-park',
    description: 'Massive trampoline park with ninja course, climbing walls, and toddler zone.',
    features: ['Trampolines', 'Ninja Course', 'Climbing Wall', 'Toddler Zone', 'Dodgeball'],
    tags: ['trampoline', 'ninja', 'climbing', 'toddlers'],
    age_range: 'All ages',
    lat: 51.0954,
    lng: -114.0356
  },
  {
    id: 'treehouse-calgary',
    name: 'Treehouse Calgary',
    slug: 'treehouse-calgary',
    address: '3451 32 Ave NE, Calgary, AB T1Y 6M7',
    city: 'calgary',
    phone: '(403) 291-0004',
    website: 'https://treehousecalgary.com',
    rating: 4.3,
    category: 'indoor-playground',
    description: 'Treehouse-themed indoor playground with multiple play zones.',
    features: ['Treehouse Structure', 'Slides', 'Toddler Area', 'Cafe', 'Free WiFi'],
    tags: ['indoor-playground', 'themed', 'toddlers', 'cafe'],
    age_range: '0-10 years',
    lat: 51.0834,
    lng: -113.9834
  },
  {
    id: 'gasoline-alley',
    name: 'Gasoline Alley Play Centre',
    slug: 'gasoline-alley',
    address: '100-4807 32 Ave SE, Calgary, AB T2B 2X3',
    city: 'calgary',
    phone: '(403) 272-9191',
    website: 'https://gasolinealley.ca',
    rating: 4.5,
    category: 'indoor-playground',
    description: 'Car and racing themed indoor playground with unique play structures.',
    features: ['Car Theme', 'Racing Track', 'Ball Pit', 'Party Rooms'],
    tags: ['themed', 'cars', 'racing', 'unique'],
    age_range: '0-8 years',
    lat: 51.0167,
    lng: -113.9678
  },
  {
    id: 'play-central',
    name: 'Play Central',
    slug: 'play-central',
    address: '10836 Prairie Hills Rd NW, Calgary, AB T3G 0S9',
    city: 'calgary',
    phone: '(403) 590-7529',
    website: 'https://playcentral.ca',
    rating: 4.2,
    category: 'indoor-playground',
    description: 'Modern indoor playground with interactive digital elements.',
    features: ['Interactive Play', 'Digital Games', 'Climbing', 'Toddler Zone'],
    tags: ['modern', 'interactive', 'digital', 'toddlers'],
    age_range: '0-12 years',
    lat: 51.1556,
    lng: -114.2089
  }
];
