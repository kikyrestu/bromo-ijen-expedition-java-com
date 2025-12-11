#!/bin/bash

# Database Backup Script for Tour & Travel Web
# This script creates a complete backup of the MySQL database

# Load environment variables
source .env 2>/dev/null || source .env.local 2>/dev/null

# Parse DATABASE_URL
# Format: mysql://user:password@host:port/database
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL not found in environment"
    exit 1
fi

# Extract database credentials from URL
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

# Create backups directory if not exists
BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.sql"
BACKUP_INFO="$BACKUP_DIR/backup_${TIMESTAMP}.info.txt"

echo "🚀 Starting database backup..."
echo ""
echo "📋 Backup Information:"
echo "   Database: $DB_NAME"
echo "   Host: $DB_HOST:$DB_PORT"
echo "   User: $DB_USER"
echo "   Output: $BACKUP_FILE"
echo ""

# Perform backup using mysqldump
mysqldump \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --user="$DB_USER" \
    --password="$DB_PASS" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --add-drop-table \
    "$DB_NAME" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    # Get file size
    FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    
    # Count tables
    TABLE_COUNT=$(grep -c "CREATE TABLE" "$BACKUP_FILE")
    
    # Create info file
    cat > "$BACKUP_INFO" <<EOF
Backup Information
==================

Timestamp: $(date)
Database: $DB_NAME
Host: $DB_HOST:$DB_PORT
File Size: $FILE_SIZE
Tables Backed Up: $TABLE_COUNT

Backup File: $BACKUP_FILE

To restore this backup:
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p $DB_NAME < $BACKUP_FILE
EOF

    echo "✅ Backup completed successfully!"
    echo ""
    echo "📊 Backup Statistics:"
    echo "   File Size: $FILE_SIZE"
    echo "   Tables: $TABLE_COUNT"
    echo ""
    echo "💾 Files created:"
    echo "   - $BACKUP_FILE"
    echo "   - $BACKUP_INFO"
    echo ""
    echo "🔄 To restore:"
    echo "   mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p $DB_NAME < $BACKUP_FILE"
else
    echo "❌ Backup failed!"
    rm -f "$BACKUP_FILE" "$BACKUP_INFO"
    exit 1
fi

# Clean old backups (keep last 10)
echo "🧹 Cleaning old backups (keeping last 10)..."
cd "$BACKUP_DIR"
ls -t backup_*.sql 2>/dev/null | tail -n +11 | xargs -r rm
ls -t backup_*.info.txt 2>/dev/null | tail -n +11 | xargs -r rm
echo "✨ Cleanup complete!"
