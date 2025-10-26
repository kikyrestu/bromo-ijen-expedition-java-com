/**
 * CMS API for Package Management with Auto-Translation
 * 
 * This API handles Create, Update, and Delete operations for packages
 * with automatic translation to all supported languages (ID, EN, DE, NL, ZH)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { updatePackageLocalizedUrls } from '@/lib/localized-urls';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// POST /api/cms/packages - Create new package with auto-translation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📦 Creating new package:', body.title);

    // Generate slug if not provided
    const slug = body.slug || generateSlug(body.title);

    // Create package in database
    const newPackage = await prisma.package.create({
      data: {
        title: body.title,
        slug,
        duration: body.duration,
        price: parseFloat(body.price),
        originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
        discount: body.discount || null,
        rating: parseFloat(body.rating || '4.5'),
        reviewCount: parseInt(body.reviewCount || '0'),
        category: body.category,
        description: body.description,
        longDescription: body.longDescription || null,
        destinations: body.destinations || '[]',
        includes: body.includes || '[]',
        excludes: body.excludes || '[]',
        highlights: body.highlights || '[]',
        itinerary: body.itinerary || '[]',
        gallery: body.gallery || '[]',
        faqs: body.faqs || '[]',
        groupSize: body.groupSize || 'Small Group',
        difficulty: body.difficulty || 'Easy',
        bestFor: body.bestFor || 'Everyone',
        image: body.image,
        departure: body.departure || null,
        return: body.return || null,
        totalPeople: body.totalPeople ? parseInt(body.totalPeople) : null,
        location: body.location || null,
        mapEmbedUrl: body.mapEmbedUrl || null,
        featured: body.featured || false,
        available: body.available !== false,
        status: body.status || 'draft'
      }
    });

    console.log('✅ Package created:', newPackage.id);

    // Generate localized URLs
    if (newPackage.slug) {
      try {
        await updatePackageLocalizedUrls(newPackage.id, newPackage.slug);
        console.log('✅ Localized URLs generated for package:', newPackage.id);
      } catch (error) {
        console.error('⚠️ Failed to generate localized URLs:', error);
        // Don't fail the request, just log the error
      }
    }

    // Note: Translation is now MANUAL via CMS button
    // Use POST /api/translations/trigger to translate

    return NextResponse.json({
      success: true,
      data: newPackage,
      message: 'Package created successfully. Use translation button to translate to other languages.'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating package:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create package',
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}

// PUT /api/cms/packages - Update existing package with auto-translation
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Package ID is required' },
        { status: 400 }
      );
    }

    console.log('📝 Updating package:', id);

    // Check if package exists
    const existingPackage = await prisma.package.findUnique({
      where: { id }
    });

    if (!existingPackage) {
      return NextResponse.json(
        { success: false, error: 'Package not found' },
        { status: 404 }
      );
    }

    // Update package data
    const updateData: any = {};
    
    if (body.title) updateData.title = body.title;
    if (body.slug) updateData.slug = body.slug;
    if (body.duration) updateData.duration = body.duration;
    if (body.price) updateData.price = parseFloat(body.price);
    if (body.originalPrice !== undefined) updateData.originalPrice = body.originalPrice ? parseFloat(body.originalPrice) : null;
    if (body.discount !== undefined) updateData.discount = body.discount;
    if (body.rating) updateData.rating = parseFloat(body.rating);
    if (body.reviewCount !== undefined) updateData.reviewCount = parseInt(body.reviewCount);
    if (body.category) updateData.category = body.category;
    if (body.description) updateData.description = body.description;
    if (body.longDescription !== undefined) updateData.longDescription = body.longDescription;
    if (body.destinations) updateData.destinations = body.destinations;
    if (body.includes) updateData.includes = body.includes;
    if (body.excludes !== undefined) updateData.excludes = body.excludes;
    if (body.highlights) updateData.highlights = body.highlights;
    if (body.itinerary !== undefined) updateData.itinerary = body.itinerary;
    if (body.gallery !== undefined) updateData.gallery = body.gallery;
    if (body.faqs !== undefined) updateData.faqs = body.faqs;
    if (body.groupSize) updateData.groupSize = body.groupSize;
    if (body.difficulty) updateData.difficulty = body.difficulty;
    if (body.bestFor) updateData.bestFor = body.bestFor;
    if (body.image) updateData.image = body.image;
    if (body.departure !== undefined) updateData.departure = body.departure;
    if (body.return !== undefined) updateData.return = body.return;
    if (body.totalPeople !== undefined) updateData.totalPeople = body.totalPeople ? parseInt(body.totalPeople) : null;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.mapEmbedUrl !== undefined) updateData.mapEmbedUrl = body.mapEmbedUrl;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.available !== undefined) updateData.available = body.available;
    if (body.status) updateData.status = body.status;

    const updatedPackage = await prisma.package.update({
      where: { id },
      data: updateData
    });

    console.log('✅ Package updated:', updatedPackage.id);

    // Regenerate localized URLs if slug changed
    if (updatedPackage.slug && (body.slug || body.title)) {
      try {
        await updatePackageLocalizedUrls(updatedPackage.id, updatedPackage.slug);
        console.log('✅ Localized URLs regenerated for package:', updatedPackage.id);
      } catch (error) {
        console.error('⚠️ Failed to regenerate localized URLs:', error);
        // Don't fail the request, just log the error
      }
    }

    // Note: Translation is now MANUAL via CMS button
    // Use POST /api/translations/trigger to translate

    return NextResponse.json({
      success: true,
      data: updatedPackage,
      message: 'Package updated successfully. Use translation button to re-translate if needed.'
    });

  } catch (error) {
    console.error('❌ Error updating package:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update package',
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}

// DELETE /api/cms/packages - Delete package and its translations
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Package ID is required' },
        { status: 400 }
      );
    }

    console.log('🗑️  Deleting package:', id);

    // Check if package exists
    const existingPackage = await prisma.package.findUnique({
      where: { id }
    });

    if (!existingPackage) {
      return NextResponse.json(
        { success: false, error: 'Package not found' },
        { status: 404 }
      );
    }

    // Delete all translations first
    await prisma.packageTranslation.deleteMany({
      where: { packageId: id }
    });

    // Delete package
    await prisma.package.delete({
      where: { id }
    });

    console.log('✅ Package and translations deleted');

    return NextResponse.json({
      success: true,
      message: 'Package and all translations deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting package:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete package',
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}
