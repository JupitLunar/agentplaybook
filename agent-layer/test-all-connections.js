import pg from 'pg';

const { Client } = pg;

const projectRef = 'lalpxtoxziyjibifibsx';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHB4dG94eml5amliaWZpYnN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYyNTkyMywiZXhwIjoyMDY5MjAxOTIzfQ.RyLwb38dy5h1DM0jpR0KD_HHZhb6SshE3ZhMKdIWyyY';

// Try various connection configurations
const configs = [
  {
    name: 'Pooler CA-CENTRAL-1 Port 6543',
    host: 'aws-0-ca-central-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: `postgres.${projectRef}`,
    password: serviceRoleKey,
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'Pooler US-EAST-1 Port 6543',
    host: 'aws-0-us-east-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: `postgres.${projectRef}`,
    password: serviceRoleKey,
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'Pooler US-WEST-1 Port 6543 (user with .ref)',
    host: 'aws-0-us-west-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: `postgres.${projectRef}`,
    password: serviceRoleKey,
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'Direct db.ref.supabase.co',
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: serviceRoleKey,
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'Direct with .ref user',
    host: `db.${projectRef}.supabase.co`,
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
    console.log(`   User: ${config.user}`);
    
    const client = new Client(config);
    
    try {
      await client.connect();
      const result = await client.query('SELECT current_user, version()');
      console.log(`   ✅ SUCCESS!`);
      console.log(`   Connected as: ${result.rows[0].current_user}`);
      
      // List tables
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
      console.log(`   ❌ FAILED: ${err.message}`);
      try {
        await client.end();
      } catch (e) {}
    }
  }
  
  console.log('\n❌ All connection attempts failed');
  return null;
}

testConnections().then(config => {
  if (config) {
    console.log(`\n✅ Working config found: ${config.name}`);
    process.exit(0);
  } else {
    process.exit(1);
  }
});
