/**
 * MCP Tool Test Script
 * Tests the new v2 MCP-native endpoints
 */

const BASE_URL = process.env.AGENT_LAYER_URL || 'http://localhost:3000';

async function testMcp() {
  console.log('🧪 Testing Agent Layer v2 MCP endpoints\n');
  
  // Test 1: Health check
  console.log('1️⃣ Health Check');
  const health = await fetch(`${BASE_URL}/health`).then(r => r.json());
  console.log('   Status:', health.status);
  console.log('   Version:', health.version);
  console.log('   Mode:', health.mode);
  console.log();
  
  // Test 2: MCP Initialize
  console.log('2️⃣ MCP Initialize');
  const init = await fetch(`${BASE_URL}/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize'
    })
  }).then(r => r.json());
  console.log('   Protocol:', init.result?.protocolVersion);
  console.log('   Server:', init.result?.serverInfo?.name);
  console.log();
  
  // Test 3: Tools List
  console.log('3️⃣ Tools List');
  const tools = await fetch(`${BASE_URL}/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list'
    })
  }).then(r => r.json());
  console.log('   Available tools:');
  tools.result?.tools?.forEach((t: any) => {
    console.log(`   - ${t.name}`);
  });
  console.log();
  
  // Test 4: Search Clinics
  console.log('4️⃣ Search: Walk-in clinics in Edmonton');
  const clinicSearch = await fetch(`${BASE_URL}/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'agentlayer_search',
        arguments: {
          vertical: 'clinic',
          city: 'edmonton',
          filters: { isWalkIn: true },
          limit: 3
        }
      }
    })
  }).then(r => r.json());
  
  if (clinicSearch.result?.content?.[0]?.text) {
    const data = JSON.parse(clinicSearch.result.content[0].text);
    console.log('   Total:', data.meta?.total);
    console.log('   Places:', data.data?.places?.length || 0);
    data.data?.places?.forEach((p: any) => {
      console.log(`   - ${p.name} (${p.rating}★)`);
    });
  } else {
    console.log('   Error:', clinicSearch.error || 'No data');
  }
  console.log();
  
  // Test 5: Search Playgrounds
  console.log('5️⃣ Search: Playgrounds in Calgary');
  const playgroundSearch = await fetch(`${BASE_URL}/v2/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vertical: 'playground',
      city: 'calgary',
      limit: 3
    })
  }).then(r => r.json());
  
  console.log('   Total:', playgroundSearch.meta?.total);
  console.log('   Places:', playgroundSearch.data?.places?.length || 0);
  playgroundSearch.data?.places?.forEach((p: any) => {
    console.log(`   - ${p.name} (${p.rating}★) - Ages: ${p.attributes?.ageRange?.min || 'All'}+`);
  });
  console.log();
  
  // Test 6: Intent Discovery
  console.log('6️⃣ Intent Discovery: "I need a pediatrician for my kid"');
  const discover = await fetch(`${BASE_URL}/v2/discover`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'I need a pediatrician for my kid'
    })
  }).then(r => r.json());
  
  console.log('   Detected vertical:', discover.data?.vertical);
  console.log('   Confidence:', discover.data?.confidence);
  console.log('   City:', discover.data?.parsed?.location?.city);
  console.log();
  
  // Test 7: Compare Places
  console.log('7️⃣ Compare Places');
  // First get some place IDs
  const searchForCompare = await fetch(`${BASE_URL}/v2/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vertical: 'playground',
      city: 'edmonton',
      limit: 2
    })
  }).then(r => r.json());
  
  const placeIds = searchForCompare.data?.places?.map((p: any) => p.id);
  if (placeIds?.length >= 2) {
    const compare: any = await fetch(`${BASE_URL}/v2/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeIds })
    }).then(r => r.json());
    
    console.log('   Places compared:', compare.data?.comparison?.places?.length);
    console.log('   Differences found:', compare.data?.comparison?.differences?.length);
    console.log('   Recommendations:');
    compare.data?.comparison?.recommendations?.forEach((r: string) => {
      console.log(`   - ${r}`);
    });
  }
  console.log();
  
  // Test 8: Metrics
  console.log('8️⃣ Metrics');
  const metrics: any = await fetch(`${BASE_URL}/metrics`).then(r => r.json());
  console.log('   Clinics total:', metrics.verticals?.clinic?.total);
  console.log('   Playgrounds total:', metrics.verticals?.playground?.total);
  console.log();
  
  console.log('✅ All tests completed!\n');
}

testMcp().catch(err => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
