import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

// GET: List all uploaded files OR serve a specific file
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('file');
    
    // If filename is provided, serve the file
    if (filename) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      const filePath = path.join(uploadsDir, filename);
      
      // Security check - ensure the file is within the uploads directory
      const resolvedPath = path.resolve(filePath);
      const resolvedUploadsDir = path.resolve(uploadsDir);
      
      if (!resolvedPath.startsWith(resolvedUploadsDir)) {
        return new NextResponse('File not found', { status: 404 });
      }
      
      // Check if file exists
      try {
        await fs.promises.access(filePath);
      } catch {
        return new NextResponse('File not found', { status: 404 });
      }
      
      // Read file
      const fileBuffer = await fs.promises.readFile(filePath);
      const stats = await fs.promises.stat(filePath);
      
      // Determine content type
      const ext = path.extname(filePath).toLowerCase();
      let contentType = 'application/octet-stream';
      
      if (ext === '.jpg' || ext === '.jpeg') {
        contentType = 'image/jpeg';
      } else if (ext === '.png') {
        contentType = 'image/png';
      } else if (ext === '.gif') {
        contentType = 'image/gif';
      } else if (ext === '.webp') {
        contentType = 'image/webp';
      } else if (ext === '.mp4') {
        contentType = 'video/mp4';
      } else if (ext === '.webm') {
        contentType = 'video/webm';
      } else if (ext === '.ogg') {
        contentType = 'video/ogg';
      }
      
      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': stats.size.toString(),
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
          'Last-Modified': stats.mtime.toUTCString(),
          'ETag': `"${stats.mtime.getTime()}-${stats.size}"`,
        },
      });
    }
    
    // Otherwise, list all files (existing functionality)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure directory exists
    if (!fs.existsSync(uploadsDir)) {
      await fs.promises.mkdir(uploadsDir, { recursive: true });
      return NextResponse.json({
        success: true,
        files: []
      });
    }

    const fileNames = await fs.promises.readdir(uploadsDir);
    
    const files = await Promise.all(
      fileNames
        .filter(filename => {
          // Include both image and video files
          const ext = path.extname(filename).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.ogg', '.avi', '.mov'].includes(ext);
        })
        .map(async (filename) => {
          const filepath = path.join(uploadsDir, filename);
          const stats = await fs.promises.stat(filepath);
          
          // Detect if file is SEO optimized (has context prefix)
          const seoOptimized = filename.includes('bromo-ijen');
          const context = seoOptimized 
            ? filename.split('-').slice(0, 4).join('-') // Extract context prefix
            : undefined;

          // Determine file type
          const ext = path.extname(filename).toLowerCase().slice(1);
          const isVideo = ['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(ext);
          const type = isVideo ? `video/${ext}` : `image/${ext}`;

          return {
            filename,
            url: `/uploads/${filename}`,
            size: stats.size,
            type,
            uploadedAt: stats.birthtime,
            seoOptimized,
            context
          };
        })
    );

    // Sort by upload date (newest first)
    files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return NextResponse.json({
      success: true,
      files,
      total: files.length
    });

  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list files' },
      { status: 500 }
    );
  }
}

// PUT: Update file (rename + alt text)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { oldFilename, newFilename, altText } = body;

    if (!oldFilename || !newFilename) {
      return NextResponse.json(
        { success: false, error: 'Old and new filenames are required' },
        { status: 400 }
      );
    }

    // Security: Prevent directory traversal
    if (oldFilename.includes('..') || oldFilename.includes('/') || oldFilename.includes('\\') ||
        newFilename.includes('..') || newFilename.includes('/') || newFilename.includes('\\')) {
      return NextResponse.json(
        { success: false, error: 'Invalid filename' },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const oldPath = path.join(uploadsDir, oldFilename);

    // Check if file exists
    if (!fs.existsSync(oldPath)) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    // Get extension
    const ext = path.extname(oldFilename);
    
    // Clean new filename and add timestamp
    const cleanFilename = newFilename
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const finalFilename = `${cleanFilename}-${Date.now()}${ext}`;
    const newPath = path.join(uploadsDir, finalFilename);

    // Rename file
    await fs.promises.rename(oldPath, newPath);

    // Get file stats for the new file
    const stats = await fs.promises.stat(newPath);
    
    // Detect if file is SEO optimized (has context prefix)
    const seoOptimized = finalFilename.includes('bromo-ijen');
    const context = seoOptimized 
      ? finalFilename.split('-').slice(0, 4).join('-') // Extract context prefix
      : undefined;

    // Determine file type
    const fileExt = path.extname(finalFilename).toLowerCase().slice(1);
    const isVideo = ['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(fileExt);
    const type = isVideo ? `video/${fileExt}` : `image/${fileExt}`;

    // Return the updated file info
    const updatedFile = {
      filename: finalFilename,
      url: `/uploads/${finalFilename}`,
      size: stats.size,
      type,
      uploadedAt: stats.birthtime,
      modifiedAt: stats.mtime,
      seoOptimized,
      context,
      altText: altText || ''
    };

    return NextResponse.json({
      success: true,
      message: 'File updated successfully',
      oldFilename,
      newFilename: finalFilename,
      newUrl: `/uploads/${finalFilename}`,
      altText,
      file: updatedFile
    });

  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update file' },
      { status: 500 }
    );
  }
}

// DELETE: Delete file(s)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'Filename is required' },
        { status: 400 }
      );
    }

    // Security: Prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json(
        { success: false, error: 'Invalid filename' },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filepath = path.join(uploadsDir, filename);

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    // Delete file
    await fs.promises.unlink(filepath);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
      filename
    });

  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}

