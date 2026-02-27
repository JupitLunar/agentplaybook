import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lalpxtoxziyjibifibsx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHB4dG94eml5amliaWZpYnN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYyNTkyMywiZXhwIjoyMDY5MjAxOTIzfQ.RyLwb38dy5h1DM0jpR0KD_HHZhb6SshE3ZhMKdIWyyY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDetailedStatus() {
  console.log('📊 Agent Layer v2.0 - 详细状态检查\n');
  console.log('=' .repeat(50));
  
  // 1. Check playgrounds table
  console.log('\n🏞️  Playgrounds Table:');
  const { data: playgrounds, error: pgError, count: pgCount } = await supabase
    .from('playgrounds')
    .select('*', { count: 'exact' });
  
  if (pgError) {
    console.log('   ✗ Error:', pgError.message);
  } else {
    console.log(`   ✓ Table exists: ${pgCount} rows`);
    if (playgrounds && playgrounds.length > 0) {
      playgrounds.slice(0, 3).forEach(p => {
        console.log(`     - ${p.name} (${p.city})`);
      });
      if (pgCount > 3) console.log(`     ... and ${pgCount - 3} more`);
    }
  }
  
  // 2. Check wellness table
  console.log('\n💆 Wellness Table:');
  const { data: wellness, error: wError, count: wCount } = await supabase
    .from('wellness')
    .select('*', { count: 'exact' });
  
  if (wError) {
    console.log('   ✗ Error:', wError.message);
  } else {
    console.log(`   ✓ Table exists: ${wCount} rows`);
    if (wellness && wellness.length > 0) {
      wellness.slice(0, 3).forEach(w => {
        console.log(`     - ${w.name} (${w.city})`);
      });
      if (wCount > 3) console.log(`     ... and ${wCount - 3} more`);
    }
  }
  
  // 3. Check leads table
  console.log('\n📋 Leads Table:');
  const { data: leads, error: lError, count: lCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact' });
  
  if (lError) {
    console.log('   ✗ Error:', lError.message);
  } else {
    console.log(`   ✓ Table exists: ${lCount} rows`);
  }
  
  // 4. Check views
  console.log('\n🔍 Views:');
  try {
    const { data: viewData, error: viewError } = await supabase
      .from('places_view')
      .select('*', { count: 'exact', head: true });
    
    if (viewError && viewError.code === 'PGRST116') {
      console.log('   ✗ places_view: NOT FOUND');
    } else if (viewError) {
      console.log('   ✗ places_view error:', viewError.message);
    } else {
      console.log('   ✓ places_view: EXISTS');
    }
  } catch (e) {
    console.log('   ✗ places_view: Error checking');
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📋 SUMMARY');
  console.log('='.repeat(50));
  
  const dbSetupComplete = !pgError && !wError;
  const hasData = (pgCount > 0) || (wCount > 0);
  
  console.log(`\n✅ 阶段1: 数据库基础设施`);
  console.log(`   状态: ${dbSetupComplete ? '✓ 完成' : '✗ 失败'}`);
  console.log(`   - playgrounds 表: ${!pgError ? '✓' : '✗'}`);
  console.log(`   - wellness 表: ${!wError ? '✓' : '✗'}`);
  console.log(`   - leads 表: ${!lError ? '✓' : '✗'}`);
  
  console.log(`\n⏳ 阶段2: 数据迁移`);
  console.log(`   状态: ${hasData ? '✓ 完成' : '⚠️ 进行中/未开始'}`);
  console.log(`   - Playgrounds 数据: ${pgCount} 条`);
  console.log(`   - Wellness 数据: ${wCount} 条`);
  
  console.log(`\n⏳ 阶段3: API 测试`);
  console.log(`   状态: 待检查 (需要本地服务器运行)`);
  
  console.log(`\n⏳ 阶段4: Render 部署`);
  console.log(`   状态: 待检查`);
}

checkDetailedStatus().catch(console.error);