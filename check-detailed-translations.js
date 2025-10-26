const { PrismaClient } = require('./src/generated/prisma');

async function checkDetailedTranslations() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking detailed translations for all sections...\n');
    
    const sections = ['hero', 'whoAmI', 'whyChooseUs', 'exclusiveDestinations', 'tourPackages', 'testimonials', 'blog'];
    const languages = ['en', 'de', 'nl', 'zh'];
    
    for (const section of sections) {
      console.log(`\n📄 Section: ${section}`);
      console.log('='.repeat(60));
      
      // Get original content
      const original = await prisma.sectionContent.findUnique({
        where: { sectionId: section }
      });
      
      if (!original) {
        console.log('❌ Section not found');
        continue;
      }
      
      console.log(`📝 Original Content:`);
      console.log(`   Title: ${original.title}`);
      console.log(`   Subtitle: ${original.subtitle}`);
      console.log(`   Description: ${original.description?.substring(0, 100)}...`);
      console.log(`   CTA Text: ${original.ctaText}`);
      
      // Check features if exists
      if (original.features) {
        try {
          const features = JSON.parse(original.features);
          console.log(`   Features: ${features.length} items`);
          features.forEach((feature, i) => {
            console.log(`     ${i+1}. ${feature.title}: ${feature.description}`);
          });
        } catch (e) {
          console.log(`   Features: ${original.features.substring(0, 100)}...`);
        }
      }
      
      // Check stats if exists
      if (original.stats) {
        try {
          const stats = JSON.parse(original.stats);
          console.log(`   Stats: ${stats.length} items`);
          stats.forEach((stat, i) => {
            console.log(`     ${i+1}. ${stat.number} - ${stat.label}`);
          });
        } catch (e) {
          console.log(`   Stats: ${original.stats.substring(0, 100)}...`);
        }
      }
      
      // Check translations for each language
      for (const lang of languages) {
        console.log(`\n🌍 ${lang.toUpperCase()} Translation:`);
        
        const translation = await prisma.sectionContentTranslation.findUnique({
          where: {
            sectionId_language: {
              sectionId: section,
              language: lang
            }
          }
        });
        
        if (translation) {
          console.log(`   ✅ Title: ${translation.title}`);
          console.log(`   ✅ Subtitle: ${translation.subtitle}`);
          console.log(`   ✅ Description: ${translation.description?.substring(0, 100)}...`);
          console.log(`   ✅ CTA Text: ${translation.ctaText}`);
          
          // Check translated features
          if (translation.features) {
            try {
              const features = JSON.parse(translation.features);
              console.log(`   ✅ Features: ${features.length} items`);
              features.forEach((feature, i) => {
                console.log(`     ${i+1}. ${feature.title}: ${feature.description}`);
              });
            } catch (e) {
              console.log(`   ⚠️  Features: ${translation.features.substring(0, 100)}...`);
            }
          } else {
            console.log(`   ❌ Features: Not translated`);
          }
          
          // Check translated stats
          if (translation.stats) {
            try {
              const stats = JSON.parse(translation.stats);
              console.log(`   ✅ Stats: ${stats.length} items`);
              stats.forEach((stat, i) => {
                console.log(`     ${i+1}. ${stat.number} - ${stat.label}`);
              });
            } catch (e) {
              console.log(`   ⚠️  Stats: ${translation.stats.substring(0, 100)}...`);
            }
          } else {
            console.log(`   ❌ Stats: Not translated`);
          }
        } else {
          console.log(`   ❌ No translation found`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDetailedTranslations();

