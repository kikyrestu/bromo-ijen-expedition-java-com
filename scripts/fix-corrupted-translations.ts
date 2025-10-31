/**
 * Fix Corrupted Translations
 * 
 * This script detects and fixes translations that still contain Indonesian text
 * Run: npx tsx scripts/fix-corrupted-translations.ts
 */

import prisma from '../src/lib/prisma';

/**
 * Detect if text contains Indonesian keywords
 */
function containsIndonesian(text: string): boolean {
  if (!text || text.trim() === '') return false;
  
  const indonesianKeywords = [
    'yang', 'dan', 'dengan', 'untuk', 'dari', 'ini', 'itu', 'di ', 'ke ', 'pada',
    'adalah', 'akan', 'dapat', 'kami', 'kita', 'saya', 'mereka', 'anda',
    'tahun', 'hari', 'bulan', 'minggu', 'waktu', 'tempat', 'orang', 'baik',
    'besar', 'kecil', 'banyak', 'sedikit', 'lebih', 'kurang', 'sudah', 'belum',
    'perusahaan', 'pemandu', 'wisata', 'berpengalaman', 'pengalaman'
  ];
  
  const lowerText = text.toLowerCase();
  return indonesianKeywords.some(keyword => lowerText.includes(keyword));
}

/**
 * Check a single field for corruption
 */
function checkField(fieldName: string, value: string | null): { corrupted: boolean; preview: string } {
  if (!value) {
    return { corrupted: false, preview: 'NULL' };
  }
  
  const corrupted = containsIndonesian(value);
  const preview = value.substring(0, 80) + (value.length > 80 ? '...' : '');
  
  return { corrupted, preview };
}

async function scanAndFixTranslations() {
  console.log('\n🔍 Scanning for corrupted translations...\n');
  
  const languages = ['en', 'de', 'nl', 'zh'];
  let totalCorrupted = 0;
  const corruptedSections: Array<{ section: string; language: string; fields: string[] }> = [];
  
  // Get all section translations
  const translations = await prisma.sectionContentTranslation.findMany({
    where: {
      language: { in: languages }
    },
    select: {
      id: true,
      sectionId: true,
      language: true,
      title: true,
      subtitle: true,
      description: true,
      features: true,
      stats: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: [
      { sectionId: 'asc' },
      { language: 'asc' }
    ]
  });
  
  console.log(`📊 Found ${translations.length} translations to check\n`);
  console.log('━'.repeat(80));
  
  for (const translation of translations) {
    const corruptedFields: string[] = [];
    
    // Check each field
    const titleCheck = checkField('title', translation.title);
    const subtitleCheck = checkField('subtitle', translation.subtitle);
    const descCheck = checkField('description', translation.description);
    
    if (titleCheck.corrupted) corruptedFields.push('title');
    if (subtitleCheck.corrupted) corruptedFields.push('subtitle');
    if (descCheck.corrupted) corruptedFields.push('description');
    
    // Check JSON fields
    if (translation.features) {
      try {
        const features = JSON.parse(translation.features);
        if (Array.isArray(features)) {
          for (const feature of features) {
            if (containsIndonesian(feature.title) || containsIndonesian(feature.description)) {
              corruptedFields.push('features');
              break;
            }
          }
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
    
    if (translation.stats) {
      try {
        const stats = JSON.parse(translation.stats);
        if (Array.isArray(stats)) {
          for (const stat of stats) {
            if (containsIndonesian(stat.label)) {
              corruptedFields.push('stats');
              break;
            }
          }
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
    
    if (corruptedFields.length > 0) {
      totalCorrupted++;
      corruptedSections.push({
        section: translation.sectionId,
        language: translation.language,
        fields: corruptedFields
      });
      
      console.log(`\n❌ CORRUPTED: ${translation.sectionId} (${translation.language.toUpperCase()})`);
      console.log(`   ID: ${translation.id.substring(0, 12)}...`);
      console.log(`   Corrupted fields: ${corruptedFields.join(', ')}`);
      
      if (corruptedFields.includes('title')) {
        console.log(`   📝 Title: "${titleCheck.preview}"`);
      }
      if (corruptedFields.includes('description')) {
        console.log(`   💬 Description: "${descCheck.preview}"`);
      }
      
      console.log(`   📅 Last updated: ${translation.updatedAt.toISOString()}`);
    }
  }
  
  console.log('\n' + '━'.repeat(80));
  console.log(`\n📊 Scan Results:`);
  console.log(`   Total translations checked: ${translations.length}`);
  console.log(`   Corrupted translations found: ${totalCorrupted}`);
  console.log(`   Clean translations: ${translations.length - totalCorrupted}`);
  
  if (totalCorrupted > 0) {
    console.log(`\n🔧 Corrupted Sections Summary:`);
    
    // Group by section
    const groupedBySection: Record<string, string[]> = {};
    for (const item of corruptedSections) {
      if (!groupedBySection[item.section]) {
        groupedBySection[item.section] = [];
      }
      groupedBySection[item.section].push(item.language.toUpperCase());
    }
    
    for (const [section, langs] of Object.entries(groupedBySection)) {
      console.log(`   • ${section}: ${langs.join(', ')}`);
    }
    
    console.log(`\n💡 How to Fix:`);
    console.log(`   1. Go to: http://localhost:3000/cms/translations`);
    console.log(`   2. Find the corrupted sections listed above`);
    console.log(`   3. Click "Translate [Section Name]" button for each`);
    console.log(`   4. Wait for translation to complete`);
    console.log(`   5. Run this script again to verify`);
    
    console.log(`\n🚀 Or use the auto-fix script:`);
    console.log(`   npx tsx scripts/force-retranslate.ts --section whoAmI --languages en,de`);
  } else {
    console.log(`\n✅ All translations are clean! No corruption detected.`);
  }
  
  console.log('');
}

scanAndFixTranslations()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
