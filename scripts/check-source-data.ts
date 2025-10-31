/**
 * Check Source Data in Database
 * 
 * This checks the ORIGINAL Indonesian content in section_contents table
 * to see if it's corrupted with mixed languages
 */

import prisma from '../src/lib/prisma';

function containsEnglish(text: string): boolean {
  if (!text) return false;
  const englishKeywords = [
    'the', 'and', 'with', 'for', 'your', 'our', 'this', 'that', 'have', 'from',
    'professional', 'experience', 'service', 'quality', 'safety', 'guide',
    'best', 'trusted', 'partner', 'adventure', 'tour', 'travel'
  ];
  const lowerText = text.toLowerCase();
  return englishKeywords.some(keyword => 
    lowerText.includes(` ${keyword} `) || 
    lowerText.startsWith(`${keyword} `) || 
    lowerText.endsWith(` ${keyword}`)
  );
}

async function checkSourceData() {
  console.log('\n🔍 Checking SOURCE Data (Indonesian) in Database...\n');
  
  const sections = await prisma.sectionContent.findMany({
    select: {
      sectionId: true,
      title: true,
      subtitle: true,
      description: true,
      features: true,
      stats: true
    }
  });
  
  console.log(`📊 Found ${sections.length} sections\n`);
  console.log('━'.repeat(80));
  
  for (const section of sections) {
    console.log(`\n📍 Section: ${section.sectionId}`);
    console.log('─'.repeat(80));
    
    const issues: string[] = [];
    
    // Check title
    if (section.title && containsEnglish(section.title)) {
      issues.push('title');
      console.log(`  ⚠️  Title has English: "${section.title}"`);
    } else if (section.title) {
      console.log(`  ✅ Title: "${section.title}"`);
    }
    
    // Check subtitle
    if (section.subtitle && containsEnglish(section.subtitle)) {
      issues.push('subtitle');
      console.log(`  ⚠️  Subtitle has English: "${section.subtitle}"`);
    } else if (section.subtitle) {
      console.log(`  ✅ Subtitle: "${section.subtitle}"`);
    }
    
    // Check description
    if (section.description) {
      const desc = section.description.substring(0, 100);
      if (containsEnglish(section.description)) {
        issues.push('description');
        console.log(`  ⚠️  Description has English: "${desc}..."`);
      } else {
        console.log(`  ✅ Description: "${desc}..."`);
      }
    }
    
    // Check features
    if (section.features) {
      try {
        const features = JSON.parse(section.features);
        if (Array.isArray(features)) {
          let hasMixed = false;
          for (const feature of features) {
            if (containsEnglish(feature.title) || containsEnglish(feature.description)) {
              hasMixed = true;
              console.log(`  ⚠️  Feature has English: "${feature.title}" / "${feature.description}"`);
            }
          }
          if (!hasMixed) {
            console.log(`  ✅ Features: ${features.length} items (all Indonesian)`);
          } else {
            issues.push('features');
          }
        }
      } catch (e) {
        console.log(`  ❌ Features: Invalid JSON`);
      }
    }
    
    // Check stats
    if (section.stats) {
      try {
        const stats = JSON.parse(section.stats);
        if (Array.isArray(stats)) {
          let hasMixed = false;
          for (const stat of stats) {
            if (containsEnglish(stat.label)) {
              hasMixed = true;
              console.log(`  ⚠️  Stat has English: "${stat.number}" - "${stat.label}"`);
            }
          }
          if (!hasMixed) {
            console.log(`  ✅ Stats: ${stats.length} items (all Indonesian)`);
          } else {
            issues.push('stats');
          }
        }
      } catch (e) {
        console.log(`  ❌ Stats: Invalid JSON`);
      }
    }
    
    if (issues.length > 0) {
      console.log(`\n  🔥 THIS SECTION HAS MIXED LANGUAGE! Fields: ${issues.join(', ')}`);
      console.log(`  💡 This will cause corrupted translations!`);
      console.log(`  🔧 Fix: Edit section in CMS to use pure Indonesian, then re-translate`);
    }
  }
  
  console.log('\n' + '━'.repeat(80));
  console.log('\n✅ Source data check complete!\n');
}

checkSourceData()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
