/**
 * Delete Corrupted Translations
 * 
 * Deletes specific corrupted translations so they can be re-translated fresh
 */

import prisma from '../src/lib/prisma';

async function deleteCorrupted() {
  console.log('\n🗑️  Deleting Corrupted Translations...\n');
  
  // Delete whoAmI EN and DE which are corrupted
  const deleted = await prisma.sectionContentTranslation.deleteMany({
    where: {
      sectionId: 'whoAmI',
      language: { in: ['en', 'de'] }
    }
  });
  
  console.log(`✅ Deleted ${deleted.count} corrupted translations`);
  console.log(`   • whoAmI (EN)`);
  console.log(`   • whoAmI (DE)`);
  
  console.log(`\n📋 Next steps:`);
  console.log(`   1. Re-translate whoAmI from CMS`);
  console.log(`   2. Or run: npx tsx scripts/force-retranslate.ts`);
  console.log('');
}

deleteCorrupted()
  .then(() => process.exit(0))
  .catch(console.error);
