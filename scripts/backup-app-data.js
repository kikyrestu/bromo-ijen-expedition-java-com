const { PrismaClient } = require('../src/generated/prisma');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupData() {
  console.log('🚀 Starting application data backup...\n');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupDir = path.join(__dirname, '../backups');
  
  // Create backups directory if not exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const backupFile = path.join(backupDir, `app-data-${timestamp}.json`);
  
  try {
    // Fetch all data
    console.log('📦 Fetching data from database...');
    
    const [
      packages,
      packageTranslations,
      blogs,
      blogTranslations,
      gallery,
      galleryTranslations,
      testimonials,
      testimonialTranslations,
      destinations,
      sections,
      sectionTranslations,
      navigationMenus,
      navigationItems,
      navigationItemTranslations,
      settings
    ] = await Promise.all([
      prisma.package.findMany(),
      prisma.packageTranslation.findMany(),
      prisma.blog.findMany(),
      prisma.blogTranslation.findMany(),
      prisma.galleryItem.findMany(),
      prisma.galleryTranslation.findMany(),
      prisma.testimonial.findMany(),
      prisma.testimonialTranslation.findMany(),
      prisma.destination.findMany(),
      prisma.sectionContent.findMany(),
      prisma.sectionContentTranslation.findMany(),
      prisma.navigationMenu.findMany(),
      prisma.navigationItem.findMany(),
      prisma.navigationItemTranslation.findMany(),
      prisma.settings.findFirst()
    ]);
    
    const backup = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        database: 'tourntravelweb',
        description: 'Full application data backup including all content and translations'
      },
      counts: {
        packages: packages.length,
        packageTranslations: packageTranslations.length,
        blogs: blogs.length,
        blogTranslations: blogTranslations.length,
        gallery: gallery.length,
        galleryTranslations: galleryTranslations.length,
        testimonials: testimonials.length,
        testimonialTranslations: testimonialTranslations.length,
        destinations: destinations.length,
        sections: sections.length,
        sectionTranslations: sectionTranslations.length,
        navigationMenus: navigationMenus.length,
        navigationItems: navigationItems.length,
        navigationItemTranslations: navigationItemTranslations.length
      },
      data: {
        packages,
        packageTranslations,
        blogs,
        blogTranslations,
        gallery,
        galleryTranslations,
        testimonials,
        testimonialTranslations,
        destinations,
        sections,
        sectionTranslations,
        navigationMenus,
        navigationItems,
        navigationItemTranslations,
        settings
      }
    };
    
    // Write to file
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    
    const fileSize = (fs.statSync(backupFile).size / 1024).toFixed(2);
    
    console.log('\n✅ Backup completed successfully!\n');
    console.log('📊 Backup Statistics:');
    console.log(`   Packages: ${packages.length} (Translations: ${packageTranslations.length})`);
    console.log(`   Blogs: ${blogs.length} (Translations: ${blogTranslations.length})`);
    console.log(`   Gallery Items: ${gallery.length} (Translations: ${galleryTranslations.length})`);
    console.log(`   Testimonials: ${testimonials.length} (Translations: ${testimonialTranslations.length})`);
    console.log(`   Destinations: ${destinations.length}`);
    console.log(`   Sections: ${sections.length} (Translations: ${sectionTranslations.length})`);
    console.log(`   Navigation Menus: ${navigationMenus.length}`);
    console.log(`   Navigation Items: ${navigationItems.length} (Translations: ${navigationItemTranslations.length})`);
    console.log('');
    console.log(`💾 File: ${backupFile}`);
    console.log(`📦 Size: ${fileSize} KB`);
    console.log('');
    console.log('🔄 To restore this backup:');
    console.log(`   node scripts/restore-backup.js ${backupFile}`);
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backupData();
