import { NextRequest, NextResponse } from 'next/server';

// Mock navigation items data
const mockNavigationItems = [
  {
    id: 'home',
    title: 'Home',
    url: '/',
    order: 1,
    parentId: null,
    children: []
  },
  {
    id: 'about',
    title: 'About',
    url: '/#about',
    order: 2,
    parentId: null,
    children: []
  },
  {
    id: 'destinations',
    title: 'Destinations',
    url: '/#destinasi',
    order: 3,
    parentId: null,
    children: []
  },
  {
    id: 'packages',
    title: 'Packages',
    url: '/#packages',
    order: 4,
    parentId: null,
    children: []
  },
  {
    id: 'blog',
    title: 'Blog',
    url: '/#blog',
    order: 5,
    parentId: null,
    children: []
  },
  {
    id: 'contact',
    title: 'Contact',
    url: '/#contact',
    order: 6,
    parentId: null,
    children: []
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    const location = searchParams.get('location');

    let items = mockNavigationItems;

    // Filter by parentId if provided
    if (parentId) {
      items = items.filter(item => item.parentId === parentId);
    }

    // Filter by location if provided
    if (location) {
      // For now, all items are available in all locations
      // In a real app, you might have different items for different locations
    }

    return NextResponse.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Navigation items API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch navigation items' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const { PrismaClient } = require('@/generated/prisma');
    const prisma = new PrismaClient();

    await prisma.navigationItem.delete({
      where: { id }
    });

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: 'Navigation item deleted successfully'
    });
  } catch (error) {
    console.error('Navigation delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete navigation item' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, url, order, parentId } = body;

    if (!title || !url) {
      return NextResponse.json(
        { success: false, error: 'Title and URL are required' },
        { status: 400 }
      );
    }

    // Mock save operation
    const newItem = {
      id: `item-${Date.now()}`,
      title,
      url,
      order: order || 1,
      parentId: parentId || null,
      children: []
    };

    return NextResponse.json({
      success: true,
      message: 'Navigation item saved successfully',
      data: newItem
    });
  } catch (error) {
    console.error('Navigation item save error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save navigation item' },
      { status: 500 }
    );
  }
}
