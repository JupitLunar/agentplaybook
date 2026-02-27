import postgres from 'postgres';

const projectRef = 'lalpxtoxziyjibifibsx';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHB4dG94eml5amliaWZpYnN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYyNTkyMywiZXhwIjoyMDY5MjAxOTIzfQ.RyLwb38dy5h1DM0jpR0KD_HHZhb6SshE3ZhMKdIWyyY';

// Try postgres.js with pooler
const connectionString = `postgres://postgres.${projectRef}:${serviceRoleKey}@aws-0-ca-central-1.pooler.supabase.com:6543/postgres`;

async function testPostgresJS() {
  console.log('Testing postgres.js connection...\n');
  console.log('Connection string (masked):', connectionString.replace(serviceRoleKey, '***'));
  
  try {
    const sql = postgres(connectionString, {
      prepare: false,
      ssl: { rejectUnauthorized: false }
    });
    
    console.log('\nConnecting...');
    const result = await sql`SELECT current_user, current_database()`;
    console.log('✓ Connected!');
    console.log('User:', result[0].current_user);
    console.log('Database:', result[0].current_database);
    
    // Get tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('\nTables:', tables.map(t => t.table_name).join(', ') || 'none');
    
    await sql.end();
    return true;
  } catch (err) {
    console.error('\n✗ Error:', err.message);
    return false;
  }
}

testPostgresJS().then(success => {
  process.exit(success ? 0 : 1);
});
