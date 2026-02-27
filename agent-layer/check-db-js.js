import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lalpxtoxziyjibifibsx.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHB4dG94eml5amliaWZpYnN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYyNTkyMywiZXhwIjoyMDY5MjAxOTIzfQ.RyLwb38dy5h1DM0jpR0KD_HHZhb6SshE3ZhMKdIWyyY';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkDatabase() {
  console.log('========================================');
  console.log('Checking Database State via Supabase JS');
  console.log('========================================\n');
  
  try {
    // Check what tables exist
    console.log('1. Checking existing tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.log('   Error querying tables:', tablesError.message);
    } else {
      console.log('   Tables found:', tables?.map(t => t.table_name).join(', ') || 'none');
    }
    
    // Try to query leads table (should exist)
    console.log('\n2. Checking leads table...');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('count')
      .limit(1);
    
    if (leadsError) {
      console.log('   Error:', leadsError.message);
    } else {
      console.log('   ✓ leads table accessible');
    }
    
    // Try to query playgrounds table
    console.log('\n3. Checking playgrounds table...');
    const { data: pg, error: pgError } = await supabase
      .from('playgrounds')
      .select('count')
      .limit(1);
    
    if (pgError) {
      console.log('   Error:', pgError.message);
      console.log('   Code:', pgError.code);
    } else {
      console.log('   ✓ playgrounds table exists');
    }
    
    // Try to query wellness table
    console.log('\n4. Checking wellness table...');
    const { data: wellness, error: wellnessError } = await supabase
      .from('wellness')
      .select('count')
      .limit(1);
    
    if (wellnessError) {
      console.log('   Error:', wellnessError.message);
      console.log('   Code:', wellnessError.code);
    } else {
      console.log('   ✓ wellness table exists');
    }
    
    // Try exec_sql function
    console.log('\n5. Checking for exec_sql function...');
    const { data: execResult, error: execError } = await supabase.rpc('exec_sql', { 
      sql: 'SELECT current_user' 
    });
    
    if (execError) {
      console.log('   exec_sql not available:', execError.message);
    } else {
      console.log('   ✓ exec_sql available:', execResult);
    }
    
    console.log('\n========================================');
    console.log('Summary:');
    console.log('========================================');
    
  } catch (err) {
    console.error('Error:', err);
  }
}

checkDatabase();
