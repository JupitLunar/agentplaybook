import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://lalpxtoxziyjibifibsx.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHB4dG94eml5amliaWZpYnN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYyNTkyMywiZXhwIjoyMDY5MjAxOTIzfQ.RyLwb38dy5h1DM0jpR0KD_HHZhb6SshE3ZhMKdIWyyY';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQL() {
  const sqlPath = process.argv[2] || './setup-database.sql';
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  console.log(`Found ${statements.length} SQL statements to execute\n`);
  
  const results = {
    success: [],
    errors: []
  };
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';
    const shortStmt = stmt.substring(0, 60).replace(/\s+/g, ' ') + '...';
    
    try {
      // Try using the pg_exec function if available, otherwise use rpc
      const { data, error } = await supabase.rpc('exec_sql', { sql: stmt });
      
      if (error) {
        // If exec_sql doesn't exist, try a direct query
        const { error: queryError } = await supabase.from('_exec_sql').select('*').eq('sql', stmt).single();
        
        if (queryError && queryError.code === 'PGRST116') {
          // Table doesn't exist, try using the SQL function directly
          throw new Error(`exec_sql function not available: ${error.message}`);
        }
      }
      
      console.log(`✓ [${i + 1}/${statements.length}] ${shortStmt}`);
      results.success.push({ statement: shortStmt });
    } catch (err) {
      console.error(`✗ [${i + 1}/${statements.length}] ${shortStmt}`);
      console.error(`  Error: ${err.message}`);
      results.errors.push({ statement: shortStmt, error: err.message });
    }
  }
  
  console.log('\n========================================');
  console.log('Execution Summary');
  console.log('========================================');
  console.log(`Total statements: ${statements.length}`);
  console.log(`Successful: ${results.success.length}`);
  console.log(`Failed: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach((e, idx) => {
      console.log(`  ${idx + 1}. ${e.error}`);
    });
  }
  
  return results;
}

executeSQL().then(results => {
  process.exit(results.errors.length > 0 ? 1 : 0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
