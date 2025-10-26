import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

/**
 * Generate SEO-friendly filename from original filename
 * - Converts to lowercase
 * - Removes special characters
 * - Replaces spaces with hyphens
 * - Adds context prefix if provided
 */
function generateSeoFilename(originalName: string, context?: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const base = path.basename(originalName, path.extname(originalName));
  
  // Clean filename: lowercase, remove special chars, replace spaces with hyphens
  let cleanBase = base
    .toLowerCase()
    .normalize('NFD') // Normalize unicode
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Keep only alphanumeric, spaces, hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  // Add context prefix for better SEO (e.g., "bromo-tour", "blog-post", "gallery")
  if (context) {
    const cleanContext = context
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    cleanBase = `${cleanContext}-${cleanBase}`;
  }

  // Add timestamp to ensure uniqueness
  const timestamp = Date.now();
  
  return `${cleanBase}-${timestamp}${ext}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as unknown as File | null;
    const context = formData.get('context') as string | null; // Optional: 'package', 'blog', 'gallery', etc.
    const altText = formData.get('altText') as string | null; // Optional: alt text for image

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type (images and videos)
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];

    if (!allowedImageTypes.includes(file.type) && !allowedVideoTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: `Invalid file type. Allowed types: ${allowedImageTypes.concat(allowedVideoTypes).join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size (5MB for images, 100MB for videos)
    const isVideo = allowedVideoTypes.includes(file.type);
    const maxSize = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024; // 100MB for videos, 5MB for images
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: `File too large. Maximum size is ${isVideo ? '100MB' : '5MB'} for ${isVideo ? 'videos' : 'images'}.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    // Generate SEO-friendly filename
    const originalName = file.name || 'upload.jpg';
    const filename = generateSeoFilename(originalName, context || undefined);
    const filepath = path.join(uploadsDir, filename);

    await fs.promises.writeFile(filepath, buffer);

    const url = `/uploads/${filename}`;
    
    // Return with SEO metadata
    return NextResponse.json({ 
      success: true, 
      url, 
      filename,
      altText: altText || '', // Return alt text for frontend to use
      seoMetadata: {
        originalName: file.name,
        generatedName: filename,
        context: context || 'general',
        fileSize: file.size,
        fileType: file.type
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'File upload failed' },
      { status: 500 }
    );
  }
}


