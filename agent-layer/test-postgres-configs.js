import postgres from 'postgres';

const projectRef = 'lalpxtoxziyjibifibsx';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHB4dG94eml5amliaWZpYnN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYyNTkyMywiZXhwIjoyMDY5MjAxOTIzfQ.RyLwb38dy5h1DM0jpR0KD_HHZhb6SshE3ZhMKdIWyyY';

// Try different configurations
const configs = [
  {
    name: 'Pooler 6543 (no ssl config)',
    host: 'aws-0-ca-central-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    username: `postgres.${projectRef}`,
    password: serviceRoleKey
  },
  {
    name: 'Pooler 5432 (session mode)',
    host: 'aws-0-ca-central-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    username: `postgres.${projectRef}`,
    password: serviceRoleKey
  },
  {
    name: 'Pooler with ssl:require',
    host: 'aws-0-ca-central-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    username: `postgres.${projectRef}`,
    password: serviceRoleKey,
    ssl: 'require'
  }
];

async function testConfigs() {
  for (const config of configs) {
    console.log(`\n🔌 Testing: ${config.name}`);
    
    try {
      const sql = postgres({
        host: config.host,
        port: config.port,
        database: config.database,
        username: config.username,
        password: config.password,
        ssl: config.ssl || false,
        prepare: false,
        max: 1
      });
      
      const result = await sql`SELECT current_user, current_database()`;
      console.log('✅ SUCCESS!');
      console.log('User:', result[0].current_user);
      
      await sql.end();
      return config;
    } catch (err) {
      console.log('❌ FAILED:', err.message.substring(0, 80));
    }
  }
  
  console.log('\n❌ All configs failed');
  return null;
}

testConfigs().then(config => {
  if (config) {
    console.log('\n✅ Working config:', config.name);
    process.exit(0);
  } else {
    process.exit(1);
  }
});
