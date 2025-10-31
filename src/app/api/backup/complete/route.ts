import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

// POST - Create complete backup
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting complete backup via API...');
    
    const backupDir = path.join(process.cwd(), 'backups');
    
    // Ensure backups directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Run complete backup script
    const { stdout, stderr } = await execAsync('npm run backup:complete', {
      cwd: process.cwd(),
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large outputs
    });
    
    console.log('Backup script output:', stdout);
    
    // Get the latest .mswbak file
    const files = fs.readdirSync(backupDir)
      .filter(f => f.endsWith('.mswbak'))
      .map(f => ({
        name: f,
        time: fs.statSync(path.join(backupDir, f)).mtime.getTime(),
        size: fs.statSync(path.join(backupDir, f)).size
      }))
      .sort((a, b) => b.time - a.time);
    
    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No backup file created', details: stderr || stdout },
        { status: 500 }
      );
    }
    
    const latestFile = files[0];
    const fileSizeMB = (latestFile.size / 1024 / 1024).toFixed(2);
    
    return NextResponse.json({
      success: true,
      message: 'Complete backup created successfully',
      filename: latestFile.name,
      size: fileSizeMB + ' MB',
      sizeBytes: latestFile.size,
      path: `/backups/${latestFile.name}`,
      timestamp: new Date(latestFile.time).toISOString()
    });
    
  } catch (error: any) {
    console.error('Complete backup error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create complete backup',
        details: error.stderr || error.stdout
      },
      { status: 500 }
    );
  }
}

// GET - List all backup files
export async function GET(request: NextRequest) {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    
    if (!fs.existsSync(backupDir)) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }
    
    // Get all .mswbak files
    const files = fs.readdirSync(backupDir)
      .filter(f => f.endsWith('.mswbak'))
      .map(f => {
        const filePath = path.join(backupDir, f);
        const stats = fs.statSync(filePath);
        
        return {
          name: f,
          size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
          sizeBytes: stats.size,
          createdAt: stats.mtime.toISOString(),
          timestamp: stats.mtime.getTime(),
          path: `/backups/${f}`
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);
    
    return NextResponse.json({
      success: true,
      data: files,
      total: files.length
    });
    
  } catch (error: any) {
    console.error('Error listing backups:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete backup file
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    
    if (!filename || !filename.endsWith('.mswbak')) {
      return NextResponse.json(
        { success: false, error: 'Invalid filename' },
        { status: 400 }
      );
    }
    
    const backupDir = path.join(process.cwd(), 'backups');
    const filePath = path.join(backupDir, filename);
    
    // Security check - ensure file is in backups directory
    if (!filePath.startsWith(backupDir)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file path' },
        { status: 403 }
      );
    }
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }
    
    fs.unlinkSync(filePath);
    
    return NextResponse.json({
      success: true,
      message: 'Backup file deleted successfully',
      filename
    });
    
  } catch (error: any) {
    console.error('Error deleting backup:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
