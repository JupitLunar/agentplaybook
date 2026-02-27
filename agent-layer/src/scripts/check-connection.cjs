const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lalpxtoxziyjibifibsx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHB4dG94eml5amliaWZpYnN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYyNTkyMywiZXhwIjoyMDY5MjAxOTIzfQ.RyLwb38dy5h1DM0jpR0KD_HHZhb6SshE3ZhMKdIWyyY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  console.log('Testing Supabase connection...');
  
  // Try to get list of tables
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');
  
  if (error) {
    console.error('Error checking tables:', error.message);
  } else {
    console.log('Tables in public schema:');
    data.forEach(t => console.log(`  - ${t.table_name}`));
  }
  
  // Try to create the playgrounds table directly using raw SQL
  console.log('\nAttempting to create table using supabase-js...');
  
  const createTableSQL = `
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
      category TEXT DEFAULT 'indoor-playground',
      subcategories TEXT[],
      description TEXT,
      images TEXT[],
      rating DECIMAL(2,1),
      review_count INTEGER DEFAULT 0,
      raw_data JSONB DEFAULT '{}',
      lat DECIMAL(10, 8),
      lng DECIMAL(11, 8),
      tags TEXT[],
      amenities TEXT[],
      features TEXT[],
      age_range TEXT,
      working_hours JSONB,
      source_type TEXT DEFAULT 'manual',
      source_url TEXT,
      is_claimed BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `;
  
  // Try using rpc
  const { error: rpcError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
  if (rpcError) {
    console.log('RPC method failed:', rpcError.message);
  } else {
    console.log('Table created via RPC!');
  }
}

checkConnection().catch(console.error);
