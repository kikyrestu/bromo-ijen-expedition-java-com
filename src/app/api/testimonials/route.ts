import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getTestimonialTranslation } from '@/lib/auto-translate';

// Mock testimonials data
const mockTestimonials = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    rating: 5,
    review: 'Amazing experience! The sunrise at Bromo was absolutely breathtaking. Our guide was knowledgeable and friendly.',
    package: 'Bromo Ijen Tour Package',
    status: 'approved',
    featured: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael@example.com',
    rating: 5,
    review: 'The blue fire at Ijen was incredible! Highly recommend this tour to anyone visiting Indonesia.',
    package: 'Bromo Sunrise Tour',
    status: 'approved',
    featured: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: '3',
    name: 'Emma Wilson',
    email: 'emma@example.com',
    rating: 4,
    review: 'Great tour with professional guides. The accommodation was comfortable and the food was delicious.',
    package: 'Bromo Ijen Tour Package',
    status: 'approved',
    featured: false,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  }
];

// GET /api/testimonials
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // approved, pending, rejected
    const featured = searchParams.get('featured');
    const includeAll = searchParams.get('includeAll'); // For CMS
    const language = searchParams.get('language') || 'id';

    // Build where clause for database query
    const where: any = {};
    
    // Filter by status (default: only approved for frontend)
    if (includeAll !== 'true') {
      where.status = status || 'approved';
    } else if (status) {
      where.status = status;
    }

    // Filter by featured
    if (featured === 'true') {
      where.featured = true;
    }

    // Fetch testimonials from database
    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    // Get translations from database if language is not Indonesian
    let translatedTestimonials = testimonials;
    if (language !== 'id') {
      translatedTestimonials = await Promise.all(
        testimonials.map(async (testimonial) => {
          // Fetch translation from database
          const translation = await getTestimonialTranslation(testimonial.id, language as any);
          
          if (!translation) {
            // console.log(`⚠️  No translation found for testimonial ${testimonial.id} in ${language}`);
            return testimonial;
          }
          
          // Merge original testimonial with translated fields
          return {
            ...testimonial,
            name: translation.name || testimonial.name,
            content: translation.content || testimonial.content,
            location: translation.location || testimonial.location,
            packageName: translation.packageName || testimonial.packageName,
            role: translation.role || testimonial.role
          };
        })
      );
    }
    
    return NextResponse.json({
      success: true,
      data: translatedTestimonials
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

// POST /api/testimonials
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validasi data
    if (!body.name || !body.content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, content' },
        { status: 400 }
      );
    }
    
    const newTestimonial = await prisma.testimonial.create({
      data: {
        name: body.name,
        role: body.role || '',
        content: body.content,
        rating: parseInt(body.rating) || 5,
        image: body.image || '',
        packageName: body.packageName || '',
        location: body.location || '',
        status: body.status || 'pending',
        featured: body.featured || false
      }
    });
    
    return NextResponse.json({
      success: true,
      data: newTestimonial
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create testimonial' },
      { status: 500 }
    );
  }
}

// PUT /api/testimonials
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    // Check if testimonial exists
    const existing = await prisma.testimonial.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.role !== undefined) updateData.role = body.role;
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

    return NextResponse.json({
      success: true,
      data: updatedTestimonial
    });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update testimonial' },
      { status: 500 }
    );
  }
}

// DELETE /api/testimonials
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    // Check if testimonial exists
    const existing = await prisma.testimonial.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    await prisma.testimonial.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete testimonial' },
      { status: 500 }
    );
  }
}
