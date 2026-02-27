import { createClient } from '@supabase/supabase-js';
import { EDMONTON_PLAYGROUND_DATA, CALGARY_PLAYGROUND_DATA } from './playground-schema.js';

const supabaseUrl = 'https://lalpxtoxziyjibifibsx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHB4dG94eml5amliaWZpYnN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYyNTkyMywiZXhwIjoyMDY5MjAxOTIzfQ.RyLwb38dy5h1DM0jpR0KD_HHZhb6SshE3ZhMKdIWyyY';

const supabase = createClient(supabaseUrl, supabaseKey);

function transformPlayground(data: any) {
  return {
    name: data.name,
    slug: data.slug,
    address: data.address,
    city: data.city,
    province: 'AB',
    phone: data.phone,
    website: data.website,
    rating: data.rating,
    category: data.category || 'indoor-playground',
    description: data.description,
    features: data.features || [],
    tags: data.tags || [],
    age_range: data.age_range,
    lat: data.lat,
    lng: data.lng,
    source_type: 'manual',
    subcategories: [],
    images: [],
    amenities: [],
    working_hours: {},
    raw_data: {},
    review_count: 0,
    is_claimed: false
  };
}

async function migrateData() {
  const allPlaygrounds = [
    ...EDMONTON_PLAYGROUND_DATA,
    ...CALGARY_PLAYGROUND_DATA
  ];

  console.log(`Total playgrounds to migrate: ${allPlaygrounds.length}`);
  console.log(`- Edmonton: ${EDMONTON_PLAYGROUND_DATA.length}`);
  console.log(`- Calgary: ${CALGARY_PLAYGROUND_DATA.length}`);
  console.log();

  let successCount = 0;
  let failCount = 0;
  const failedItems: {name: string, error: any}[] = [];

  for (const playground of allPlaygrounds) {
    const transformed = transformPlayground(playground);
    
    const { data, error } = await supabase
      .from('playgrounds')
      .insert(transformed)
      .select('id, name');

    if (error) {
      console.error(`❌ Failed: ${playground.name}`);
      console.error('   Error:', JSON.stringify(error, null, 2));
      failCount++;
      failedItems.push({ name: playground.name, error });
    } else {
      console.log(`✅ Success: ${playground.name} (ID: ${data[0].id})`);
      successCount++;
    }
  }

  console.log();
  console.log('===== MIGRATION SUMMARY =====');
  console.log(`Total: ${allPlaygrounds.length}`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  
  if (failedItems.length > 0) {
    console.log('\nFailed items:');
    failedItems.forEach(item => console.log(`  - ${item.name}: ${item.error?.message || item.error?.code || 'Unknown error'}`));
  }

  // Verify data integrity
  console.log('\n===== VERIFICATION =====');
  const { data: allData, error: countError } = await supabase
    .from('playgrounds')
    .select('*');

  if (countError) {
    console.error('Failed to verify:', countError.message);
  } else {
    console.log(`Total records in database: ${allData?.length || 0}`);
    
    // Check by city
    if (allData) {
      const edmontonCount = allData.filter(p => p.city === 'edmonton').length;
      const stAlbertCount = allData.filter(p => p.city === 'st-albert').length;
      const calgaryCount = allData.filter(p => p.city === 'calgary').length;
      
      console.log(`  - Edmonton: ${edmontonCount} (expected: 7)`);
      console.log(`  - St Albert: ${stAlbertCount} (expected: 1)`);
      console.log(`  - Calgary: ${calgaryCount} (expected: 5)`);
    }
  }

  return { successCount, failCount };
}

migrateData().catch(console.error);
