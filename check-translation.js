const { PrismaClient } = require('./src/generated/prisma');

async function checkTranslation() {
  const prisma = new PrismaClient();
  
  try {
    // Check if there's a translation for whoAmI in English
    const translation = await prisma.sectionContentTranslation.findFirst({
      where: { 
        sectionId: 'whoAmI',
        language: 'en'
      }
    });
    
    if (translation) {
      console.log('Translation found:');
      console.log('Features type:', typeof translation.features);
      console.log('Features value:', translation.features);
      
      // Parse the translation features
      function safeParse(value, fallback) {
        if (!value || typeof value !== 'string') return fallback;
        try {
          return JSON.parse(value);
        } catch (e) {
          return fallback;
        }
      }
      
      const parsedFeatures = safeParse(translation.features, []);
      console.log('Parsed features type:', typeof parsedFeatures);
      console.log('Parsed features value:', parsedFeatures);
      console.log('Is array:', Array.isArray(parsedFeatures));
      
    } else {
      console.log('No translation found for whoAmI in English');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTranslation();
