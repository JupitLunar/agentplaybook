import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lalpxtoxziyjibifibsx.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHB4dG94eml5amliaWZpYnN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYyNTkyMywiZXhwIjoyMDY5MjAxOTIzfQ.RyLwb38dy5h1DM0jpR0KD_HHZhb6SshE3ZhMKdIWyyY';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkHealth() {
  console.log('Checking Supabase project health...\n');
  
  // Test 1: Simple auth check
  console.log('1. Testing Auth...');
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.log('   Auth check failed:', authError.message);
  } else {
    console.log('   Auth is working');
  }
  
  // Test 2: Check leads table
  console.log('\n2. Testing leads table...');
  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('*')
    .limit(1);
  
  if (leadsError) {
    console.log('   Error:', leadsError.message);
  } else {
    console.log('   ✓ leads table accessible,', leads?.length || 0, 'rows sampled');
  }
  
  // Test 3: Check if exec_sql function exists
  console.log('\n3. Testing exec_sql function...');
  const { data: execData, error: execError } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' });
  if (execError) {
    console.log('   exec_sql not available:', execError.message);
  } else {
    console.log('   ✓ exec_sql available:', execData);
  }
  
  // Test 4: Try to check extensions
  console.log('\n4. Checking available extensions...');
  try {
    const { data: extData, error: extError } = await supabase
      .from('pg_extension')
      .select('extname')
      .limit(10);
    
    if (extError) {
      console.log('   Cannot query extensions:', extError.message);
    } else {
      console.log('   Extensions:', extData?.map(e => e.extname).join(', ') || 'none found');
    }
  } catch (e) {
    console.log('   Error:', e.message);
  }
  
  // Test 5: Get project info via REST
  console.log('\n5. Testing REST API...');
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });
    console.log('   REST API status:', response.status);
    if (response.ok) {
      const openapi = await response.json();
      const tables = Object.keys(openapi?.definitions || {});
      console.log('   Available tables:', tables.filter(t => !t.startsWith('pg')).join(', ') || 'none');
    }
  } catch (e) {
    console.log('   REST API error:', e.message);
  }
  
  console.log('\n========================================');
  console.log('Summary:');
  console.log('  - leads table exists:', !leadsError);
  console.log('  - exec_sql function exists:', !execError);
  console.log('========================================');
}

checkHealth();
