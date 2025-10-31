/**
 * Script to check translation status in database
 * Run with: npx tsx scripts/check-translations.ts
 */

import prisma from '../src/lib/prisma';

async function checkTranslations() {
  console.log('\n🔍 Checking Section Translations Status...\n');
  
  // Get all sections
  const sections = await prisma.sectionContent.findMany({
    select: {
      sectionId: true,
      title: true
    }
  });

  console.log(`📋 Found ${sections.length} sections in database\n`);

  for (const section of sections) {
    console.log(`\n📍 Section: ${section.sectionId} ("${section.title}")`);
    console.log('─'.repeat(60));

    // Check translations for each language
    const languages = ['en', 'de', 'nl', 'zh'];
    
    for (const lang of languages) {
      const translation = await prisma.sectionContentTranslation.findFirst({
        where: {
          sectionId: section.sectionId,
          language: lang
        },
        select: {
          id: true,
          language: true,
          title: true,
          subtitle: true,
          description: true,
          features: true,
          stats: true,
          destinations: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (translation) {
        console.log(`  ✅ ${lang.toUpperCase()}: Translation exists (ID: ${translation.id.substring(0, 8)}...)`);
        console.log(`      Created: ${translation.createdAt.toISOString()}`);
        console.log(`      Updated: ${translation.updatedAt.toISOString()}`);
        
        // Check which fields are translated
        const fields = {
          title: !!translation.title,
          subtitle: !!translation.subtitle,
          description: !!translation.description,
          features: !!translation.features,
          stats: !!translation.stats,
          destinations: !!translation.destinations
        };
        
        const translatedFields = Object.entries(fields)
          .filter(([_, hasValue]) => hasValue)
          .map(([field, _]) => field);
        
        const missingFields = Object.entries(fields)
          .filter(([_, hasValue]) => !hasValue)
          .map(([field, _]) => field);

        if (translatedFields.length > 0) {
          console.log(`      📝 Translated: ${translatedFields.join(', ')}`);
        }
        
        if (missingFields.length > 0) {
          console.log(`      ⚠️  Missing: ${missingFields.join(', ')}`);
        }
        
        // Show description preview if exists
        if (translation.description) {
          const preview = translation.description.substring(0, 100);
          console.log(`      💬 Description preview: "${preview}${translation.description.length > 100 ? '...' : ''}"`);
        } else {
          console.log(`      ❌ Description is NULL or empty!`);
        }
      } else {
        console.log(`  ❌ ${lang.toUpperCase()}: NO translation found`);
        console.log(`      👉 Run translation from CMS > Translations`);
      }
    }
  }

  console.log('\n✅ Translation check complete!\n');
}

checkTranslations()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
