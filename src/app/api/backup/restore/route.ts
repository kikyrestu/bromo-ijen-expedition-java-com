import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    if (!file.name.endsWith('.mswbak')) {
      return NextResponse.json({ success: false, error: 'Invalid file format. Must be .mswbak' }, { status: 400 });
    }

    console.log(`🚀 Starting restore process for: ${file.name}`);

    // Save uploaded file to temp location
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const tempDir = path.join(process.cwd(), 'backups', 'temp-uploads');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, file.name);
    await writeFile(tempFilePath, buffer);
    console.log(`   ✅ File saved to: ${tempFilePath}`);

    // Run restore script
    const scriptPath = path.join(process.cwd(), 'scripts', 'restore-complete.js');
    
    // Use node to run the script
    const { stdout, stderr } = await execAsync(`"${process.execPath}" "${scriptPath}" "${tempFilePath}"`, {
      cwd: process.cwd(),
      maxBuffer: 10 * 1024 * 1024
    });

    console.log('Restore output:', stdout);

    // Cleanup temp file
    fs.unlinkSync(tempFilePath);

    return NextResponse.json({
      success: true,
      message: 'Restore completed successfully',
      details: stdout
    });

  } catch (error: any) {
    console.error('Restore error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Restore failed',
        details: error.stderr || error.stdout 
      },
      { status: 500 }
    );
  }
}
