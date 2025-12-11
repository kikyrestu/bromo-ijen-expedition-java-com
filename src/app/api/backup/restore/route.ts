import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

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

    // Save uploaded file to temp location
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const tempDir = path.join(process.cwd(), 'backups', 'temp-uploads');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, file.name);
    await writeFile(tempFilePath, buffer);

    // Create a TransformStream for the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`🚀 Starting restore process for: ${file.name}\n`));
        controller.enqueue(encoder.encode(`✅ File saved to: ${tempFilePath}\n\n`));

        const scriptPath = path.join(process.cwd(), 'scripts', 'restore-complete.js');
        
        // Use spawn instead of exec for streaming
        const child = spawn(process.execPath, [scriptPath, tempFilePath], {
          cwd: process.cwd()
        });

        child.stdout.on('data', (data) => {
          controller.enqueue(encoder.encode(data));
        });

        child.stderr.on('data', (data) => {
          controller.enqueue(encoder.encode(data));
        });

        child.on('close', (code) => {
          // Cleanup temp file
          try {
            if (fs.existsSync(tempFilePath)) {
              fs.unlinkSync(tempFilePath);
            }
          } catch (e) {
            console.error('Failed to cleanup temp file:', e);
          }

          if (code === 0) {
            controller.enqueue(encoder.encode('\n✨ RESTORE PROCESS COMPLETED SUCCESSFULLY! ✨\n'));
          } else {
            controller.enqueue(encoder.encode(`\n❌ Restore process exited with code ${code}\n`));
          }
          controller.close();
        });

        child.on('error', (err) => {
          controller.enqueue(encoder.encode(`\n❌ Failed to start restore process: ${err.message}\n`));
          controller.close();
        });
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error: any) {
    console.error('Restore error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Restore failed'
      },
      { status: 500 }
    );
  }
}
