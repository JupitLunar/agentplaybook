#!/usr/bin/env node
/**
 * Test Agent Layer API endpoints
 */

const BASE_URL = 'http://localhost:3002';

async function test() {
  console.log('🧪 Testing Agent Layer API\n');
  
  // Test health
  console.log('1. Health check...');
  const health = await fetch(`${BASE_URL}/health`).then(r => r.json());
  console.log('   ✅ Status:', health.status);
  console.log('   ✅ Verticals:', health.verticals.join(', '));
  
  // Test metrics
  console.log('\n2. Data metrics...');
  const metrics = await fetch(`${BASE_URL}/metrics`).then(r => r.json());
  console.log('   📊 Clinics:', metrics.verticals.clinic?.total || 0);
  console.log('   📊 Playgrounds:', metrics.verticals.playground?.total || 0);
  console.log('   📊 Wellness:', metrics.verticals.wellness?.total || 0);
  
  // Test clinic search
  console.log('\n3. Search clinics in Calgary...');
  const clinicSearch = await fetch(`${BASE_URL}/v2/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vertical: 'clinic', city: 'calgary', limit: 2 })
  }).then(r => r.json());
  console.log('   ✅ Found:', clinicSearch.meta.total, 'clinics');
  console.log('   ✅ First:', clinicSearch.data.places[0]?.name);
  
  // Test playground search
  console.log('\n4. Search playgrounds in Edmonton...');
  const playgroundSearch = await fetch(`${BASE_URL}/v2/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vertical: 'playground', city: 'edmonton', limit: 2 })
  }).then(r => r.json());
  console.log('   ⚠️  Found:', playgroundSearch.meta.total, 'playgrounds');
  if (playgroundSearch.meta.total === 0) {
    console.log('   💡 Need to: Create Supabase table + migrate SQLite data');
  }
  
  // Test MCP tools/list
  console.log('\n5. MCP tools/list...');
  const mcpTools = await fetch(`${BASE_URL}/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' })
  }).then(r => r.json());
  console.log('   ✅ Available tools:', mcpTools.result?.tools?.length || 0);
  
  console.log('\n✨ All tests completed!');
}

test().catch(err => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
