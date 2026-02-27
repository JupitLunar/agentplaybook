import pg from 'pg';

const { Client } = pg;

const projectRef = 'lalpxtoxziyjibifibsx';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHB4dG94eml5amliaWZpYnN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYyNTkyMywiZXhwIjoyMDY5MjAxOTIzfQ.RyLwb38dy5h1DM0jpR0KD_HHZhb6SshE3ZhMKdIWyyY';

// Try IPv4 addon and other formats
const configs = [
  {
    name: 'IPv4 Pooler (common format)',
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: serviceRoleKey,
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'Pooler AP-SOUTHEAST-1',
    host: 'aws-0-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: `postgres.${projectRef}`,
    password: serviceRoleKey,
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'Pooler EU-WEST-1',
    host: 'aws-0-eu-west-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: `postgres.${projectRef}`,
    password: serviceRoleKey,
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'Pooler AP-NORTHEAST-1',
    host: 'aws-0-ap-northeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: `postgres.${projectRef}`,
    password: serviceRoleKey,
    ssl: { rejectUnauthorized: false }
  },
  // Try session pooler on various regions
  {
    name: 'Session Pooler CA (5432)',
    host: 'aws-0-ca-central-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: `postgres.${projectRef}`,
    password: serviceRoleKey,
    ssl: { rejectUnauthorized: false }
  }
];

async function testConnections() {
  for (const config of configs) {
    console.log(`\n🔌 Testing: ${config.name}`);
    console.log(`   Host: ${config.host}:${config.port}`);
    
    const client = new Client(config);
    
    try {
      await client.connect();
      const result = await client.query('SELECT current_user, current_database(), version()');
      console.log(`   ✅ SUCCESS!`);
      console.log(`   User: ${result.rows[0].current_user}`);
      console.log(`   DB: ${result.rows[0].current_database}`);
      
      // Get tables
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      console.log(`   Tables: ${tables.rows.map(r => r.table_name).join(', ') || 'none'}`);
      
      await client.end();
      return config;
    } catch (err) {
      console.log(`   ❌ FAILED: ${err.message.substring(0, 80)}`);
      try { await client.end(); } catch (e) {}
    }
  }
  
  console.log('\n❌ All connection attempts failed');
  return null;
}

testConnections().then(config => {
  if (config) {
    console.log(`\n✅ Working config: ${config.name}`);
    console.log(`   Host: ${config.host}`);
    console.log(`   Port: ${config.port}`);
    console.log(`   User: ${config.user}`);
    process.exit(0);
  } else {
    process.exit(1);
  }
});
