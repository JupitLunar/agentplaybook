import { createClient } from '@supabase/supabase-js';
import { CREATE_PLAYGROUNDS_TABLE } from './playground-schema.js';

const supabaseUrl = 'https://lalpxtoxziyjibifibsx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHB4dG94eml5amliaWZpYnN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYyNTkyMywiZXhwIjoyMDY5MjAxOTIzfQ.RyLwb38dy5h1DM0jpR0KD_HHZhb6SshE3ZhMKdIWyyY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupTable() {
  console.log('Creating playgrounds table...');
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: CREATE_PLAYGROUNDS_TABLE
  });

  if (error) {
    console.log('RPC not available, trying direct SQL...');
    console.error('Error:', error.message);
  } else {
    console.log('Table created successfully via RPC');
  }
}

setupTable().catch(console.error);
