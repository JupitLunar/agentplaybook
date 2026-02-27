import pg from 'pg';

const { Client } = pg;

// Supabase project reference
const projectRef = 'lalpxtoxziyjibifibsx';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHB4dG94eml5amliaWZpYnN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYyNTkyMywiZXhwIjoyMDY5MjAxOTIzfQ.RyLwb38dy5h1DM0jpR0KD_HHZhb6SshE3ZhMKdIWyyY';

// Connection via transaction pooler
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

async function setupDatabase() {
  console.log('========================================');
  console.log('Database Setup - Creating Missing Tables');
  console.log('========================================\n');
  
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✓ Connected to Supabase\n');
    
    // Check current tables
    console.log('Checking existing tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('Current tables:', tablesResult.rows.map(r => r.table_name).join(', ') || 'none');
    console.log('');
    
    // 1. Create playgrounds table
    console.log('1. Creating playgrounds table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS playgrounds (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        site_id TEXT NOT NULL,
        external_id TEXT,
        name TEXT NOT NULL,
        description TEXT,
        address TEXT,
        city TEXT,
        province TEXT,
        postal_code TEXT,
        country TEXT DEFAULT 'Canada',
        phone TEXT,
        email TEXT,
        website TEXT,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        amenities JSONB,
        images JSONB,
        hours JSONB,
        price_range TEXT,
        rating DECIMAL(2,1),
        review_count INTEGER,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(site_id, external_id)
      )
    `);
    console.log('   ✓ Playgrounds table created\n');
    
    // 2. Create wellness table
    console.log('2. Creating wellness table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS wellness (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        site_id TEXT NOT NULL,
        external_id TEXT,
        name TEXT NOT NULL,
        description TEXT,
        address TEXT,
        city TEXT,
        province TEXT,
        postal_code TEXT,
        country TEXT DEFAULT 'Canada',
        phone TEXT,
        email TEXT,
        website TEXT,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        services JSONB,
        images JSONB,
        hours JSONB,
        price_range TEXT,
        rating DECIMAL(2,1),
        review_count INTEGER,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(site_id, external_id)
      )
    `);
    console.log('   ✓ Wellness table created\n');
    
    // 3. Create places_view
    console.log('3. Creating places_view...');
    await client.query(`
      CREATE OR REPLACE VIEW places_view AS
      SELECT 
        id,
        site_id,
        external_id,
        name,
        description,
        address,
        city,
        province,
        country,
        phone,
        email,
        website,
        latitude,
        longitude,
        COALESCE(amenities, services) as features,
        images,
        hours,
        price_range,
        rating,
        review_count,
        status,
        created_at,
        updated_at,
        CASE 
          WHEN site_id LIKE '%playground%' THEN 'playground'
          WHEN site_id LIKE '%wellness%' OR site_id LIKE '%clinic%' THEN 'wellness'
          ELSE 'other'
        END as vertical
      FROM playgrounds
      UNION ALL
      SELECT 
        id,
        site_id,
        external_id,
        name,
        description,
        address,
        city,
        province,
        country,
        phone,
        email,
        website,
        latitude,
        longitude,
        services as features,
        images,
        hours,
        price_range,
        rating,
        review_count,
        status,
        created_at,
        updated_at,
        'wellness' as vertical
      FROM wellness
    `);
    console.log('   ✓ places_view created\n');
    
    // 4. Verify all tables exist
    console.log('4. Verifying tables and views...');
    
    // Check playgrounds
    const pgResult = await client.query(`SELECT COUNT(*) as count FROM playgrounds`);
    console.log(`   ✓ playgrounds table: ${pgResult.rows[0].count} rows`);
    
    // Check wellness
    const wellnessResult = await client.query(`SELECT COUNT(*) as count FROM wellness`);
    console.log(`   ✓ wellness table: ${wellnessResult.rows[0].count} rows`);
    
    // Check places_view
    const viewResult = await client.query(`SELECT COUNT(*) as count FROM places_view`);
    console.log(`   ✓ places_view: ${viewResult.rows[0].count} rows`);
    
    // Get final table list
    const finalTables = await client.query(`
      SELECT table_name, 'table' as type
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      UNION ALL
      SELECT table_name, 'view' as type
      FROM information_schema.views
      WHERE table_schema = 'public'
      ORDER BY type, table_name
    `);
    
    console.log('\n========================================');
    console.log('Final Database Objects:');
    console.log('========================================');
    finalTables.rows.forEach(row => {
      console.log(`  [${row.type.toUpperCase()}] ${row.table_name}`);
    });
    
    await client.end();
    
    console.log('\n========================================');
    console.log('SUCCESS: All tables and views created!');
    console.log('========================================');
    
    return { success: true };
    
  } catch (err) {
    console.error('\n✗ ERROR:', err.message);
    console.error(err.stack);
    try {
      await client.end();
    } catch (e) {}
    process.exit(1);
  }
}

setupDatabase();
