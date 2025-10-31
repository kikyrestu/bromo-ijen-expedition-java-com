/**
 * Auto-translate missing section translations
 * This script triggers translation for sections with incomplete translations
 */

const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

async function triggerTranslation(sectionId) {
  try {
    console.log(`${COLORS.cyan}🔄 Triggering translation for: ${sectionId}${COLORS.reset}`);
    
    const response = await fetch('http://localhost:3000/api/translations/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentType: 'section',
        contentId: sectionId,
        forceRetranslate: false
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`${COLORS.green}✅ Translation triggered successfully for ${sectionId}${COLORS.reset}`);
      return { success: true, sectionId };
    } else {
      console.log(`${COLORS.red}❌ Failed to trigger translation for ${sectionId}: ${result.error}${COLORS.reset}`);
      return { success: false, sectionId, error: result.error };
    }
  } catch (error) {
    console.log(`${COLORS.red}❌ Error triggering translation for ${sectionId}: ${error.message}${COLORS.reset}`);
    return { success: false, sectionId, error: error.message };
  }
}

async function main() {
  console.log(`\n${COLORS.bright}${COLORS.blue}╔═══════════════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.blue}║   AUTO-TRANSLATE MISSING SECTION TRANSLATIONS            ║${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.blue}╚═══════════════════════════════════════════════════════════╝${COLORS.reset}\n`);

  try {
    // Step 1: Find sections with missing translations
    console.log(`${COLORS.yellow}📊 Checking translation coverage...${COLORS.reset}\n`);
    
    const sections = await prisma.sectionContent.findMany({
      select: {
        id: true,
        sectionId: true,
        title: true
      }
    });

    const sectionsNeedingTranslation = [];

    for (const section of sections) {
      const translationCount = await prisma.sectionContentTranslation.count({
        where: { sectionId: section.sectionId }
      });

      const coverage = (translationCount / 4) * 100;
      const status = coverage === 100 ? '✅' : coverage > 0 ? '⚠️' : '❌';
      
      console.log(`${status} ${section.sectionId.padEnd(25)} | ${(section.title || 'No title').substring(0, 30).padEnd(30)} | ${translationCount}/4 (${coverage.toFixed(0)}%)`);
      
      if (translationCount < 4) {
        sectionsNeedingTranslation.push({
          sectionId: section.sectionId,
          title: section.title,
          current: translationCount,
          missing: 4 - translationCount
        });
      }
    }

    if (sectionsNeedingTranslation.length === 0) {
      console.log(`\n${COLORS.green}${COLORS.bright}✨ All sections have complete translations! Nothing to do.${COLORS.reset}\n`);
      return;
    }

    // Step 2: Show summary
    console.log(`\n${COLORS.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`);
    console.log(`${COLORS.bright}Found ${sectionsNeedingTranslation.length} section(s) needing translation:${COLORS.reset}\n`);
    
    sectionsNeedingTranslation.forEach((section, idx) => {
      console.log(`${idx + 1}. ${COLORS.cyan}${section.sectionId}${COLORS.reset} - Missing ${section.missing} language(s)`);
    });

    console.log(`\n${COLORS.yellow}⏱️  Estimated time: ~${sectionsNeedingTranslation.length * 30} seconds${COLORS.reset}`);
    console.log(`${COLORS.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}\n`);

    // Step 3: Trigger translations
    console.log(`${COLORS.bright}🚀 Starting translation process...${COLORS.reset}\n`);

    const results = [];

    for (let i = 0; i < sectionsNeedingTranslation.length; i++) {
      const section = sectionsNeedingTranslation[i];
      console.log(`\n${COLORS.bright}[${i + 1}/${sectionsNeedingTranslation.length}]${COLORS.reset} Processing: ${COLORS.cyan}${section.sectionId}${COLORS.reset}`);
      
      const result = await triggerTranslation(section.sectionId);
      results.push(result);

      if (result.success && i < sectionsNeedingTranslation.length - 1) {
        console.log(`${COLORS.yellow}⏳ Waiting 5 seconds before next translation...${COLORS.reset}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // Step 4: Show results
    console.log(`\n\n${COLORS.bright}${COLORS.blue}╔═══════════════════════════════════════════════════════════╗${COLORS.reset}`);
    console.log(`${COLORS.bright}${COLORS.blue}║                 TRANSLATION SUMMARY                      ║${COLORS.reset}`);
    console.log(`${COLORS.bright}${COLORS.blue}╚═══════════════════════════════════════════════════════════╝${COLORS.reset}\n`);

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`${COLORS.green}✅ Successful: ${successful}${COLORS.reset}`);
    console.log(`${COLORS.red}❌ Failed: ${failed}${COLORS.reset}\n`);

    if (failed > 0) {
      console.log(`${COLORS.red}Failed sections:${COLORS.reset}`);
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.sectionId}: ${r.error}`);
      });
      console.log();
    }

    console.log(`${COLORS.yellow}⏳ Translations are processing in the background...${COLORS.reset}`);
    console.log(`${COLORS.yellow}⏳ Wait ~30 seconds, then check the Translation Manager.${COLORS.reset}\n`);

  } catch (error) {
    console.error(`${COLORS.red}Fatal error: ${error.message}${COLORS.reset}`);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main().catch(console.error);
