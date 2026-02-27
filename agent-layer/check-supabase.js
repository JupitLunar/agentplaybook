import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://lalpxtoxziyjibifibsx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHB4dG94eml5amliaWZpYnN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYyNTkyMywiZXhwIjoyMDY5MjAxOTIzfQ.RyLwb38dy5h1DM0jpR0KD_HHZhb6SshE3ZhMKdIWyyY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Checking Supabase database status...\n');
  
  // Check if playgrounds table exists by trying to query it
  const tables = ['playgrounds', 'wellness', 'leads'];
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        if (error.code === 'PGRST116') {
          results[table] = { exists: false, error: 'Table not found' };
        } else {
          results[table] = { exists: false, error: error.message };
        }
      } else {
        results[table] = { exists: true, count: count || 0 };
      }
    } catch (e) {
      results[table] = { exists: false, error: e.message };
    }
  }
  
  console.log('Table Status:');
  console.log('-------------');
  for (const [table, status] of Object.entries(results)) {
    if (status.exists) {
      console.log(`✓ ${table}: EXISTS (${status.count} rows)`);
    } else {
      console.log(`✗ ${table}: MISSING - ${status.error}`);
    }
  }
  
  // Check leads table structure
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .limit(1);
    
    if (!error && data) {
      console.log('\n✓ leads table is accessible');
    }
  } catch (e) {
    console.log('\n✗ leads table error:', e.message);
  }
  
  return results;
}

checkTables().then(results => {
  const allExist = Object.values(results).every(r => r.exists);
  process.exit(allExist ? 0 : 1);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});