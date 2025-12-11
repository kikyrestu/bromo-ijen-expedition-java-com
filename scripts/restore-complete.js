const { PrismaClient } = require('../src/generated/prisma');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const prisma = new PrismaClient();

// Load .env manually
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

async function restoreComplete() {
  const backupFile = process.argv[2];
  if (!backupFile) {
    console.error('❌ Please provide a backup file path');
    process.exit(1);
  }

  console.log(`🚀 Starting restore from: ${backupFile}\n`);

  const tempDir = path.join(__dirname, '../backups/temp-restore-' + Date.now());
  
  try {
    // 1. Extract Archive
    console.log('📦 Step 1/4: Extracting archive...');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const isWindows = process.platform === 'win32';
    // Force unzip on Linux/Docker environment even if platform says win32 (unlikely in docker but safe)
    // In Docker Alpine, we use unzip
    try {
        if (isWindows) {
            // PowerShell Expand-Archive requires .zip extension
            let extractFile = backupFile;
            let tempZipFile = null;

            if (!backupFile.toLowerCase().endsWith('.zip')) {
                tempZipFile = backupFile + '.zip';
                fs.copyFileSync(backupFile, tempZipFile);
                extractFile = tempZipFile;
            }

            try {
                await execAsync(`powershell -command "Expand-Archive -Path '${extractFile}' -DestinationPath '${tempDir}' -Force"`);
            } finally {
                if (tempZipFile && fs.existsSync(tempZipFile)) {
                fs.unlinkSync(tempZipFile);
                }
            }
        } else {
            // Linux / Docker Alpine
            await execAsync(`unzip -o "${backupFile}" -d "${tempDir}"`);
        }
    } catch (extractError) {
        // Fallback: try unzip command anyway if powershell fails or vice versa
        console.log('   ⚠️  Primary extract failed, trying fallback...');
        try {
             await execAsync(`unzip -o "${backupFile}" -d "${tempDir}"`);
        } catch (e) {
             // If unzip also fails, try 7z if available
             await execAsync(`7z x "${backupFile}" -o"${tempDir}" -y`);
        }
    }
    console.log('   ✅ Archive extracted\n');

    // 2. Restore Database (Priority: SQL -> JSON)
    console.log('📦 Step 2/4: Restoring database...');
    const sqlPath = path.join(tempDir, 'database.sql');
    const jsonPath = path.join(tempDir, 'app-data.json');

    if (fs.existsSync(sqlPath)) {
      console.log('   ℹ️  Found database.sql, restoring via MySQL...');
      await restoreFromSql(sqlPath);
    } else if (fs.existsSync(jsonPath)) {
      console.log('   ℹ️  database.sql not found, restoring from app-data.json via Prisma...');
      await restoreFromJson(jsonPath);
    } else {
      throw new Error('No valid database backup found (sql or json)');
    }
    console.log('   ✅ Database restored\n');

    // 3. Restore Uploads
    console.log('📦 Step 3/4: Restoring uploads...');
    const uploadsSource = path.join(tempDir, 'uploads');
    const uploadsTarget = path.join(__dirname, '../public/uploads');

    if (fs.existsSync(uploadsSource)) {
      // Clear existing uploads? Maybe safer to overwrite/merge
      if (!fs.existsSync(uploadsTarget)) {
        fs.mkdirSync(uploadsTarget, { recursive: true });
      }
      await copyDirectory(uploadsSource, uploadsTarget);
      console.log('   ✅ Uploads restored\n');
    } else {
      console.log('   ⚠️  No uploads folder in backup\n');
    }

    // 4. Cleanup
    console.log('📦 Step 4/4: Cleaning up...');
    await deleteDirectory(tempDir);
    console.log('   ✅ Cleanup done\n');

    console.log('✅ RESTORE COMPLETED SUCCESSFULLY!');

  } catch (error) {
    console.error('❌ Restore failed:', error);
    // Cleanup
    if (fs.existsSync(tempDir)) {
      await deleteDirectory(tempDir);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function restoreFromSql(sqlPath) {
  const dbUrl = process.env.DATABASE_URL;
  const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]*)@([^:]+):(\d+)\/([^?]+)/);
  
  if (!urlMatch) throw new Error('Invalid DATABASE_URL');
  
  const [, dbUser, dbPass, dbHost, dbPort, dbName] = urlMatch;
  
  let mysqlCmd = 'mysql';
  // Try to find mysql path like in backup script
  if (process.platform === 'win32') {
    // Check Laragon
    const laragonPath = 'C:\\laragon\\bin\\mysql';
    if (fs.existsSync(laragonPath)) {
      const dirs = fs.readdirSync(laragonPath);
      for (const dir of dirs) {
        const binPath = path.join(laragonPath, dir, 'bin', 'mysql.exe');
        if (fs.existsSync(binPath)) {
          mysqlCmd = `"${binPath}"`;
          break;
        }
      }
    }
  }

  const passwordFlag = dbPass ? `-p"${dbPass}"` : '';
  await execAsync(`${mysqlCmd} -h "${dbHost}" -P ${dbPort} -u "${dbUser}" ${passwordFlag} "${dbName}" < "${sqlPath}"`);
}

async function restoreFromJson(jsonPath) {
  const content = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const data = content.data;

  // Order matters for foreign keys!
  // Delete all first (reverse order of dependency)
  await prisma.navigationItemTranslation.deleteMany();
  await prisma.navigationItem.deleteMany();
  await prisma.navigationMenu.deleteMany();
  await prisma.sectionContentTranslation.deleteMany();
  await prisma.sectionContent.deleteMany();
  await prisma.destination.deleteMany();
  await prisma.testimonialTranslation.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.galleryTranslation.deleteMany();
  await prisma.galleryItem.deleteMany();
  await prisma.blogTranslation.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.packageTranslation.deleteMany();
  await prisma.package.deleteMany();
  await prisma.settings.deleteMany();

  // Insert all (order of dependency)
  if (data.settings && Array.isArray(data.settings)) {
    for (const setting of data.settings) await prisma.settings.create({ data: setting });
  }
  
  for (const pkg of data.packages) await prisma.package.create({ data: pkg });
  for (const trans of data.packageTranslations) await prisma.packageTranslation.create({ data: trans });
  
  for (const blog of data.blogs) await prisma.blog.create({ data: blog });
  for (const trans of data.blogTranslations) await prisma.blogTranslation.create({ data: trans });
  
  for (const item of data.gallery) await prisma.galleryItem.create({ data: item });
  for (const trans of data.galleryTranslations) await prisma.galleryTranslation.create({ data: trans });
  
  for (const test of data.testimonials) await prisma.testimonial.create({ data: test });
  for (const trans of data.testimonialTranslations) await prisma.testimonialTranslation.create({ data: trans });
  
  for (const dest of data.destinations) await prisma.destination.create({ data: dest });
  
  for (const sec of data.sections) await prisma.sectionContent.create({ data: sec });
  for (const trans of data.sectionTranslations) await prisma.sectionContentTranslation.create({ data: trans });
  
  for (const menu of data.navigationMenus) await prisma.navigationMenu.create({ data: menu });
  for (const item of data.navigationItems) await prisma.navigationItem.create({ data: item });
  for (const trans of data.navigationItemTranslations) await prisma.navigationItemTranslation.create({ data: trans });
}

async function copyDirectory(src, dest) {
  const entries = await fs.promises.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await fs.promises.mkdir(destPath, { recursive: true });
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

restoreComplete();
