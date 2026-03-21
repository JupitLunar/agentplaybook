-- Create playgrounds table in Supabase
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS playgrounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    vertical TEXT DEFAULT 'playground',
    category TEXT DEFAULT 'playground',
    city TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    description TEXT,
    rating NUMERIC(3,2),
    review_count INTEGER DEFAULT 0,
    lat NUMERIC(10,7),
    lng NUMERIC(10,7),
    raw_data JSONB DEFAULT '{}',
    images JSONB DEFAULT '[]',
    is_claimed BOOLEAN DEFAULT false,
    last_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_playgrounds_city ON playgrounds(city);
CREATE INDEX IF NOT EXISTS idx_playgrounds_slug ON playgrounds(slug);
CREATE INDEX IF NOT EXISTS idx_playgrounds_vertical ON playgrounds(vertical);

-- Enable RLS (optional, for security)
ALTER TABLE playgrounds ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON playgrounds
    FOR SELECT USING (true);

-- Allow service role to insert/update
CREATE POLICY "Allow service role insert" ON playgrounds
    FOR INSERT WITH CHECK (true);
    
CREATE POLICY "Allow service role update" ON playgrounds
    FOR UPDATE USING (true);

-- Create wellness table (for future use)
CREATE TABLE IF NOT EXISTS wellness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    vertical TEXT DEFAULT 'wellness',
    category TEXT,
    city TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    description TEXT,
    rating NUMERIC(3,2),
    review_count INTEGER DEFAULT 0,
    lat NUMERIC(10,7),
    lng NUMERIC(10,7),
    raw_data JSONB DEFAULT '{}',
    images JSONB DEFAULT '[]',
    is_claimed BOOLEAN DEFAULT false,
    last_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wellness_city ON wellness(city);
CREATE INDEX IF NOT EXISTS idx_wellness_slug ON wellness(slug);

ALTER TABLE wellness ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read wellness" ON wellness FOR SELECT USING (true);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT,
    phone TEXT,
    message TEXT,
    vertical TEXT,
    place_id UUID,
    place_ids UUID[],
    lead_type TEXT DEFAULT 'inquiry',
    status TEXT DEFAULT 'new',
    raw_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_vertical ON leads(vertical);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public create leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read own leads" ON leads FOR SELECT USING (true);
