/**
 * Test Section Translation API
 * Run: npx tsx scripts/test-api-translation.ts
 */

async function testAPI() {
  console.log('\n🧪 Testing Section Translation API...\n');
  
  const BASE_URL = 'http://localhost:3000';
  const languages = ['en', 'de', 'nl', 'zh'];
  
  console.log('━'.repeat(60));
  console.log('📍 Testing whoAmI section in different languages');
  console.log('━'.repeat(60));
  
  for (const lang of languages) {
    console.log(`\n🌐 Language: ${lang.toUpperCase()}`);
    console.log('─'.repeat(60));
    
    try {
      const response = await fetch(`${BASE_URL}/api/sections?section=whoAmI&language=${lang}`);
      const data = await response.json();
      
      if (data.success) {
        const title = data.data.title || 'N/A';
        const desc = (data.data.description || 'N/A').substring(0, 100);
        const source = data.source || 'N/A';
        const hasDesc = data.debug?.hasDescription ?? 'N/A';
        
        console.log(`  📌 Source: ${source}`);
        console.log(`  📝 Title: ${title}`);
        console.log(`  💬 Description: ${desc}${data.data.description?.length > 100 ? '...' : ''}`);
        console.log(`  ✓  Has Description: ${hasDesc}`);
        
        // Validation
        if (source !== 'database-translation') {
          console.log(`  ⚠️  WARNING: Using ${source} instead of database translation!`);
        }
        if (!hasDesc || hasDesc === 'N/A') {
          console.log(`  ❌ ERROR: Description is missing in translation!`);
        }
        if (data.data.description && data.data.description.includes('Kami adalah perusahaan')) {
          console.log(`  ❌ ERROR: Description is still in Indonesian!`);
        }
      } else {
        console.log(`  ❌ API Error: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`  ❌ Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log(`  💡 Make sure server is running: npm run dev`);
    }
  }
  
  console.log('\n' + '━'.repeat(60));
  console.log('✅ Test complete!\n');
  console.log('📋 What to check:');
  console.log('  1. Source should be "database-translation" for all languages');
  console.log('  2. Description should be in the target language (not Indonesian)');
  console.log('  3. "Has Description" should be "true"');
  console.log('\n🔧 If any test fails:');
  console.log('  - Check server is running (npm run dev)');
  console.log('  - Re-translate from CMS if needed');
  console.log('  - Clear browser cache (Ctrl+Shift+R)');
  console.log('');
}

testAPI()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
