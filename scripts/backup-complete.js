const { PrismaClient } = require('../src/generated/prisma');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Load .env manually if not loaded
if (!process.env.DATABASE_URL) {
  try {
    const envPath = path.join(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, 'utf8');
      envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, '');
          process.env[key] = value;
        }
      });
    }
  } catch (e) {
    console.warn('Failed to load .env file manually:', e);
  }
}

const prisma = new PrismaClient();

async function getMysqldumpPath() {
  // 1. Try global path
  try {
    await execAsync('mysqldump --version');
    return 'mysqldump';
  } catch (e) {
    // Continue to check specific paths
  }

  // 2. Check Laragon paths
  const laragonPath = 'C:\\laragon\\bin\\mysql';
  if (fs.existsSync(laragonPath)) {
    const dirs = fs.readdirSync(laragonPath);
    for (const dir of dirs) {
      const dumpPath = path.join(laragonPath, dir, 'bin', 'mysqldump.exe');
      if (fs.existsSync(dumpPath)) {
        console.log(`   ℹ️  Found mysqldump in Laragon: ${dumpPath}`);
        return `"${dumpPath}"`;
      }
    }
  }

  // 3. Check XAMPP paths
  const xamppPath = 'C:\\xampp\\mysql\\bin\\mysqldump.exe';
  if (fs.existsSync(xamppPath)) {
    console.log(`   ℹ️  Found mysqldump in XAMPP: ${xamppPath}`);
    return `"${xamppPath}"`;
  }

  // 4. Check common Linux paths
  const linuxPaths = [
    '/usr/bin/mysqldump',
    '/usr/local/bin/mysqldump',
    '/usr/local/mysql/bin/mysqldump'
  ];
  
  for (const linuxPath of linuxPaths) {
    if (fs.existsSync(linuxPath)) {
      console.log(`   ℹ️  Found mysqldump in Linux path: ${linuxPath}`);
      return `"${linuxPath}"`;
    }
  }

  throw new Error('mysqldump not found');
}

async function createCompleteBackup() {
  console.log('🚀 Starting complete backup (.mswbak)...\n');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupDir = path.join(__dirname, '../backups');
  const tempDir = path.join(backupDir, `temp-${timestamp}`);
  const backupFileName = `backup-${timestamp}.mswbak`;
  const backupFilePath = path.join(backupDir, backupFileName);
  
  // Create directories
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  try {
    // 1. Create database backup
    console.log('📦 Step 1/4: Creating database backup...');
    const dbBackupPath = path.join(tempDir, 'database.sql');
    
    // Parse DATABASE_URL - format: mysql://user:pass@host:port/database?params
    const dbUrl = process.env.DATABASE_URL;
    const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]*)@([^:]+):(\d+)\/([^?]+)/);
    
    if (!urlMatch) {
      throw new Error('Invalid DATABASE_URL format');
    }
    
    const [, dbUser, dbPass, dbHost, dbPort, dbName] = urlMatch;
    
    // Check if mysqldump is available
    let dbBackupCreated = false;
    try {
      const mysqldumpCmd = await getMysqldumpPath();
      const passwordFlag = dbPass ? `-p"${dbPass}"` : '';
      
      // Use mysqldump (removed --skip-ssl as it causes issues with some versions)
      await execAsync(
        `${mysqldumpCmd} -h "${dbHost}" -P ${dbPort} -u "${dbUser}" ${passwordFlag} --single-transaction "${dbName}" > "${dbBackupPath}"`
      );
      console.log(`   ✅ Database backup created: ${(fs.statSync(dbBackupPath).size / 1024).toFixed(2)} KB\n`);
      dbBackupCreated = true;
    } catch (err) {
      console.warn('   ⚠️  mysqldump not found or failed. Skipping SQL backup.');
      console.warn(`       Error: ${err.message}`);
      console.warn('       (Only JSON data and uploads will be backed up)');
    }
    
    // 2. Create app data backup
    console.log('📦 Step 2/4: Creating app data backup...');
    const appDataPath = path.join(tempDir, 'app-data.json');
    
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
    
    const appData = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        database: dbName,
        backupType: 'complete'
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
    
    fs.writeFileSync(appDataPath, JSON.stringify(appData, null, 2));
    console.log(`   ✅ App data backup created: ${(fs.statSync(appDataPath).size / 1024).toFixed(2)} KB\n`);
    
    // 3. Copy uploads folder
    console.log('📦 Step 3/4: Copying uploads folder...');
    const uploadsSource = path.join(__dirname, '../public/uploads');
    const uploadsTarget = path.join(tempDir, 'uploads');
    
    if (fs.existsSync(uploadsSource)) {
      await copyDirectory(uploadsSource, uploadsTarget);
      const uploadSize = await getFolderSize(uploadsTarget);
      console.log(`   ✅ Uploads copied: ${uploadSize} KB\n`);
    } else {
      console.log(`   ⚠️  No uploads folder found, skipping...\n`);
    }
    
    // 4. Create manifest with checksums
    console.log('📦 Step 4/4: Creating manifest...');
    const manifestFiles = {
      'app-data.json': {
        size: fs.statSync(appDataPath).size,
        checksum: await getFileChecksum(appDataPath)
      }
    };

    if (dbBackupCreated) {
      manifestFiles['database.sql'] = {
        size: fs.statSync(dbBackupPath).size,
        checksum: await getFileChecksum(dbBackupPath)
      };
    }

    const manifest = {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      backupType: 'complete',
      files: manifestFiles,
      stats: {
        packages: packages.length,
        blogs: blogs.length,
        gallery: gallery.length,
        testimonials: testimonials.length,
        sections: sections.length,
        navigationItems: navigationItems.length
      }
    };
    
    const manifestPath = path.join(tempDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`   ✅ Manifest created\n`);
    
    // 5. Create .mswbak file (ZIP with custom extension)
    console.log('📦 Creating .mswbak archive...');
    
    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(backupFilePath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      output.on('close', () => {
        resolve();
      });
      
      archive.on('error', (err) => {
        reject(err);
      });
      
      archive.pipe(output);
      archive.directory(tempDir, false);
      archive.finalize();
    });
    
    // 6. Cleanup temp directory
    await deleteDirectory(tempDir);
    
    // 7. Show results
    const finalSize = (fs.statSync(backupFilePath).size / 1024 / 1024).toFixed(2);
    
    console.log('\n✅ Backup completed successfully!\n');
    console.log('📊 Backup Statistics:');
    console.log(`   Packages: ${packages.length}`);
    console.log(`   Blogs: ${blogs.length}`);
    console.log(`   Gallery Items: ${gallery.length}`);
    console.log(`   Testimonials: ${testimonials.length}`);
    console.log(`   Sections: ${sections.length}`);
    console.log(`   Navigation Items: ${navigationItems.length}`);
    console.log('');
    console.log(`💾 Backup File: ${backupFileName}`);
    console.log(`📦 Size: ${finalSize} MB`);
    console.log(`📍 Location: ${backupFilePath}`);
    console.log('');
    console.log('🔄 To restore this backup:');
    console.log(`   Upload ${backupFileName} via CMS Settings → Backup & Restore`);
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    // Cleanup on error
    if (fs.existsSync(tempDir)) {
      await deleteDirectory(tempDir);
    }
    if (fs.existsSync(backupFilePath)) {
      fs.unlinkSync(backupFilePath);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper functions
async function copyDirectory(src, dest) {
  await fs.promises.mkdir(dest, { recursive: true });
  const entries = await fs.promises.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.promises.copyFile(srcPath, destPath);
    }
  }
}

async function deleteDirectory(dir) {
  if (fs.existsSync(dir)) {
    await fs.promises.rm(dir, { recursive: true, force: true });
  }
}

async function getFolderSize(folderPath) {
  let totalSize = 0;
  
  if (!fs.existsSync(folderPath)) return '0';
  
  const files = await fs.promises.readdir(folderPath, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(folderPath, file.name);
    if (file.isDirectory()) {
      totalSize += parseFloat(await getFolderSize(filePath));
    } else {
      const stats = await fs.promises.stat(filePath);
      totalSize += stats.size;
    }
  }
  
  return (totalSize / 1024).toFixed(2);
}

async function getFileChecksum(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

createCompleteBackup();
