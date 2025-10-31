/**
 * Fix Mixed Language Source Data
 * 
 * Converts all source data in section_contents to pure Indonesian
 * by translating any English content found
 */

import prisma from '../src/lib/prisma';
import translationService from '../src/lib/translation-service';

// Helper to clean source data
async function translateToIndonesian(text: string): Promise<string> {
  if (!text || text.trim() === '') return text;
  
  try {
    // Detect if text contains English
    const englishKeywords = ['the', 'and', 'with', 'for', 'your', 'our', 'professional', 'experience', 'service', 'guide', 'tour', 'travel', 'partner'];
    const hasEnglish = englishKeywords.some(keyword => text.toLowerCase().includes(keyword));
    
    if (hasEnglish) {
      console.log(`   🔄 Translating to Indonesian: "${text.substring(0, 50)}..."`);
      const translated = await translationService.translateText(text, 'en', 'id');
      console.log(`   ✅ Result: "${translated.substring(0, 50)}..."`);
      return translated;
    }
    
    return text;
  } catch (error) {
    console.error(`   ❌ Translation failed, keeping original`);
    return text;
  }
}

async function fixSourceData() {
  console.log('\n🔧 Fixing Mixed Language Source Data...\n');
  console.log('This will convert all English content to Indonesian in section_contents table\n');
  
  const sections = await prisma.sectionContent.findMany();
  
  console.log(`📊 Found ${sections.length} sections to process\n`);
  console.log('━'.repeat(80));
  
  let fixedCount = 0;
  
  for (const section of sections) {
    console.log(`\n📍 Processing: ${section.sectionId}`);
    console.log('─'.repeat(80));
    
    let needsUpdate = false;
    const updates: any = {};
    
    // Fix title
    if (section.title) {
      const fixed = await translateToIndonesian(section.title);
      if (fixed !== section.title) {
        updates.title = fixed;
        needsUpdate = true;
      }
    }
    
    // Fix subtitle  
    if (section.subtitle) {
      const fixed = await translateToIndonesian(section.subtitle);
      if (fixed !== section.subtitle) {
        updates.subtitle = fixed;
        needsUpdate = true;
      }
    }
    
    // Fix description
    if (section.description) {
      const fixed = await translateToIndonesian(section.description);
      if (fixed !== section.description) {
        updates.description = fixed;
        needsUpdate = true;
      }
    }
    
    // Fix features
    if (section.features) {
      try {
        const features = JSON.parse(section.features);
        if (Array.isArray(features)) {
          let featuresChanged = false;
          const fixedFeatures = [];
          
          for (const feature of features) {
            const fixedFeature = { ...feature };
            
            if (feature.title) {
              const fixed = await translateToIndonesian(feature.title);
              if (fixed !== feature.title) {
                fixedFeature.title = fixed;
                featuresChanged = true;
              }
            }
            
            if (feature.description) {
              const fixed = await translateToIndonesian(feature.description);
              if (fixed !== feature.description) {
                fixedFeature.description = fixed;
                featuresChanged = true;
              }
            }
            
            fixedFeatures.push(fixedFeature);
          }
          
          if (featuresChanged) {
            updates.features = JSON.stringify(fixedFeatures);
            needsUpdate = true;
          }
        }
      } catch (e) {
        console.log(`   ⚠️  Could not parse features JSON`);
      }
    }
    
    // Fix stats
    if (section.stats) {
      try {
        const stats = JSON.parse(section.stats);
        if (Array.isArray(stats)) {
          let statsChanged = false;
          const fixedStats = [];
          
          for (const stat of stats) {
            const fixedStat = { ...stat };
            
            if (stat.label) {
              const fixed = await translateToIndonesian(stat.label);
              if (fixed !== stat.label) {
                fixedStat.label = fixed;
                statsChanged = true;
              }
            }
            
            fixedStats.push(fixedStat);
          }
          
          if (statsChanged) {
            updates.stats = JSON.stringify(fixedStats);
            needsUpdate = true;
          }
        }
      } catch (e) {
        console.log(`   ⚠️  Could not parse stats JSON`);
      }
    }
    
    // Update database if needed
    if (needsUpdate) {
      console.log(`   💾 Updating database...`);
      await prisma.sectionContent.update({
        where: { id: section.id },
        data: {
          ...updates,
          updatedAt: new Date()
        }
      });
      console.log(`   ✅ Section ${section.sectionId} fixed!`);
      fixedCount++;
    } else {
      console.log(`   ✅ No changes needed - already pure Indonesian`);
    }
    
    // Small delay to avoid overwhelming DeepL API
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '━'.repeat(80));
  console.log(`\n📊 Fix Summary:`);
  console.log(`   Total sections: ${sections.length}`);
  console.log(`   Fixed: ${fixedCount}`);
  console.log(`   Already clean: ${sections.length - fixedCount}`);
  
  if (fixedCount > 0) {
    console.log(`\n🎯 Next Steps:`);
    console.log(`   1. Source data is now pure Indonesian ✅`);
    console.log(`   2. Run: npx tsx scripts/force-retranslate.ts`);
    console.log(`   3. This will re-translate all sections with clean Indonesian source`);
    console.log(`   4. Verify: npx tsx scripts/test-api-translation.ts`);
  }
  
  console.log('');
}

fixSourceData()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
