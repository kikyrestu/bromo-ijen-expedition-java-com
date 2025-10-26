import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || 'header';
    const includeItems = searchParams.get('includeItems') === 'true';

    // Fetch menu from database
    const menu = await prisma.navigationMenu.findFirst({
      where: { location },
      include: {
        items: includeItems ? {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            translations: true,
            children: {
              orderBy: { order: 'asc' },
              include: {
                translations: true
              }
            }
          }
        } : false
      }
    });

    if (!menu) {
      return NextResponse.json(
        { success: false, error: 'Menu location not found' },
        { status: 404 }
      );
    }

    // Build nested items structure
    let items: any[] = [];
    if (includeItems && menu.items) {
      // Filter top-level items (no parent)
      const topLevelItems = menu.items.filter(item => !item.parentId);
      
      items = topLevelItems.map(item => {
        const itemData: any = {
          id: item.id,
          menuId: item.menuId,
          parentId: item.parentId,
          order: item.order,
          isActive: item.isActive,
          isExternal: item.isExternal,
          target: item.target,
          iconType: item.iconType,
          iconName: item.iconName,
          iconUrl: item.iconUrl,
          backgroundColor: item.backgroundColor,
          textColor: item.textColor,
          hoverColor: item.hoverColor,
          activeColor: item.activeColor,
          fontFamily: item.fontFamily,
          fontSize: item.fontSize,
          fontWeight: item.fontWeight,
          translations: (item as any).translations || [],
          children: []
        };

        // Find children for this item
        const children = menu.items.filter(child => child.parentId === item.id);
        if (children.length > 0) {
          itemData.children = children.map(child => ({
            id: child.id,
            menuId: child.menuId,
            parentId: child.parentId,
            order: child.order,
            isActive: child.isActive,
            isExternal: child.isExternal,
            target: child.target,
            iconType: child.iconType,
            iconName: child.iconName,
            iconUrl: child.iconUrl,
            backgroundColor: child.backgroundColor,
            textColor: child.textColor,
            hoverColor: child.hoverColor,
            activeColor: child.activeColor,
            fontFamily: child.fontFamily,
            fontSize: child.fontSize,
            fontWeight: child.fontWeight,
            translations: (child as any).translations || []
          }));
        }

        return itemData;
      });
    }

    const response = {
      success: true,
      data: [{
        id: menu.id,
        name: menu.name,
        location: menu.location,
        isActive: menu.isActive,
        items: items
      }]
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Navigation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch navigation data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, items } = body;

    if (!location || !items) {
      return NextResponse.json(
        { success: false, error: 'Location and items are required' },
        { status: 400 }
      );
    }

    // Mock save operation
    return NextResponse.json({
      success: true,
      message: 'Navigation menu saved successfully',
      data: {
        id: `${location}-menu`,
        location,
        items
      }
    });
  } catch (error) {
    console.error('Navigation save error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save navigation menu' },
      { status: 500 }
    );
  }
}
