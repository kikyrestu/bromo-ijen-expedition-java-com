# 💾 Complete Backup System Documentation

## Overview
Custom backup solution for Tour & Travel Web with `.mswbak` (Maheswara Backup) file format. Similar to WordPress `.wpress` or SQL Server `.bak` files, this system creates a single compressed archive containing everything needed for complete site restoration.

---

## 🎯 Features

### ✅ Complete Backup
- **Database**: Full MySQL dump with all tables and data
- **Content**: JSON export of all Prisma models (packages, blogs, etc)
- **Media Files**: All uploads from `/public/uploads/` folder
- **Integrity Check**: SHA-256 checksums for file verification

### ✅ User-Friendly UI
- One-click backup creation from CMS Settings
- Visual backup list with file size and creation date
- Download backups directly from browser
- Delete old backups with confirmation dialog

### ✅ Production-Ready
- Handles large files (100MB+) efficiently
- Connection retry logic for cloud databases (Aiven MySQL)
- Graceful error handling with user feedback
- SSL bypass for self-signed certificates

---

## 📁 File Structure

### `.mswbak` Archive Contents
```
backup-2025-10-27T06-50-35.mswbak (100.40 MB)
├── database.sql              # MySQL dump (55 KB)
├── app-data.json             # Prisma content export (32 KB)
├── uploads/                  # Media files (103 MB)
│   ├── packages/
│   ├── blogs/
│   ├── gallery/
│   └── testimonials/
└── manifest.json             # File checksums + metadata
```

### Manifest JSON Structure
```json
{
  "version": "1.0",
  "created_at": "2025-10-27T06:50:35.123Z",
  "database": "defaultdb",
  "files": {
    "database.sql": {
      "size": 56320,
      "checksum": "sha256:abc123..."
    },
    "app-data.json": {
      "size": 32870,
      "checksum": "sha256:def456..."
    },
    "uploads": {
      "size": 108584448,
      "file_count": 127
    }
  }
}
```

---

## 🔧 Implementation Details

### Backend Components

#### 1. Backup Script (`/scripts/backup-complete.js`)
**Purpose**: Create complete `.mswbak` backup file

**Process Flow**:
```javascript
1. Create temp directory (/backups/backup-temp-{timestamp})
2. Execute MySQL dump:
   mysqldump --skip-ssl dbname > database.sql
3. Fetch all data from Prisma:
   - Packages + translations
   - Blogs + translations
   - Testimonials + translations
   - Gallery + translations
   - Section content + translations
   - Navigation menus + items + translations
   - Users + sessions
4. Copy /public/uploads/ recursively
5. Generate manifest.json with SHA-256 checksums
6. Create ZIP archive (level 9 compression)
7. Rename .zip → .mswbak
8. Cleanup temp directory
```

**Key Functions**:
- `createCompleteBackup()` - Main orchestrator
- `copyDirectory(src, dest)` - Recursive folder copy
- `getFileChecksum(filePath)` - SHA-256 hash generator
- `getFolderSize(folderPath)` - Calculate folder size recursively

**Database Dump Command**:
```bash
mysqldump \
  -h $HOST \
  -P $PORT \
  -u $USER \
  -p"$PASSWORD" \
  --skip-ssl \
  $DATABASE \
  > database.sql
```

**Note**: `--skip-ssl` required for Aiven MySQL cloud database with self-signed certificates.

#### 2. API Endpoint (`/src/app/api/backup/complete/route.ts`)

**POST /api/backup/complete** - Create backup
```typescript
Request: No body needed
Response: {
  success: true,
  filename: "backup-2025-10-27T06-50-35.mswbak",
  size: "100.40 MB",
  path: "/backups/backup-2025-10-27T06-50-35.mswbak",
  timestamp: 1730023835000
}
```

**GET /api/backup/complete** - List backups
```typescript
Request: No parameters
Response: {
  success: true,
  data: [
    {
      name: "backup-2025-10-27T06-50-35.mswbak",
      size: "100.40 MB",
      createdAt: "2025-10-27T06:50:35.000Z",
      timestamp: 1730023835000,
      path: "/backups/backup-2025-10-27T06-50-35.mswbak"
    }
  ]
}
```

**DELETE /api/backup/complete?filename=X** - Delete backup
```typescript
Request: ?filename=backup-2025-10-27T06-50-35.mswbak
Response: {
  success: true,
  message: "Backup deleted successfully",
  filename: "backup-2025-10-27T06-50-35.mswbak"
}
```

**Security Features**:
- File extension validation (only `.mswbak` allowed)
- Path traversal prevention (blocks `../` in filename)
- Directory restriction (only `/backups` folder accessible)

### Frontend Components

#### 3. CMS Settings UI (`/src/app/cms/page.tsx`)

**Location**: Settings tab → "Complete Backup System" section (around line 1240)

**UI Elements**:
1. **Create Backup Button**:
   - Large gradient blue button
   - Shows toast notification during creation
   - Auto-refreshes backup list on success

2. **Backup List Table**:
   - Displays all `.mswbak` files
   - Shows filename (monospace font), creation date, file size
   - Download button (direct link to file)
   - Delete button (with confirmation dialog)
   - Refresh button to reload list

3. **Info Box**:
   - Explains what's included in backup
   - Lists all components (database, app-data, uploads, manifest)
   - Mentions one-click restore feature (coming soon)

**State Management**:
```typescript
const [backupList, setBackupList] = useState<any[]>([]);
const [loading, setLoading] = useState(false);

// Fetch backups when Settings tab is opened
useEffect(() => {
  if (activeTab === 'settings') {
    fetchBackupList();
  }
}, [activeTab]);
```

**User Flow**:
```
1. Admin opens CMS → Settings tab
2. UI auto-fetches backup list via GET endpoint
3. Admin clicks "Create Complete Backup" button
4. Toast shows "⏳ Creating complete backup..."
5. POST request triggers backup script
6. Script runs ~30 seconds (for 100MB site)
7. Success toast: "✅ Backup created! backup-xxx.mswbak (100 MB)"
8. Backup list auto-refreshes
9. New backup appears in table with download button
```

---

## 📊 Performance Metrics

### Test Results (Sample Site)

**Site Statistics**:
- Packages: 2 (with translations)
- Blogs: 2 (with translations)
- Gallery Items: 2 (with translations)
- Testimonials: 2 (with translations)
- Sections: 9 (hero, about, packages, blog, etc)
- Navigation Items: 8 (header menu with children)

**Backup Breakdown**:
- Database SQL: 55.15 KB
- App Data JSON: 32.10 KB
- Uploads Folder: 103,534.48 KB (103 MB)
- **Total Archive**: 100.40 MB (compressed)

**Execution Time**: ~30 seconds
- Database dump: 2s
- Prisma data export: 3s
- File copy: 20s (103MB files)
- ZIP compression: 5s

---

## 🚀 Usage Guide

### For Administrators

#### Creating a Backup
1. Login to CMS (`/cms`)
2. Navigate to **Settings** tab
3. Scroll to "💾 Complete Backup System" section
4. Click **"Create Complete Backup (.mswbak)"** button
5. Wait for success notification (~30 seconds)
6. Backup appears in list automatically

#### Downloading a Backup
1. Find backup in "Existing Backups" table
2. Click green **"Download"** button
3. Browser downloads `.mswbak` file
4. Store in safe location (external drive, cloud storage)

#### Deleting Old Backups
1. Click red trash icon on backup row
2. Confirm deletion in dialog
3. Backup removed from server immediately

### For Developers

#### Running Backup Script Manually
```bash
# Via npm script (recommended)
npm run backup:complete

# Direct execution
node scripts/backup-complete.js
```

#### Testing API Endpoints
```bash
# Create backup
curl -X POST http://localhost:3000/api/backup/complete

# List backups
curl http://localhost:3000/api/backup/complete

# Delete backup
curl -X DELETE "http://localhost:3000/api/backup/complete?filename=backup-xxx.mswbak"
```

#### Inspecting Backup Contents
```bash
# Extract .mswbak file (it's a ZIP archive)
unzip backup-2025-10-27T06-50-35.mswbak -d extracted/

# View manifest
cat extracted/manifest.json | jq

# Check database dump
head -20 extracted/database.sql

# Verify app data
cat extracted/app-data.json | jq '.packages | length'
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: SSL Certificate Error
**Symptom**: `TLS/SSL error: self-signed certificate in certificate chain`

**Cause**: Aiven MySQL uses self-signed certificates

**Solution**: Already implemented with `--skip-ssl` flag in mysqldump command
```javascript
const command = `mysqldump -h ${host} -P ${port} -u ${user} -p"${password}" --skip-ssl ${database} > ${dbBackupPath}`;
```

### Issue 2: Backup Takes Too Long
**Symptom**: Backup script runs > 2 minutes

**Possible Causes**:
- Large uploads folder (>500MB)
- Slow network to database server
- MySQL dump including large BLOB columns

**Solutions**:
1. Check uploads folder size: `du -sh public/uploads`
2. Add `--skip-extended-insert` to mysqldump for smaller files
3. Exclude specific tables with `--ignore-table`
4. Run backup during low-traffic hours

### Issue 3: "Failed to create backup" Error
**Symptom**: API returns error, no backup file created

**Debug Steps**:
1. Check server logs: `npm run dev` output
2. Check /backups folder permissions: `ls -la backups/`
3. Test database connection: `node test-db.js`
4. Run script manually: `npm run backup:complete`
5. Check disk space: `df -h`

**Common Fixes**:
- Ensure /backups folder exists: `mkdir -p backups`
- Fix permissions: `chmod 755 backups/`
- Increase Node memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run backup:complete`

### Issue 4: Backup File Missing from List
**Symptom**: Backup created but not showing in CMS UI

**Cause**: Browser cache or API not returning file

**Solutions**:
1. Click "Refresh" button in backup list
2. Check file exists: `ls -lh backups/*.mswbak`
3. Clear browser cache (Ctrl+Shift+R)
4. Check API response: Network tab → `/api/backup/complete`

---

## 🔐 Security Considerations

### Access Control
- ✅ Backup endpoints protected by session authentication
- ✅ Only admin users can create/delete backups
- ✅ Middleware checks session token before allowing access

### File Security
- ✅ `.mswbak` files stored in `/backups` folder (not in `/public`)
- ✅ Download uses Next.js static file serving (secure)
- ✅ Filename validation prevents path traversal attacks
- ❌ **TODO**: Add encryption for sensitive database dumps

### Best Practices
1. **Rotate backups regularly** - Delete backups older than 30 days
2. **Store off-site** - Download and upload to cloud storage (S3, Dropbox)
3. **Test restores** - Verify backup integrity quarterly
4. **Limit backup retention** - Keep only last 10 backups on server
5. **Monitor disk usage** - Each backup ~100MB, limit to 1GB total

---

## 📝 Future Enhancements

### High Priority
- [ ] **Restore Functionality** - Upload .mswbak → extract → restore database + files
- [ ] **Backup Rotation** - Auto-delete old backups (keep last N)
- [ ] **Progress Indicator** - Real-time progress for long backups
- [ ] **Backup Encryption** - AES-256 encryption for sensitive data

### Medium Priority
- [ ] **Scheduled Backups** - Daily/weekly automatic backups via cron
- [ ] **Cloud Storage Integration** - Auto-upload to AWS S3, Google Drive
- [ ] **Email Notifications** - Alert on backup success/failure
- [ ] **Incremental Backups** - Only backup changed files since last backup

### Low Priority
- [ ] **Backup Comparison** - Diff two backups to see changes
- [ ] **Selective Restore** - Restore specific tables or files only
- [ ] **Backup History** - View backup log with success/failure records
- [ ] **Multi-site Backups** - Backup multiple sites at once

---

## 📚 Technical References

### Dependencies
- **archiver** (^7.0.1) - ZIP archive creation
- **@types/archiver** (^6.0.2) - TypeScript definitions
- **crypto** (Node.js built-in) - SHA-256 checksums
- **fs-extra** (via Next.js) - File operations
- **child_process** (Node.js built-in) - Execute mysqldump

### Related Files
- `/scripts/backup-complete.js` - Main backup script
- `/src/app/api/backup/complete/route.ts` - REST API endpoints
- `/src/app/cms/page.tsx` - CMS Settings UI (lines 1240-1400)
- `/package.json` - npm script definition (`backup:complete`)
- `/backups/` - Backup storage directory

### Database Tables Included
```typescript
// Content tables
prisma.package.findMany()
prisma.blog.findMany()
prisma.testimonial.findMany()
prisma.galleryItem.findMany()
prisma.sectionContent.findMany()

// Translation tables
prisma.packageTranslation.findMany()
prisma.blogTranslation.findMany()
prisma.testimonialTranslation.findMany()
prisma.galleryTranslation.findMany()
prisma.sectionContentTranslation.findMany()

// Navigation tables
prisma.navigationMenu.findMany()
prisma.navigationItem.findMany()
prisma.navigationItemTranslation.findMany()

// User/Auth tables
prisma.user.findMany()
prisma.session.findMany()
```

---

## ✅ Completion Checklist

- [x] Backup script creates .mswbak file
- [x] Database dump included
- [x] App data JSON export included
- [x] Uploads folder copied
- [x] Manifest with checksums generated
- [x] ZIP compression working
- [x] API POST endpoint (create backup)
- [x] API GET endpoint (list backups)
- [x] API DELETE endpoint (remove backup)
- [x] CMS UI integration
- [x] Download button working
- [x] Delete confirmation dialog
- [x] Toast notifications
- [x] Error handling
- [x] Documentation complete
- [ ] Restore functionality (TODO)
- [ ] Automated testing (TODO)
- [ ] Backup rotation (TODO)

---

**Last Updated**: October 27, 2025  
**Author**: kikyrestu  
**Version**: 1.0.0  
**Status**: ✅ Production Ready (Backup only, Restore pending)
