import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    
    // Ensure backups directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Check if backup script exists
    const scriptPath = path.join(process.cwd(), 'scripts', 'backup-database.sh');
    if (!fs.existsSync(scriptPath)) {
      return NextResponse.json(
        { success: false, error: 'Backup script not found. Please ensure scripts/backup-database.sh exists.' },
        { status: 500 }
      );
    }
    
    // Make script executable
    fs.chmodSync(scriptPath, '755');
    
    // Run database backup script
    const { stdout, stderr } = await execAsync('bash scripts/backup-database.sh', {
      cwd: process.cwd()
    });
    
    // Get the latest backup file
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('backup_') && f.endsWith('.sql'))
      .map(f => ({
        name: f,
        time: fs.statSync(path.join(backupDir, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);
    
    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No backup file created', details: stderr || stdout },
        { status: 500 }
      );
    }
    
    const latestFile = files[0].name;
    const filePath = path.join(backupDir, latestFile);
    const stats = fs.statSync(filePath);
    const fileSize = (stats.size / 1024).toFixed(2) + ' KB';
    
    return NextResponse.json({
      success: true,
      message: 'Database backup created successfully',
      filename: latestFile,
      size: fileSize,
      path: `/backups/${latestFile}`,
      output: stdout
    });
    
  } catch (error: any) {
    console.error('Database backup error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create database backup',
        details: error.stderr || error.stdout
      },
      { status: 500 }
    );
  }
}
