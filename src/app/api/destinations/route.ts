import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET /api/destinations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');
    
    const where: any = {};
    
    if (category && category !== 'all') {
      where.category = category;
    }

    if (featured === 'true') {
      where.featured = true;
    }
    
    const destinations = await prisma.destination.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit ? parseInt(limit) : undefined
    });
    
    return NextResponse.json({
      success: true,
      data: destinations
    });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch destinations' },
      { status: 500 }
    );
  }
}

// POST /api/destinations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validasi data
    if (!body.name || !body.location || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const newDestination = await prisma.destination.create({
      data: {
        name: body.name,
        location: body.location,
        category: body.category,
        rating: body.rating || 0,
        visitors: body.visitors || '0',
        duration: body.duration || '',
        price: body.price || '',
        description: body.description || '',
        highlights: body.highlights || '',
        image: body.image || '',
        featured: body.featured || false
      }
    });
    
    return NextResponse.json({
      success: true,
      data: newDestination
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating destination:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create destination' },
      { status: 500 }
    );
  }
}

// PUT /api/destinations/[id] (Not implemented in this route file pattern usually, but keeping for compatibility if needed, though usually dynamic route is better)
// Since this is a simple route.ts, we can't handle [id] here easily without dynamic route folder. 
// But the previous mock implementation had it. 
// In Next.js App Router, PUT/DELETE usually go to src/app/api/destinations/[id]/route.ts
// I will remove PUT/DELETE from here as they should be in [id]/route.ts for proper REST structure.
// If the user needs them, I should create the [id] folder.
// For now, I will focus on GET/POST for the frontend to work.
