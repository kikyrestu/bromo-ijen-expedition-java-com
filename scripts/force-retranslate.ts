/**
 * Force Re-translate Sections
 * 
 * Forces re-translation of specific sections to fix corrupted translations
 * Run: npx tsx scripts/force-retranslate.ts
 */

async function forceRetranslate() {
  console.log('\n🔄 Force Re-translating Sections...\n');
  
  const BASE_URL = 'http://localhost:3000';
  
  // Sections to re-translate (detected as corrupted by scanner)
  const sectionsToFix = [
    { section: 'whoAmI', languages: ['en', 'de', 'nl'] },
    { section: 'whyChooseUs', languages: ['en', 'de', 'nl'] },
    { section: 'exclusiveDestinations', languages: ['nl'] },
    { section: 'blog', languages: ['de'] },
    { section: 'gallery', languages: ['de'] },
  ];
  
  console.log('📋 Sections to re-translate:');
  for (const item of sectionsToFix) {
    console.log(`   • ${item.section}: ${item.languages.map(l => l.toUpperCase()).join(', ')}`);
  }
  console.log('');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const { section, languages } of sectionsToFix) {
    console.log(`\n${'━'.repeat(80)}`);
    console.log(`🔄 Re-translating: ${section}`);
    console.log('─'.repeat(80));
    
    try {
      // Trigger translation via API
      const response = await fetch(`${BASE_URL}/api/translations/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType: 'section',
          contentId: section,
          forceRetranslate: true  // Force overwrite existing translations
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Translation triggered successfully for ${section}`);
        console.log(`   📝 Languages being translated: EN, DE, NL, ZH`);
        
        // Show logs if available
        if (data.logs && Array.isArray(data.logs)) {
          console.log(`   📋 Translation logs:`);
          for (const log of data.logs) {
            const emojiMap: Record<string, string> = {
              success: '✅',
              error: '❌',
              warning: '⚠️',
              info: 'ℹ️'
            };
            const emoji = emojiMap[log.type] || '•';
            console.log(`      ${emoji} ${log.message}`);
          }
        }
        
        successCount++;
        
        // Wait a bit before next translation to avoid overwhelming DeepL API
        console.log(`   ⏳ Waiting 3 seconds before next translation...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        console.error(`❌ Translation failed for ${section}`);
        console.error(`   Error: ${data.error || 'Unknown error'}`);
        if (data.details) {
          console.error(`   Details: ${data.details}`);
        }
        errorCount++;
      }
    } catch (error) {
      console.error(`❌ Network error for ${section}:`, error instanceof Error ? error.message : 'Unknown error');
      console.error(`   💡 Make sure server is running: npm run dev`);
      errorCount++;
    }
  }
  
  console.log(`\n${'━'.repeat(80)}`);
  console.log(`\n📊 Re-translation Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📋 Total: ${sectionsToFix.length}`);
  
  if (successCount > 0) {
    console.log(`\n⏳ Waiting 10 seconds for translations to complete...`);
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log(`\n🔍 Verifying translations...`);
    console.log(`   Run: npx tsx scripts/test-api-translation.ts`);
    console.log(`   Or check in browser: http://localhost:3000/en`);
  }
  
  console.log('');
}

forceRetranslate()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
