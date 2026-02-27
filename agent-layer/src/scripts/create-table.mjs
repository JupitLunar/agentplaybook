const CREATE_PLAYGROUNDS_TABLE = `
CREATE TABLE IF NOT EXISTS playgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
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
`;

const supabaseUrl = 'https://lalpxtoxziyjibifibsx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHB4dG94eml5amliaWZpYnN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYyNTkyMywiZXhwIjoyMDY5MjAxOTIzfQ.RyLwb38dy5h1DM0jpR0KD_HHZhb6SshE3ZhMKdIWyyY';

async function createTable() {
  console.log('Creating playgrounds table via REST API...');
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        query: CREATE_PLAYGROUNDS_TABLE
      })
    });
    
    const result = await response.text();
    console.log('Response:', result);
  } catch (e) {
    console.error('Error:', e);
  }
}

// Try using pgrest query endpoint
async function createTableViaSQL() {
  console.log('Attempting to create table...');
  
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey
    },
    body: JSON.stringify({ sql: CREATE_PLAYGROUNDS_TABLE })
  });
  
  console.log('Status:', response.status);
  const result = await response.text();
  console.log('Result:', result);
}

createTableViaSQL().catch(console.error);
