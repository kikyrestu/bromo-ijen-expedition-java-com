/**
 * Full Cleanup and Re-translate ALL Sections
 * 
 * PRODUCTION FIX: Cleans ALL corrupted translations and re-translates everything
 * This is the ONE-TIME fix after implementing HTML stripping logic
 */

import prisma from '../src/lib/prisma';

async function fullCleanup() {
  console.log('\n🔥 FULL CLEANUP & RE-TRANSLATE - Production Fix\n');
  console.log('This will:');
  console.log('  1. Delete ALL existing translations (clean slate)');
  console.log('  2. Re-translate ALL sections with new HTML-safe logic');
  console.log('  3. Verify all translations are clean\n');
  
  // Step 1: Get all sections
  const sections = await prisma.sectionContent.findMany({
    select: { sectionId: true, title: true }
  });
  
  console.log(`📊 Found ${sections.length} sections:\n`);
  sections.forEach((s, i) => {
    console.log(`   ${i + 1}. ${s.sectionId} - "${s.title}"`);
  });
  
  // Step 2: Delete ALL existing translations
  console.log('\n━'.repeat(80));
  console.log('🗑️  Deleting ALL existing translations...\n');
  
  const deleted = await prisma.sectionContentTranslation.deleteMany({});
  console.log(`✅ Deleted ${deleted.count} translations (clean slate)\n`);
  
  // Step 3: Trigger re-translation for ALL sections
  console.log('━'.repeat(80));
  console.log('🔄 Triggering re-translation for ALL sections...\n');
  
  const BASE_URL = 'http://localhost:3000';
  let successCount = 0;
  let failCount = 0;
  
  for (const section of sections) {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`📍 Translating: ${section.sectionId}`);
    console.log('─'.repeat(80));
    
    try {
      const response = await fetch(`${BASE_URL}/api/translations/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'section',
          contentId: section.sectionId,
          forceRetranslate: true
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Translation triggered for ${section.sectionId}`);
        successCount++;
        
        // Wait between translations to avoid overwhelming API
        console.log(`⏳ Waiting 3 seconds before next section...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        console.error(`❌ Failed to translate ${section.sectionId}`);
        console.error(`   Error: ${data.error || 'Unknown'}`);
        failCount++;
      }
    } catch (error) {
      console.error(`❌ Network error for ${section.sectionId}:`, error instanceof Error ? error.message : 'Unknown');
      failCount++;
    }
  }
  
  // Step 4: Summary
  console.log('\n' + '━'.repeat(80));
  console.log('\n📊 Cleanup & Re-translation Summary:\n');
  console.log(`   Total sections: ${sections.length}`);
  console.log(`   ✅ Successfully triggered: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  
  if (successCount > 0) {
    const estimatedTime = successCount * 30; // ~30 seconds per section
    console.log(`\n⏳ Estimated completion time: ~${Math.ceil(estimatedTime / 60)} minutes`);
    console.log(`\n📋 Next Steps:`);
    console.log(`   1. Wait ${Math.ceil(estimatedTime / 60)} minutes for all translations to complete`);
    console.log(`   2. Run: npx tsx scripts/verify-all-translations.ts`);
    console.log(`   3. Check in browser: http://localhost:3000/en`);
    console.log(`   4. Check CMS Translation Manager for preview`);
  }
  
  console.log('');
}

fullCleanup()
  .then(() => {
    console.log('✅ Done! Translations are processing in background.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
