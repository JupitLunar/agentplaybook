import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

// Supabase project reference from the URL
const projectRef = 'lalpxtoxziyjibifibsx';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHB4dG94eml5amliaWZpYnN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYyNTkyMywiZXhwIjoyMDY5MjAxOTIzfQ.RyLwb38dy5h1DM0jpR0KD_HHZhb6SshE3ZhMKdIWyyY';

// Connection config for Supabase pooler (Transaction mode)
const config = {
  host: `aws-0-ca-central-1.pooler.supabase.com`,
  port: 6543,
  database: 'postgres',
  user: `postgres.${projectRef}`,
  password: serviceRoleKey,
  ssl: {
    rejectUnauthorized: false
  }
};

async function executeSQL() {
  const sqlPath = process.argv[2] || './setup-database.sql';
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  console.log('Connecting to Supabase database...');
  console.log(`Host: ${config.host}`);
  console.log(`Database: ${config.database}`);
  console.log(`User: ${config.user}`);
  
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✓ Connected successfully\n');
    
    console.log('Executing SQL...\n');
    const result = await client.query(sql);
    console.log('✓ SQL executed successfully\n');
    
    if (result.command) {
      console.log(`Command: ${result.command}`);
    }
    if (result.rowCount !== null) {
      console.log(`Rows affected: ${result.rowCount}`);
    }
    
    // Verify tables were created
    console.log('\n----------------------------------------');
    console.log('Verifying database objects...');
    console.log('----------------------------------------');
    
    const tablesQuery = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('playgrounds', 'wellness')
      ORDER BY table_name;
    `);
    
    console.log('\nTables created:');
    if (tablesQuery.rows.length === 0) {
      console.log('  (none found)');
    } else {
      tablesQuery.rows.forEach(row => {
        console.log(`  ✓ ${row.table_name}`);
      });
    }
    
    const viewsQuery = await client.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public' 
      AND table_name = 'places_view';
    `);
    
    console.log('\nViews created:');
    if (viewsQuery.rows.length === 0) {
      console.log('  (none found)');
    } else {
      viewsQuery.rows.forEach(row => {
        console.log(`  ✓ ${row.table_name}`);
      });
    }
    
    // Check sample data
    const playgroundsCount = await client.query('SELECT COUNT(*) FROM playgrounds;');
    const wellnessCount = await client.query('SELECT COUNT(*) FROM wellness;');
    
    console.log('\nSample data inserted:');
    console.log(`  Playgrounds: ${playgroundsCount.rows[0].count} rows`);
    console.log(`  Wellness: ${wellnessCount.rows[0].count} rows`);
    
    await client.end();
    console.log('\n✓ Database setup complete!');
    
  } catch (err) {
    console.error('\n✗ Error:', err.message);
    if (err.stack) {
      console.error('\nStack:', err.stack);
    }
    try {
      await client.end();
    } catch (e) {}
    process.exit(1);
  }
}

executeSQL();
