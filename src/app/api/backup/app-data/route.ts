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
    
    // Run backup script
    const { stdout, stderr } = await execAsync('npm run backup', {
      cwd: process.cwd()
    });
    
    // Get the latest backup file
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('app-data-') && f.endsWith('.json'))
      .map(f => ({
        name: f,
        time: fs.statSync(path.join(backupDir, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);
    
    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No backup file created' },
        { status: 500 }
      );
    }
    
    const latestFile = files[0].name;
    const filePath = path.join(backupDir, latestFile);
    const stats = fs.statSync(filePath);
    const fileSize = (stats.size / 1024).toFixed(2) + ' KB';
    
    return NextResponse.json({
      success: true,
      message: 'Application data backup created successfully',
      filename: latestFile,
      size: fileSize,
      path: `/api/backup/download?filename=${encodeURIComponent(latestFile)}`
    });
    
  } catch (error: any) {
    console.error('Backup error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create backup',
        details: error.stderr || error.stdout
      },
      { status: 500 }
    );
  }
}
