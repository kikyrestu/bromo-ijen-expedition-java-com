/**
 * Check Database Translation Directly
 */

import prisma from '../src/lib/prisma';

async function checkDB() {
  console.log('\n🔍 Checking whoAmI translations in database...\n');
  
  const translations = await prisma.sectionContentTranslation.findMany({
    where: {
      sectionId: 'whoAmI',
      language: { in: ['en', 'de', 'nl', 'zh'] }
    },
    select: {
      id: true,
      language: true,
      title: true,
      description: true,
      updatedAt: true
    },
    orderBy: { language: 'asc' }
  });
  
  for (const t of translations) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Language: ${t.language.toUpperCase()}`);
    console.log(`ID: ${t.id}`);
    console.log(`Updated: ${t.updatedAt.toISOString()}`);
    console.log(`Title: "${t.title}"`);
    console.log(`Description (first 150 chars):`);
    console.log(`"${t.description?.substring(0, 150)}..."`);
    
    // Check for Indonesian keywords
    if (t.description && t.description.toLowerCase().includes('saya adalah')) {
      console.log(`❌ CORRUPTED: Contains "Saya adalah" (Indonesian!)`);
    } else if (t.description) {
      console.log(`✅ Looks clean`);
    }
  }
  
  console.log('\n');
}

checkDB()
  .then(() => process.exit(0))
  .catch(console.error);
