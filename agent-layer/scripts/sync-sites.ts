/**
 * Sync all sites script
 * Run this to sync data from all registered connectors
 */

import { registerDefaultConnectors, connectors } from '../src/connectors/index.js';
import { db } from '../src/utils/db.js';

async function syncAll() {
  console.log('🔄 Agent Layer - Site Sync');
  console.log('==========================\n');

  // Register connectors
  registerDefaultConnectors();
  
  console.log(`📦 Registered connectors: ${connectors.length}`);
  connectors.forEach(c => console.log(`   - ${c.siteId} (${c.vertical})`));
  console.log('');

  const results = [];
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalErrors = 0;

  for (const connector of connectors) {
    console.log(`\n🔄 Syncing ${connector.siteId}...`);
    const start = Date.now();
    
    try {
      const result = await connector.sync();
      results.push(result);
      
      totalCreated += result.created;
      totalUpdated += result.updated;
      totalErrors += result.errors.length;
      
      console.log(`   ✅ Created: ${result.created}`);
      console.log(`   🔄 Updated: ${result.updated}`);
      console.log(`   ❌ Errors: ${result.errors.length}`);
      console.log(`   ⏱️  Duration: ${result.duration}ms`);
      
      if (result.errors.length > 0) {
        console.log(`   ⚠️  First error: ${result.errors[0]}`);
      }
    } catch (err: any) {
      console.error(`   ❌ Failed: ${err.message}`);
      results.push({
        siteId: connector.siteId,
        created: 0,
        updated: 0,
        errors: [err.message],
        duration: Date.now() - start
      });
    }
  }

  console.log('\n==========================');
  console.log('📊 Sync Summary');
  console.log('==========================');
  console.log(`Total created: ${totalCreated}`);
  console.log(`Total updated: ${totalUpdated}`);
  console.log(`Total errors: ${totalErrors}`);
  console.log(`Connectors: ${connectors.length}`);

  process.exit(totalErrors > 0 ? 1 : 0);
}

syncAll().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
