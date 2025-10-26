import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { getGalleryTranslation } from '@/lib/auto-translate';

const prisma = new PrismaClient();

// Mock gallery data
const mockGalleryItems = [
  {
    id: '1',
    title: 'Bromo Sunrise',
    category: 'Landscape',
    image: '/uploads/bromo-sunrise-1.jpg',
    description: 'Spectacular sunrise view from Mount Bromo',
    tags: ['sunrise', 'bromo', 'volcano', 'landscape'],
    likes: 150,
    views: 1200,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    title: 'Ijen Blue Fire',
    category: 'Adventure',
    image: '/uploads/ijen-blue-fire-1.jpg',
    description: 'The mesmerizing blue fire phenomenon at Ijen Crater',
    tags: ['blue fire', 'ijen', 'crater', 'adventure'],
    likes: 200,
    views: 1500,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: '3',
    title: 'Penanjakan Viewpoint',
    category: 'Landscape',
    image: '/uploads/penanjakan-1.jpg',
    description: 'Panoramic view from Penanjakan viewpoint',
    tags: ['viewpoint', 'panorama', 'bromo', 'landscape'],
    likes: 120,
    views: 900,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  },
  {
    id: '4',
    title: 'Sulfur Mining',
    category: 'Culture',
    image: '/uploads/sulfur-mining-1.jpg',
    description: 'Traditional sulfur mining at Ijen Crater',
    tags: ['sulfur', 'mining', 'culture', 'tradition'],
    likes: 80,
    views: 600,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04')
  }
];

// Helper: Parse JSON string safely
function safeParse(jsonString: any, fallback: any = []) {
  if (typeof jsonString !== 'string') return fallback;
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
}

// Helper: Format gallery item for API response
function formatGalleryItem(item: any) {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    image: item.image,
    description: item.description,
    tags: safeParse(item.tags, []),
    likes: item.likes,
    views: item.views,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}

// GET: Fetch all gallery items or specific item
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const language = searchParams.get('language') || 'id';

    // Get single gallery item
    if (id) {
      const item = await prisma.galleryItem.findUnique({
        where: { id }
      });

      if (!item) {
        return NextResponse.json(
          { success: false, error: 'Gallery item not found' },
          { status: 404 }
        );
      }

      try {
        // Get translation from database if needed
        let merged = item;
        if (language !== 'id') {
          const translation = await getGalleryTranslation(item.id, language as any);
          
          if (translation) {
            merged = {
              ...item,
              title: translation.title || item.title,
              description: translation.description || item.description,
              tags: translation.tags || item.tags
            };
            console.log(`✅ Using database translation for gallery ${item.id} (${language})`);
          } else {
            // console.log(`⚠️  No translation found for gallery ${item.id} in ${language}`);
          }
        }
        
        return NextResponse.json({
          success: true,
          data: formatGalleryItem(merged)
        });
      } catch (error) {
        console.warn(`Error getting translation for gallery item ${item.id}:`, error);
        return NextResponse.json({
          success: true,
          data: formatGalleryItem(item)
        });
      }
    }

    // Build where clause for database query
    const where: any = {};
    
    if (category && category !== 'all') {
      where.category = category;
    }

    // Get all gallery items with filters from database
    const items = await prisma.galleryItem.findMany({
      where,
      orderBy: [
        { views: 'desc' },
        { likes: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Get translations from database if language is not Indonesian
    let translatedItems = items;
    if (language !== 'id') {
      translatedItems = await Promise.all(
        items.map(async (item) => {
          // Fetch translation from database
          const translation = await getGalleryTranslation(item.id, language as any);
          
          if (!translation) {
            // console.log(`⚠️  No translation found for gallery ${item.id} in ${language}`);
            return item;
          }
          
          // Merge original item with translated fields
          return {
            ...item,
            title: translation.title || item.title,
            description: translation.description || item.description,
            tags: translation.tags || item.tags
          };
        })
      );
    }
    
    return NextResponse.json({
      success: true,
      data: translatedItems.map(formatGalleryItem)
    });

  } catch (error) {
    console.error('Error fetching gallery items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gallery items' },
      { status: 500 }
    );
  }
}

// POST: Create new gallery item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.title || !body.category || !body.image) {
      return NextResponse.json(
        { success: false, error: 'Title, category, and image are required' },
        { status: 400 }
      );
    }

    // Create gallery item
    const newItem = await prisma.galleryItem.create({
      data: {
        title: body.title,
        category: body.category,
        image: body.image,
        description: body.description || '',
        tags: JSON.stringify(body.tags || []),
        likes: body.likes || 0,
        views: body.views || 0
      }
    });

    return NextResponse.json({
      success: true,
      data: formatGalleryItem(newItem)
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating gallery item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create gallery item' },
      { status: 500 }
    );
  }
}

// PUT: Update existing gallery item or create new one (upsert)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body.id;

    // Build update/create data
    const galleryData: any = {
      title: body.title || 'Untitled',
      category: body.category || 'general',
      image: body.image || '',
      description: body.description || '',
      tags: body.tags ? JSON.stringify(body.tags) : null,
      likes: body.likes || 0,
      views: body.views || 0
    };

    if (id) {
      // Update existing item
      const existingItem = await prisma.galleryItem.findUnique({
        where: { id: id }
      });

      if (!existingItem) {
        return NextResponse.json(
          { success: false, error: 'Gallery item not found' },
          { status: 404 }
        );
      }

      const updatedItem = await prisma.galleryItem.update({
        where: { id: id },
        data: galleryData
      });

      return NextResponse.json({
        success: true,
        data: formatGalleryItem(updatedItem)
      });
    } else {
      // Create new item
      const newItem = await prisma.galleryItem.create({
        data: galleryData
      });

      return NextResponse.json({
        success: true,
        data: formatGalleryItem(newItem)
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error upserting gallery item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upsert gallery item' },
      { status: 500 }
    );
  }
}

// DELETE: Delete gallery item
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Gallery item ID is required' },
        { status: 400 }
      );
    }

    // Check if item exists
    const existingItem = await prisma.galleryItem.findUnique({
      where: { id: id }
    });

    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    await prisma.galleryItem.delete({
      where: { id: id }
    });

    return NextResponse.json({
      success: true,
      message: 'Gallery item deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting gallery item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete gallery item' },
      { status: 500 }
    );
  }
}
