/**
 * Manual trigger translation dengan better error handling
 * Pastikan dev server running di port 3000!
 */

const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

async function checkServerRunning() {
  try {
    const response = await fetch('http://localhost:3000/api/health');
    return response.ok;
  } catch {
    return false;
  }
}

async function translateSection(sectionId) {
  console.log(`\n${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`);
  console.log(`${COLORS.bright}Translating: ${sectionId}${COLORS.reset}`);
  console.log(`${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}\n`);
  
  try {
    console.log(`⏳ Sending request to API...`);
    
    const response = await fetch('http://localhost:3000/api/translations/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentType: 'section',
        contentId: sectionId,
        forceRetranslate: true
      })
    });

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    
    const result = await response.json();
    
    if (!result.success) {
      console.log(`${COLORS.red}❌ FAILED: ${result.error}${COLORS.reset}`);
      if (result.details) {
        console.log(`${COLORS.yellow}Details: ${result.details}${COLORS.reset}`);
      }
      return { sectionId, success: false, error: result.error };
    }
    
    console.log(`${COLORS.green}✅ API request successful!${COLORS.reset}`);
    console.log(`${COLORS.yellow}⏳ Translation is processing in background...${COLORS.reset}`);
    
    // Wait for translation to complete (DeepL API takes time)
    console.log(`${COLORS.yellow}⏰ Waiting 35 seconds for DeepL API to complete...${COLORS.reset}`);
    await new Promise(resolve => setTimeout(resolve, 35000));
    
    // Check if translations were saved
    console.log(`${COLORS.blue}🔍 Checking database for saved translations...${COLORS.reset}`);
    
    const translations = await prisma.sectionContentTranslation.findMany({
      where: { sectionId },
      select: {
        language: true,
        title: true,
        isAutoTranslated: true
      }
    });
    
    if (translations.length > 0) {
      console.log(`${COLORS.green}✅ SUCCESS! Found ${translations.length}/4 translations:${COLORS.reset}`);
      translations.forEach(t => {
        console.log(`   ${COLORS.green}✓${COLORS.reset} ${t.language.toUpperCase()}: ${t.title}`);
      });
      
      const missing = 4 - translations.length;
      if (missing > 0) {
        console.log(`${COLORS.yellow}⚠️  ${missing} language(s) still missing${COLORS.reset}`);
      }
      
      return { sectionId, success: true, count: translations.length };
    } else {
      console.log(`${COLORS.red}❌ NO TRANSLATIONS SAVED! Something went wrong.${COLORS.reset}`);
      return { sectionId, success: false, error: 'No translations saved to database' };
    }
    
  } catch (error) {
    console.log(`${COLORS.red}❌ ERROR: ${error.message}${COLORS.reset}`);
    return { sectionId, success: false, error: error.message };
  }
}

async function main() {
  console.log(`\n${COLORS.bright}${COLORS.blue}╔═══════════════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.blue}║     MANUAL SECTION TRANSLATION WITH ERROR CHECKING       ║${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.blue}╚═══════════════════════════════════════════════════════════╝${COLORS.reset}\n`);
  
  // Check if dev server is running
  console.log(`${COLORS.yellow}🔍 Checking if dev server is running...${COLORS.reset}`);
  const serverRunning = await checkServerRunning();
  
  if (!serverRunning) {
    console.log(`${COLORS.red}${COLORS.bright}❌ ERROR: Dev server is NOT running!${COLORS.reset}`);
    console.log(`${COLORS.yellow}Please start the dev server first:${COLORS.reset}`);
    console.log(`${COLORS.cyan}   npm run dev${COLORS.reset}\n`);
    process.exit(1);
  }
  
  console.log(`${COLORS.green}✅ Dev server is running on http://localhost:3000${COLORS.reset}\n`);
  
  const sections = ['hero', 'whoAmI', 'whyChooseUs', 'exclusiveDestinations'];
  
  console.log(`${COLORS.bright}Will translate ${sections.length} sections:${COLORS.reset}`);
  sections.forEach((s, i) => console.log(`   ${i + 1}. ${s}`));
  console.log(`\n${COLORS.yellow}⏱️  Estimated time: ~${sections.length * 40} seconds (35s per section)${COLORS.reset}\n`);
  
  const results = [];
  
  for (let i = 0; i < sections.length; i++) {
    const sectionId = sections[i];
    console.log(`\n${COLORS.bright}[${i + 1}/${sections.length}] Processing: ${sectionId}${COLORS.reset}`);
    
    const result = await translateSection(sectionId);
    results.push(result);
    
    if (i < sections.length - 1) {
      console.log(`\n${COLORS.yellow}⏸️  Waiting 5 seconds before next section...${COLORS.reset}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  // Final summary
  console.log(`\n\n${COLORS.bright}${COLORS.blue}╔═══════════════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.blue}║                     FINAL SUMMARY                        ║${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.blue}╚═══════════════════════════════════════════════════════════╝${COLORS.reset}\n`);
  
  const successful = results.filter(r => r.success && r.count === 4);
  const partial = results.filter(r => r.success && r.count < 4);
  const failed = results.filter(r => !r.success);
  
  console.log(`${COLORS.green}✅ Fully Complete: ${successful.length}/4${COLORS.reset}`);
  if (successful.length > 0) {
    successful.forEach(r => console.log(`   ✓ ${r.sectionId}`));
  }
  
  if (partial.length > 0) {
    console.log(`\n${COLORS.yellow}⚠️  Partially Complete: ${partial.length}/4${COLORS.reset}`);
    partial.forEach(r => console.log(`   ~ ${r.sectionId} (${r.count}/4 translations)`));
  }
  
  if (failed.length > 0) {
    console.log(`\n${COLORS.red}❌ Failed: ${failed.length}/4${COLORS.reset}`);
    failed.forEach(r => console.log(`   ✗ ${r.sectionId}: ${r.error}`));
  }
  
  console.log(`\n${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}\n`);
  
  if (successful.length === sections.length) {
    console.log(`${COLORS.green}${COLORS.bright}🎉 ALL SECTIONS TRANSLATED SUCCESSFULLY!${COLORS.reset}\n`);
  } else {
    console.log(`${COLORS.yellow}⚠️  Some sections need attention. Check errors above.${COLORS.reset}\n`);
  }
  
  await prisma.$disconnect();
}

main().catch(error => {
  console.error(`${COLORS.red}Fatal error: ${error.message}${COLORS.reset}`);
  console.error(error.stack);
  process.exit(1);
});
