/**
 * CMS API for Blog Management with Auto-Translation
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// POST /api/cms/blogs - Create new blog with auto-translation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📝 Creating new blog:', body.title);

    const slug = body.slug || generateSlug(body.title);

    const newBlog = await prisma.blog.create({
      data: {
        title: body.title,
        slug,
        excerpt: body.excerpt,
        content: body.content,
        author: body.author || 'Admin',
        publishDate: body.publishDate ? new Date(body.publishDate) : new Date(),
        readTime: body.readTime || '5 min',
        category: body.category,
        tags: body.tags || '[]',
        image: body.image,
        featured: body.featured || false,
      }
    });

    console.log('✅ Blog created:', newBlog.id);

    // Note: Translation is now MANUAL via CMS button
    // Use POST /api/translations/trigger to translate

    return NextResponse.json({
      success: true,
      data: newBlog,
      message: 'Blog created successfully. Use translation button to translate.'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create blog', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT /api/cms/blogs - Update existing blog with auto-translation
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Blog ID is required' },
        { status: 400 }
      );
    }

    console.log('📝 Updating blog:', id);

    const existingBlog = await prisma.blog.findUnique({ where: { id } });

    if (!existingBlog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    
    if (body.title) updateData.title = body.title;
    if (body.slug) updateData.slug = body.slug;
    if (body.excerpt) updateData.excerpt = body.excerpt;
    if (body.content) updateData.content = body.content;
    if (body.author) updateData.author = body.author;
    if (body.publishDate) updateData.publishDate = new Date(body.publishDate);
    if (body.readTime) updateData.readTime = body.readTime;
    if (body.category) updateData.category = body.category;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.image) updateData.image = body.image;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.status) updateData.status = body.status;

    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: updateData
    });

    console.log('✅ Blog updated:', updatedBlog.id);

    // Note: Translation is now MANUAL via CMS button
    // Use POST /api/translations/trigger to translate

    return NextResponse.json({
      success: true,
      data: updatedBlog,
      message: 'Blog updated successfully. Use translation button to re-translate if needed.'
    });

  } catch (error) {
    console.error('❌ Error updating blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update blog', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE /api/cms/blogs - Delete blog and its translations
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Blog ID is required' },
        { status: 400 }
      );
    }

    console.log('🗑️  Deleting blog:', id);

    const existingBlog = await prisma.blog.findUnique({ where: { id } });

    if (!existingBlog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Delete translations first
    await prisma.blogTranslation.deleteMany({
      where: { blogId: id }
    });

    // Delete blog
    await prisma.blog.delete({
      where: { id }
    });

    console.log('✅ Blog and translations deleted');

    return NextResponse.json({
      success: true,
      message: 'Blog and all translations deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete blog', details: (error as Error).message },
      { status: 500 }
    );
  }
}
