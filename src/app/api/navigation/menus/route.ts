import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const DEFAULT_LOCATION = 'header';

const DEFAULT_ITEMS = [
  {
    order: 1,
    iconName: 'fa-home',
    translations: [
      { language: 'id', title: 'Beranda', url: '/' },
      { language: 'en', title: 'Home', url: '/' }
    ]
  },
  {
    order: 2,
    iconName: 'fa-info-circle',
    translations: [
      { language: 'id', title: 'Tentang', url: '/#about' },
      { language: 'en', title: 'About', url: '/#about' }
    ]
  },
  {
    order: 3,
    iconName: 'fa-map-marker-alt',
    translations: [
      { language: 'id', title: 'Destinasi', url: '/#destinasi' },
      { language: 'en', title: 'Destinations', url: '/#destinations' }
    ]
  },
  {
    order: 4,
    iconName: 'fa-box',
    translations: [
      { language: 'id', title: 'Paket', url: '/#packages' },
      { language: 'en', title: 'Packages', url: '/#packages' }
    ]
  },
  {
    order: 5,
    iconName: 'fa-blog',
    translations: [
      { language: 'id', title: 'Blog', url: '/#blog' },
      { language: 'en', title: 'Blog', url: '/#blog' }
    ]
  },
  {
    order: 6,
    iconName: 'fa-envelope',
    translations: [
      { language: 'id', title: 'Kontak', url: '/#contact' },
      { language: 'en', title: 'Contact', url: '/#contact' }
    ]
  }
];

async function ensureMenu(location: string) {
  let menu = await prisma.navigationMenu.findFirst({ where: { location } });

  if (!menu) {
    menu = await prisma.navigationMenu.create({
      data: {
        name: `${location.replace(/\b\w/g, c => c.toUpperCase())} Menu`,
        location,
        isActive: true
      }
    });
  }

  const itemCount = await prisma.navigationItem.count({ where: { menuId: menu.id } });
  if (itemCount === 0) {
    for (const item of DEFAULT_ITEMS) {
      await prisma.navigationItem.create({
        data: {
          menuId: menu.id,
          order: item.order,
          iconType: 'fontawesome',
          iconName: item.iconName,
          translations: {
            create: item.translations
          }
        }
      });
    }
  }

  return menu;
}

function formatItem(item: any, language: string, menuLocation: string) {
  const translation = item.translations.find((t: any) => t.language === language)
    || item.translations.find((t: any) => t.language === 'id')
    || item.translations[0];

  return {
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
    title: translation?.title ?? '',
    url: translation?.url ?? '#',
    translations: item.translations,
    location: menuLocation,
    children: [] as any[]
  };
}

function buildHierarchy(items: any[], language: string, menuLocation: string) {
  const itemMap = new Map<string, any>();
  const roots: any[] = [];

  for (const item of items) {
    itemMap.set(item.id, formatItem(item, language, menuLocation));
  }

  for (const item of itemMap.values()) {
    if (item.parentId && itemMap.has(item.parentId)) {
      itemMap.get(item.parentId)!.children.push(item);
    } else {
      roots.push(item);
    }
  }

  const sortChildren = (list: any[]) => {
    list.sort((a, b) => a.order - b.order);
    list.forEach(child => {
      if (child.children.length > 0) {
        sortChildren(child.children);
      }
    });
  };

  sortChildren(roots);
  return roots;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || 'header';
    const includeItems = searchParams.get('includeItems') === 'true';
    const language = searchParams.get('language') || 'id';

    const menu = await ensureMenu(location);

    let items: any[] = [];
    if (includeItems) {
      const dbItems = await prisma.navigationItem.findMany({
        where: {
          menuId: menu.id,
          isActive: true
        },
        include: {
          translations: true
        },
        orderBy: [{ order: 'asc' }]
      });

      items = buildHierarchy(dbItems, language, menu.location);
    }

    const response = {
      success: true,
      data: [{
        id: menu.id,
        name: menu.name,
        location: menu.location,
        isActive: menu.isActive,
        items
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
