const supabaseUrl = 'https://lalpxtoxziyjibifibsx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHB4dG94eml5amliaWZpYnN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYyNTkyMywiZXhwIjoyMDY5MjAxOTIzfQ.RyLwb38dy5h1DM0jpR0KD_HHZhb6SshE3ZhMKdIWyyY';

// Edmonton Playground data
const EDMONTON_PLAYGROUND_DATA = [
  {
    id: 'launchpad-trampoline',
    name: 'Launchpad Trampoline Park',
    slug: 'launchpad-trampoline-park',
    address: '6141 Currents Dr NW, Edmonton, AB T6W 0L7',
    city: 'edmonton',
    phone: '(780) 760-5867',
    website: 'https://launchpadtrampoline.ca',
    rating: 4.5,
    category: 'trampoline-park',
    description: 'Indoor trampoline park with foam pits, dodgeball, and birthday party packages.',
    features: ['Trampolines', 'Foam Pit', 'Dodgeball', 'Cafe', 'Party Rooms'],
    tags: ['trampoline', 'birthday-parties', 'toddler-friendly', 'teen-friendly'],
    age_range: 'All ages',
    lat: 53.4269,
    lng: -113.6224
  },
  {
    id: 'edmonton-funderdome',
    name: 'Edmonton Funderdome',
    slug: 'edmonton-funderdome',
    address: '10325 51 Ave NW, Edmonton, AB T6H 0K7',
    city: 'edmonton',
    phone: '(780) 436-3833',
    website: 'https://edmontonfunderdome.ca',
    rating: 4.3,
    category: 'indoor-playground',
    description: 'Large indoor playground featuring climbing structures, slides, and soft play areas.',
    features: ['Climbing Structures', 'Slides', 'Ball Pit', 'Cafe', 'Private Party Rooms'],
    tags: ['indoor-playground', 'climbing', 'slides', 'birthday-parties'],
    age_range: '0-12 years',
    lat: 53.4878,
    lng: -113.4965
  },
  {
    id: 'edmonton-treehouse',
    name: 'The Edmonton Treehouse',
    slug: 'edmonton-treehouse',
    address: '10104 103 Ave NW, Edmonton, AB T5J 0H8',
    city: 'edmonton',
    phone: '(780) 990-8733',
    website: 'https://edmontontreehouse.ca',
    rating: 4.6,
    category: 'indoor-playground',
    description: 'Multi-level indoor playground with dedicated toddler area and parent-friendly amenities.',
    features: ['Multi-level Structure', 'Toddler Zone', 'Parent Lounge', 'WiFi', 'Coffee Bar'],
    tags: ['indoor-playground', 'toddler-zone', 'cafe', 'wifi', 'parents-welcome'],
    age_range: '0-10 years',
    lat: 53.5452,
    lng: -113.4938
  },
  {
    id: 'lollipop-playland',
    name: 'Lollipop Playland',
    slug: 'lollipop-playland',
    address: '700 St Albert Trail, St Albert, AB T8N 7A5',
    city: 'st-albert',
    phone: '(780) 459-8687',
    website: 'https://lollipopplayland.com',
    rating: 4.4,
    category: 'indoor-playground',
    description: 'Bright and colorful indoor playground with multiple play zones for different age groups.',
    features: ['Play Zones', 'Toddler Area', 'Party Rooms', 'Snack Bar'],
    tags: ['indoor-playground', 'toddler-friendly', 'birthday-parties'],
    age_range: '0-8 years',
    lat: 53.6532,
    lng: -113.6242
  },
  {
    id: 'shakers-fun-centre',
    name: 'Shakers Fun Centre',
    slug: 'shakers-fun-centre',
    address: '1725 99 St NW, Edmonton, AB T6N 1K5',
    city: 'edmonton',
    phone: '(780) 466-4626',
    website: 'https://shakersfuncentre.com',
    rating: 4.2,
    category: 'family-fun-centre',
    description: 'Family fun centre with indoor playground, arcade games, laser tag, and go-karts.',
    features: ['Indoor Playground', 'Arcade', 'Laser Tag', 'Go-Karts', 'Mini Golf'],
    tags: ['indoor-playground', 'arcade', 'laser-tag', 'go-karts', 'all-ages'],
    age_range: 'All ages',
    lat: 53.4456,
    lng: -113.4723
  },
  {
    id: 'cafe-o-play',
    name: 'Cafe O\'Play',
    slug: 'cafe-o-play',
    address: '5708 111 St NW, Edmonton, AB T6H 3G1',
    city: 'edmonton',
    phone: '(780) 433-7529',
    website: 'https://cafeoplay.com',
    rating: 4.5,
    category: 'cafe-playground',
    description: 'Coffee shop with attached indoor playground - parents can relax while kids play.',
    features: ['Coffee Shop', 'Play Area', 'Toddler Zone', 'WiFi', 'Snacks'],
    tags: ['cafe', 'playground', 'toddlers', 'parents', 'wifi'],
    age_range: '0-6 years',
    lat: 53.4938,
    lng: -113.5145
  },
  {
    id: 'tiny-tots-indoor-play',
    name: 'Tiny Tots Indoor Play',
    slug: 'tiny-tots-indoor-play',
    address: '9258 34 Ave NW, Edmonton, AB T6E 5T5',
    city: 'edmonton',
    phone: '(780) 988-0019',
    website: 'https://tinytotsindoorplay.com',
    rating: 4.7,
    category: 'toddler-playground',
    description: 'Safe indoor play space specifically designed for babies and toddlers.',
    features: ['Soft Play', 'Baby Area', 'Toddler Zone', 'Nursing Room', 'Sanitization Station'],
    tags: ['toddlers', 'babies', 'soft-play', 'safe', 'clean'],
    age_range: '0-4 years',
    lat: 53.4621,
    lng: -113.4789
  },
  {
    id: 'jungle-play',
    name: 'Jungle Play',
    slug: 'jungle-play',
    address: '200-5005 165 Ave NW, Edmonton, AB T5Y 0L8',
    city: 'edmonton',
    phone: '(780) 425-1526',
    website: 'https://jungleplay.ca',
    rating: 4.1,
    category: 'indoor-playground',
    description: 'Jungle-themed indoor playground with slides, ball pits, and climbing structures.',
    features: ['Slides', 'Ball Pit', 'Climbing', 'Jungle Theme', 'Party Area'],
    tags: ['indoor-playground', 'themed', 'birthday-parties'],
    age_range: '1-10 years',
    lat: 53.6254,
    lng: -113.4167
  }
];

// Calgary Playground data
const CALGARY_PLAYGROUND_DATA = [
  {
    id: 'calgary-funderdome',
    name: 'Calgary Funderdome',
    slug: 'calgary-funderdome',
    address: '3838 10 St NE, Calgary, AB T2E 8T9',
    city: 'calgary',
    phone: '(403) 777-0123',
    website: 'https://calgaryfunderdome.ca',
    rating: 4.4,
    category: 'indoor-playground',
    description: 'Multi-level indoor playground with obstacle courses and party rooms.',
    features: ['Obstacle Course', 'Slides', 'Ball Pit', 'Party Rooms', 'Cafe'],
    tags: ['indoor-playground', 'obstacle-course', 'birthday-parties'],
    age_range: '0-12 years',
    lat: 51.0872,
    lng: -114.0423
  },
  {
    id: 'hide-n-seek',
    name: 'Hide N Seek Trampoline Park',
    slug: 'hide-n-seek',
    address: '49 Aero Dr NE, Calgary, AB T2E 8Z9',
    city: 'calgary',
    phone: '(403) 457-5333',
    website: 'https://hidenseekcalgary.com',
    rating: 4.6,
    category: 'trampoline-park',
    description: 'Massive trampoline park with ninja course, climbing walls, and toddler zone.',
    features: ['Trampolines', 'Ninja Course', 'Climbing Wall', 'Toddler Zone', 'Dodgeball'],
    tags: ['trampoline', 'ninja', 'climbing', 'toddlers'],
    age_range: 'All ages',
    lat: 51.0954,
    lng: -114.0356
  },
  {
    id: 'treehouse-calgary',
    name: 'Treehouse Calgary',
    slug: 'treehouse-calgary',
    address: '3451 32 Ave NE, Calgary, AB T1Y 6M7',
    city: 'calgary',
    phone: '(403) 291-0004',
    website: 'https://treehousecalgary.com',
    rating: 4.3,
    category: 'indoor-playground',
    description: 'Treehouse-themed indoor playground with multiple play zones.',
    features: ['Treehouse Structure', 'Slides', 'Toddler Area', 'Cafe', 'Free WiFi'],
    tags: ['indoor-playground', 'themed', 'toddlers', 'cafe'],
    age_range: '0-10 years',
    lat: 51.0834,
    lng: -113.9834
  },
  {
    id: 'gasoline-alley',
    name: 'Gasoline Alley Play Centre',
    slug: 'gasoline-alley',
    address: '100-4807 32 Ave SE, Calgary, AB T2B 2X3',
    city: 'calgary',
    phone: '(403) 272-9191',
    website: 'https://gasolinealley.ca',
    rating: 4.5,
    category: 'indoor-playground',
    description: 'Car and racing themed indoor playground with unique play structures.',
    features: ['Car Theme', 'Racing Track', 'Ball Pit', 'Party Rooms'],
    tags: ['themed', 'cars', 'racing', 'unique'],
    age_range: '0-8 years',
    lat: 51.0167,
    lng: -113.9678
  },
  {
    id: 'play-central',
    name: 'Play Central',
    slug: 'play-central',
    address: '10836 Prairie Hills Rd NW, Calgary, AB T3G 0S9',
    city: 'calgary',
    phone: '(403) 590-7529',
    website: 'https://playcentral.ca',
    rating: 4.2,
    category: 'indoor-playground',
    description: 'Modern indoor playground with interactive digital elements.',
    features: ['Interactive Play', 'Digital Games', 'Climbing', 'Toddler Zone'],
    tags: ['modern', 'interactive', 'digital', 'toddlers'],
    age_range: '0-12 years',
    lat: 51.1556,
    lng: -114.2089
  }
];

function transformPlayground(data) {
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

async function insertPlayground(playground) {
  const transformed = transformPlayground(playground);
  
  const response = await fetch(`${supabaseUrl}/rest/v1/playgrounds`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(transformed)
  });
  
  if (!response.ok) {
    const error = await response.text();
    return { success: false, error, status: response.status };
  }
  
  const data = await response.json();
  return { success: true, data };
}

async function checkTableExists() {
  const response = await fetch(`${supabaseUrl}/rest/v1/playgrounds?select=id&limit=1`, {
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey
    }
  });
  
  if (response.status === 404) {
    return false;
  }
  return true;
}

async function migrateData() {
  const allPlaygrounds = [...EDMONTON_PLAYGROUND_DATA, ...CALGARY_PLAYGROUND_DATA];
  
  console.log(`Total playgrounds to migrate: ${allPlaygrounds.length}`);
  console.log(`- Edmonton area: ${EDMONTON_PLAYGROUND_DATA.length}`);
  console.log(`- Calgary: ${CALGARY_PLAYGROUND_DATA.length}`);
  console.log();
  
  // Check table
  const tableExists = await checkTableExists();
  if (!tableExists) {
    console.error('❌ playgrounds table does not exist!');
    console.log('Please create the table using Supabase SQL Editor with the following SQL:');
    console.log();
    console.log(`CREATE TABLE IF NOT EXISTS playgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT DEFAULT 'AB',
  phone TEXT,
  website TEXT,
  rating DECIMAL(2,1),
  category TEXT DEFAULT 'indoor-playground',
  description TEXT,
  features TEXT[],
  tags TEXT[],
  age_range TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  source_type TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT now()
);`);
    return;
  }
  
  console.log('✅ Table exists, proceeding with migration...\n');
  
  let successCount = 0;
  let failCount = 0;
  const failedItems = [];
  
  for (const playground of allPlaygrounds) {
    const result = await insertPlayground(playground);
    
    if (result.success) {
      console.log(`✅ Success: ${playground.name} (ID: ${result.data[0].id})`);
      successCount++;
    } else {
      console.error(`❌ Failed: ${playground.name}`);
      console.error(`   Status: ${result.status}, Error: ${result.error}`);
      failCount++;
      failedItems.push({ name: playground.name, error: result.error });
    }
  }
  
  console.log();
  console.log('===== MIGRATION SUMMARY =====');
  console.log(`Total: ${allPlaygrounds.length}`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  
  // Verify
  console.log('\n===== VERIFICATION =====');
  const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/playgrounds?select=*`, {
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey
    }
  });
  
  if (verifyResponse.ok) {
    const allData = await verifyResponse.json();
    console.log(`Total records in database: ${allData.length}`);
    
    const edmontonCount = allData.filter(p => p.city === 'edmonton').length;
    const stAlbertCount = allData.filter(p => p.city === 'st-albert').length;
    const calgaryCount = allData.filter(p => p.city === 'calgary').length;
    
    console.log(`  - Edmonton: ${edmontonCount} (expected: 7)`);
    console.log(`  - St Albert: ${stAlbertCount} (expected: 1)`);
    console.log(`  - Calgary: ${calgaryCount} (expected: 5)`);
  }
  
  return { successCount, failCount };
}

migrateData().catch(console.error);
