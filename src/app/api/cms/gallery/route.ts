/**
 * CMS API for Gallery Management with Auto-Translation
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/cms/gallery - Create new gallery item with auto-translation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🖼️  Creating new gallery item:', body.title);

    const newGalleryItem = await prisma.galleryItem.create({
      data: {
        title: body.title,
        category: body.category,
        image: body.image,
        description: body.description || null,
        tags: body.tags || '[]',
        likes: parseInt(body.likes || '0'),
      }
    });

    console.log('✅ Gallery item created:', newGalleryItem.id);

    // Note: Translation is now MANUAL via CMS button
    // Use POST /api/translations/trigger to translate

    return NextResponse.json({
      success: true,
      data: newGalleryItem,
      message: 'Gallery item created successfully. Use translation button to translate.'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating gallery item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create gallery item', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT /api/cms/gallery - Update existing gallery item with auto-translation
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Gallery item ID is required' },
        { status: 400 }
      );
    }

    console.log('📝 Updating gallery item:', id);

    const existingGalleryItem = await prisma.galleryItem.findUnique({ where: { id } });

    if (!existingGalleryItem) {
      return NextResponse.json(
        { success: false, error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    
    if (body.title) updateData.title = body.title;
    if (body.category) updateData.category = body.category;
    if (body.image) updateData.image = body.image;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.likes !== undefined) updateData.likes = parseInt(body.likes);
    if (body.views !== undefined) updateData.views = parseInt(body.views);

    const updatedGalleryItem = await prisma.galleryItem.update({
      where: { id },
      data: updateData
    });

    console.log('✅ Gallery item updated:', updatedGalleryItem.id);

    // Note: Translation is now MANUAL via CMS button
    // Use POST /api/translations/trigger to translate

    return NextResponse.json({
      success: true,
      data: updatedGalleryItem,
      message: 'Gallery item updated successfully. Use translation button to re-translate if needed.'
    });

  } catch (error) {
    console.error('❌ Error updating gallery item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update gallery item', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE /api/cms/gallery - Delete gallery item and its translations
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Gallery item ID is required' },
        { status: 400 }
      );
    }

    console.log('🗑️  Deleting gallery item:', id);

    const existingGalleryItem = await prisma.galleryItem.findUnique({ where: { id } });

    if (!existingGalleryItem) {
      return NextResponse.json(
        { success: false, error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    // Delete translations first
    await prisma.galleryTranslation.deleteMany({
      where: { galleryId: id }
    });

    // Delete gallery item
    await prisma.galleryItem.delete({
      where: { id }
    });

    console.log('✅ Gallery item and translations deleted');

    return NextResponse.json({
      success: true,
      message: 'Gallery item and all translations deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting gallery item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete gallery item', details: (error as Error).message },
      { status: 500 }
    );
  }
}
