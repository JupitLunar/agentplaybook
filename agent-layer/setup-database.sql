-- ========================================
-- Agent Layer: Database Infrastructure Setup
-- ========================================

-- 1. Create playgrounds table (if not exists)
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

-- Playgrounds indexes
CREATE INDEX IF NOT EXISTS idx_playgrounds_city ON playgrounds(city);
CREATE INDEX IF NOT EXISTS idx_playgrounds_category ON playgrounds(category);

-- Enable RLS on playgrounds
ALTER TABLE playgrounds ENABLE ROW LEVEL SECURITY;

-- Allow public read on playgrounds
DROP POLICY IF EXISTS "Allow public read" ON playgrounds;
CREATE POLICY "Allow public read" ON playgrounds FOR SELECT USING (true);

-- 2. Create wellness table
CREATE TABLE IF NOT EXISTS wellness (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT DEFAULT 'AB',
  phone TEXT,
  website TEXT,
  email TEXT,
  category TEXT DEFAULT 'wellness-center',
  description TEXT,
  rating DECIMAL(2,1),
  tags TEXT[],
  services TEXT[],
  practitioners JSONB DEFAULT '[]',
  accepts_insurance BOOLEAN DEFAULT false,
  direct_billing BOOLEAN DEFAULT false,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  raw_data JSONB DEFAULT '{}',
  source_type TEXT DEFAULT 'manual',
  is_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Wellness indexes
CREATE INDEX IF NOT EXISTS idx_wellness_city ON wellness(city);
CREATE INDEX IF NOT EXISTS idx_wellness_category ON wellness(category);
CREATE INDEX IF NOT EXISTS idx_wellness_services ON wellness USING GIN(services);

-- Enable RLS on wellness
ALTER TABLE wellness ENABLE ROW LEVEL SECURITY;

-- Allow public read on wellness
DROP POLICY IF EXISTS "Allow public read" ON wellness;
CREATE POLICY "Allow public read" ON wellness FOR SELECT USING (true);

-- 3. Create unified places_view
DROP VIEW IF EXISTS places_view;
CREATE VIEW places_view AS
-- Playgrounds
SELECT 
  id,
  name,
  slug,
  'playground'::TEXT as vertical,
  category,
  address,
  city,
  province,
  phone,
  website,
  email,
  description,
  rating,
  tags,
  features as attributes,
  NULL::JSONB as practitioners,
  NULL::BOOLEAN as accepts_insurance,
  NULL::BOOLEAN as direct_billing,
  age_range as age_range_text,
  lat,
  lng,
  raw_data,
  source_type,
  is_claimed,
  created_at,
  updated_at
FROM playgrounds

UNION ALL

-- Wellness
SELECT 
  id,
  name,
  slug,
  'wellness'::TEXT as vertical,
  category,
  address,
  city,
  province,
  phone,
  website,
  email,
  description,
  rating,
  tags,
  services as attributes,
  practitioners,
  accepts_insurance,
  direct_billing,
  NULL as age_range_text,
  lat,
  lng,
  raw_data,
  source_type,
  is_claimed,
  created_at,
  updated_at
FROM wellness;

-- Grant access to the view
GRANT SELECT ON places_view TO anon, authenticated;

-- Insert sample playgrounds data (if not exists)
INSERT INTO playgrounds (id, name, slug, address, city, phone, website, rating, category, tags, features, age_range, lat, lng) VALUES
('launchpad-trampoline', 'Launchpad Trampoline Park', 'launchpad-trampoline-park', '6141 Currents Dr NW, Edmonton, AB', 'edmonton', '(780) 760-5867', 'https://launchpadtrampoline.ca', 4.5, 'trampoline-park', ARRAY['trampoline','birthday-parties'], ARRAY['Trampolines','Foam Pit','Dodgeball'], 'All ages', 53.4269, -113.6224),
('edmonton-funderdome', 'Edmonton Funderdome', 'edmonton-funderdome', '10325 51 Ave NW, Edmonton, AB', 'edmonton', '(780) 436-3833', 'https://edmontonfunderdome.ca', 4.3, 'indoor-playground', ARRAY['indoor-playground','climbing','slides'], ARRAY['Climbing Structures','Slides','Ball Pit'], '0-12 years', 53.4878, -113.4965),
('edmonton-treehouse', 'The Edmonton Treehouse', 'edmonton-treehouse', '10104 103 Ave NW, Edmonton, AB', 'edmonton', '(780) 990-8733', 'https://edmontontreehouse.ca', 4.6, 'indoor-playground', ARRAY['indoor-playground','toddler-zone','cafe'], ARRAY['Multi-level Structure','Toddler Zone','Parent Lounge'], '0-10 years', 53.5452, -113.4938),
('lollipop-playland', 'Lollipop Playland', 'lollipop-playland', '700 St Albert Trail, St Albert, AB', 'st-albert', '(780) 459-8687', 'https://lollipopplayland.com', 4.4, 'indoor-playground', ARRAY['indoor-playground','toddler-friendly'], ARRAY['Play Zones','Toddler Area','Party Rooms'], '0-8 years', 53.6532, -113.6242),
('shakers-fun-centre', 'Shakers Fun Centre', 'shakers-fun-centre', '1725 99 St NW, Edmonton, AB', 'edmonton', '(780) 466-4626', 'https://shakersfuncentre.com', 4.2, 'family-fun-centre', ARRAY['arcade','laser-tag','go-karts'], ARRAY['Indoor Playground','Arcade','Laser Tag'], 'All ages', 53.4456, -113.4723),
('hide-n-seek', 'Hide N Seek Trampoline Park', 'hide-n-seek', '49 Aero Dr NE, Calgary, AB', 'calgary', '(403) 457-5333', 'https://hidenseekcalgary.com', 4.6, 'trampoline-park', ARRAY['trampoline','ninja','climbing'], ARRAY['Trampolines','Ninja Course','Climbing Wall'], 'All ages', 51.0954, -114.0356),
('calgary-funderdome', 'Calgary Funderdome', 'calgary-funderdome', '3838 10 St NE, Calgary, AB', 'calgary', '(403) 777-0123', 'https://calgaryfunderdome.ca', 4.4, 'indoor-playground', ARRAY['indoor-playground','obstacle-course'], ARRAY['Obstacle Course','Slides','Ball Pit'], '0-12 years', 51.0872, -114.0423)
ON CONFLICT (id) DO NOTHING;

-- Insert sample wellness data (if not exists)
INSERT INTO wellness (id, name, slug, address, city, phone, website, rating, category, tags, services, practitioners, accepts_insurance, direct_billing, lat, lng) VALUES
('edmonton-therapeutic-massage', 'Edmonton Therapeutic Massage', 'edmonton-therapeutic-massage', '10123 123 St NW, Edmonton, AB', 'edmonton', '(780) 123-4567', 'https://edmontontherapeuticmassage.ca', 4.7, 'massage-therapy', ARRAY['massage','therapy','wellness'], ARRAY['Swedish Massage','Deep Tissue','Hot Stone'], '[{"name": "Sarah Johnson", "type": "Registered Massage Therapist"}]'::JSONB, true, true, 53.5461, -113.4938),
('calgary-holistic-wellness', 'Calgary Holistic Wellness Center', 'calgary-holistic-wellness', '555 5 Ave SW, Calgary, AB', 'calgary', '(403) 987-6543', 'https://calgaryholistic.ca', 4.5, 'holistic-wellness', ARRAY['holistic','wellness','alternative-medicine'], ARRAY['Acupuncture','Chiropractic','Naturopathy'], '[{"name": "Dr. Michael Chen", "type": "Naturopathic Doctor"}, {"name": "Lisa Park", "type": "Acupuncturist"}]'::JSONB, true, false, 51.0447, -114.0719),
('edmonton-physio-clinic', 'Edmonton Physiotherapy Clinic', 'edmonton-physio-clinic', '8725 109 St NW, Edmonton, AB', 'edmonton', '(780) 555-7890', 'https://edmontonphysio.ca', 4.6, 'physiotherapy', ARRAY['physio','rehabilitation','sports-medicine'], ARRAY['Physiotherapy','Sports Rehab','Cupping'], '[{"name": "James Wilson", "type": "Physical Therapist"}]'::JSONB, true, true, 53.5232, -113.5080)
ON CONFLICT (id) DO NOTHING;
