import pg from 'pg';

const { Client } = pg;

const projectRef = 'lalpxtoxziyjibifibsx';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHB4dG94eml5amliaWZpYnN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYyNTkyMywiZXhwIjoyMDY5MjAxOTIzfQ.RyLwb38dy5h1DM0jpR0KD_HHZhb6SshE3ZhMKdIWyyY';

// Try multiple AWS regions
const regions = [
  'us-east-1',
  'us-west-1', 
  'us-west-2',
  'ca-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-central-1',
  'ap-southeast-1',
  'ap-northeast-1'
];

async function findRegion() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    console.log(`Trying region: ${region} (${host})`);
    
    const config = {
      host: host,
      port: 5432,
      database: 'postgres',
      user: `postgres.${projectRef}`,
      password: serviceRoleKey,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    };
    
    const client = new Client(config);
    
    try {
      await client.connect();
      const result = await client.query('SELECT current_user, current_database()');
      console.log(`  ✅ SUCCESS! Region is: ${region}`);
      await client.end();
      return region;
    } catch (err) {
      console.log(`  ❌ ${err.message}`);
      try {
        await client.end();
      } catch (e) {}
    }
  }
  
  return null;
}

findRegion().then(region => {
  if (region) {
    console.log(`\n🎯 Found: ${region}`);
  } else {
    console.log('\n❌ Could not find region');
  }
});