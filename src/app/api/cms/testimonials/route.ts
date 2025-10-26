/**
 * CMS API for Testimonial Management with Auto-Translation
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/cms/testimonials - Create new testimonial with auto-translation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('💬 Creating new testimonial:', body.name);

    const newTestimonial = await prisma.testimonial.create({
      data: {
        name: body.name,
        role: body.role || 'Customer',
        content: body.content,
        rating: parseInt(body.rating || '5'),
        image: body.image || null,
        packageName: body.packageName || '',
        location: body.location || '',
        status: body.status || 'pending',
      }
    });

    console.log('✅ Testimonial created:', newTestimonial.id);

    // Note: Translation is now MANUAL via CMS button
    // Use POST /api/translations/trigger to translate

    return NextResponse.json({
      success: true,
      data: newTestimonial,
      message: 'Testimonial created successfully. Use translation button to re-translate if needed.'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating testimonial:', error);
    return NextResponse.json(
      { status: 500 }
    );
  }
}

// PUT /api/cms/testimonials - Update existing testimonial with auto-translation
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Testimonial ID is required' },
        { status: 400 }
      );
    }

    console.log('📝 Updating testimonial:', id);

    const existingTestimonial = await prisma.testimonial.findUnique({ where: { id } });

    if (!existingTestimonial) {
      return NextResponse.json(
        { success: false, error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    
    if (body.name) updateData.name = body.name;
    if (body.role) updateData.role = body.role;
    if (body.content) updateData.content = body.content;
    if (body.rating !== undefined) updateData.rating = parseInt(body.rating);
    if (body.image !== undefined) updateData.image = body.image;
    if (body.packageName !== undefined) updateData.packageName = body.packageName;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.status) updateData.status = body.status;
    if (body.featured !== undefined) updateData.featured = body.featured;

    const updatedTestimonial = await prisma.testimonial.update({
      where: { id },
      data: updateData
    });

    console.log('✅ Testimonial updated:', updatedTestimonial.id);

    // Note: Translation is now MANUAL via CMS button
    // Use POST /api/translations/trigger to translate

    return NextResponse.json({
      success: true,
      data: updatedTestimonial,
      message: 'Testimonial updated successfully. Use translation button to re-translate if needed.'
    });

  } catch (error) {
    console.error('❌ Error updating testimonial:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update testimonial', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE /api/cms/testimonials - Delete testimonial and its translations
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Testimonial ID is required' },
        { status: 400 }
      );
    }

    console.log('🗑️  Deleting testimonial:', id);

    const existingTestimonial = await prisma.testimonial.findUnique({ where: { id } });

    if (!existingTestimonial) {
      return NextResponse.json(
        { success: false, error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    // Delete translations first
    await prisma.testimonialTranslation.deleteMany({
      where: { testimonialId: id }
    });

    // Delete testimonial
    await prisma.testimonial.delete({
      where: { id }
    });

    console.log('✅ Testimonial and translations deleted');

    return NextResponse.json({
      success: true,
      message: 'Testimonial and all translations deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting testimonial:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete testimonial', details: (error as Error).message },
      { status: 500 }
    );
  }
}
