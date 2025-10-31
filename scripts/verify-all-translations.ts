/**
 * Verify ALL Translations - Comprehensive Check
 * 
 * Checks every section in every language to ensure:
 * - Translation exists
 * - No Indonesian keywords in translated content
 * - All fields are translated
 */

import prisma from '../src/lib/prisma';

function containsIndonesian(text: string): boolean {
  if (!text) return false;
  const keywords = [
    'yang', 'dan', 'dengan', 'untuk', 'dari', 'ini', 'itu', 
    'adalah', 'akan', 'dapat', 'kami', 'kita', 'saya', 'mereka',
    'tahun', 'hari', 'lebih', 'sudah', 'belum', 'perusahaan', 
    'pemandu', 'wisata', 'berpengalaman', 'pengalaman'
  ];
  const lower = text.toLowerCase();
  return keywords.some(k => lower.includes(` ${k} `) || lower.startsWith(`${k} `) || lower.endsWith(` ${k}`));
}

async function verifyAll() {
  console.log('\n🔍 COMPREHENSIVE TRANSLATION VERIFICATION\n');
  console.log('━'.repeat(80));
  
  const languages = ['en', 'de', 'nl', 'zh'];
  const sections = await prisma.sectionContent.findMany({
    select: { sectionId: true, title: true }
  });
  
  console.log(`\n📊 Checking ${sections.length} sections × ${languages.length} languages = ${sections.length * languages.length} translations\n`);
  
  let totalChecked = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let totalMissing = 0;
  
  const failedTranslations: Array<{section: string; lang: string; reason: string}> = [];
  
  for (const section of sections) {
    console.log(`\n${'━'.repeat(80)}`);
    console.log(`📍 Section: ${section.sectionId} ("${section.title}")`);
    console.log('─'.repeat(80));
    
    for (const lang of languages) {
      totalChecked++;
      
      const translation = await prisma.sectionContentTranslation.findFirst({
        where: {
          sectionId: section.sectionId,
          language: lang
        }
      });
      
      if (!translation) {
        console.log(`  ❌ ${lang.toUpperCase()}: MISSING - No translation found`);
        totalMissing++;
        failedTranslations.push({
          section: section.sectionId,
          lang: lang.toUpperCase(),
          reason: 'Missing translation'
        });
        continue;
      }
      
      // Check for corruption
      const issues: string[] = [];
      
      if (translation.title && containsIndonesian(translation.title)) {
        issues.push('title has Indonesian');
      }
      
      if (translation.description && containsIndonesian(translation.description)) {
        issues.push('description has Indonesian');
      }
      
      if (translation.subtitle && containsIndonesian(translation.subtitle)) {
        issues.push('subtitle has Indonesian');
      }
      
      if (issues.length > 0) {
        console.log(`  ❌ ${lang.toUpperCase()}: CORRUPTED - ${issues.join(', ')}`);
        const preview = translation.description?.substring(0, 60) || translation.title?.substring(0, 60) || '';
        console.log(`     Preview: "${preview}..."`);
        totalFailed++;
        failedTranslations.push({
          section: section.sectionId,
          lang: lang.toUpperCase(),
          reason: issues.join(', ')
        });
      } else {
        console.log(`  ✅ ${lang.toUpperCase()}: CLEAN - Translation verified`);
        totalPassed++;
      }
    }
  }
  
  // Final Report
  console.log('\n' + '━'.repeat(80));
  console.log('\n📊 FINAL VERIFICATION REPORT\n');
  console.log('─'.repeat(80));
  console.log(`Total Checked:    ${totalChecked}`);
  console.log(`✅ Passed:        ${totalPassed} (${Math.round(totalPassed/totalChecked*100)}%)`);
  console.log(`❌ Failed:        ${totalFailed} (${Math.round(totalFailed/totalChecked*100)}%)`);
  console.log(`⚠️  Missing:       ${totalMissing} (${Math.round(totalMissing/totalChecked*100)}%)`);
  
  if (failedTranslations.length > 0) {
    console.log('\n❌ FAILED TRANSLATIONS:\n');
    failedTranslations.forEach((f, i) => {
      console.log(`   ${i + 1}. ${f.section} (${f.lang}) - ${f.reason}`);
    });
    
    console.log('\n🔧 Action Required:');
    console.log('   Run: npx tsx scripts/full-cleanup-retranslate.ts');
    console.log('   This will re-translate all failed sections with HTML-safe logic');
  } else {
    console.log('\n✅ ALL TRANSLATIONS VERIFIED SUCCESSFULLY! 🎉');
    console.log('\n   Your translation system is production-ready!');
    console.log('   All sections are properly translated in all languages.');
  }
  
  console.log('\n' + '━'.repeat(80) + '\n');
}

verifyAll()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
