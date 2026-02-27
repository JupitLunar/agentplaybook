const supabaseUrl = 'https://lalpxtoxziyjibifibsx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHB4dG94eml5amliaWZpYnN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYyNTkyMywiZXhwIjoyMDY5MjAxOTIzfQ.RyLwb38dy5h1DM0jpR0KD_HHZhb6SshE3ZhMKdIWyyY';

async function listTables() {
  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey
    }
  });
  
  const spec = await response.json();
  
  console.log('Available tables/endpoints:\n');
  const paths = Object.keys(spec.paths || {});
  paths.forEach(path => {
    if (path !== '/') {
      console.log(`  ${path}`);
    }
  });
  
  // Check if playgrounds exists
  const hasPlaygrounds = paths.includes('/playgrounds');
  console.log(`\nPlaygrounds table exists: ${hasPlaygrounds}`);
}

listTables().catch(console.error);
