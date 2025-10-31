import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type NavigationItemPayload = {
  id?: string;
  menuId?: string;
  parentId?: string | null;
  order?: number;
  isActive?: boolean;
  isExternal?: boolean;
  target?: string;
  iconType?: string;
  iconName?: string | null;
  iconUrl?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  hoverColor?: string | null;
  activeColor?: string | null;
  fontFamily?: string | null;
  fontSize?: string | null;
  fontWeight?: string | null;
  translations?: Array<{
    id?: string;
    language: string;
    title: string;
    url: string;
  }>;
};

const DEFAULT_LOCATION = 'header';

const LANGUAGE_ALIAS_MAP: Record<string, string> = {
  id: 'id',
  en: 'en',
  de: 'de',
  nl: 'nl',
  zh: 'zh',
  cn: 'zh' // legacy code support
};

function normalizeLanguageCode(language?: string | null) {
  if (!language) return '';
  const lower = language.toLowerCase();
  return LANGUAGE_ALIAS_MAP[lower] ?? lower;
}

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

function normalizeColor(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

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

  const itemsCount = await prisma.navigationItem.count({ where: { menuId: menu.id } });
  if (itemsCount === 0) {
    for (const item of DEFAULT_ITEMS) {
      await prisma.navigationItem.create({
        data: {
          menuId: menu.id,
          order: item.order,
          iconType: 'fontawesome',
          iconName: item.iconName,
          translations: {
            create: item.translations.map(t => ({
              language: t.language,
              title: t.title,
              url: t.url
            }))
          }
        }
      });
    }
  }

  return menu;
}

async function resolveMenu(menuId?: string | null, location: string = DEFAULT_LOCATION) {
  if (menuId) {
    // If menuId looks like a special keyword, treat it as location
    if (['header', 'footer', 'mobile'].includes(menuId)) {
      const menu = await ensureMenu(menuId);
      return menu;
    }

    const menu = await prisma.navigationMenu.findUnique({ where: { id: menuId } });
    if (menu) return menu;
  }

  return ensureMenu(location);
}

function formatItem(item: any, language: string, menuLocation: string) {
  const normalizedLanguage = normalizeLanguageCode(language) || 'id';
  const translation = item.translations.find((t: any) => normalizeLanguageCode(t.language) === normalizedLanguage)
    || item.translations.find((t: any) => normalizeLanguageCode(t.language) === 'id')
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
    translations: item.translations.map((t: any) => ({
      ...t,
      language: normalizeLanguageCode(t.language)
    })),
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

function sanitizeTranslations(translations: NavigationItemPayload['translations']) {
  if (!translations) return [];
  return translations
    .filter(t => !!t && t.language && t.title && t.url)
    .map(t => ({
      language: normalizeLanguageCode(t.language),
      title: t.title,
      url: t.url
    }));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || DEFAULT_LOCATION;
    const language = normalizeLanguageCode(searchParams.get('language')) || 'id';
    const parentId = searchParams.get('parentId');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const menu = await ensureMenu(location);

    const items = await prisma.navigationItem.findMany({
      where: {
        menuId: menu.id,
        ...(parentId ? { parentId } : {}),
        ...(!includeInactive ? { isActive: true } : {})
      },
      include: {
        translations: true
      },
      orderBy: [{ order: 'asc' }]
    });

    const hierarchicalItems = parentId
      ? items.map(item => formatItem(item, language, menu.location))
      : buildHierarchy(items, language, menu.location);

    return NextResponse.json({
      success: true,
      data: hierarchicalItems,
      meta: {
        menu: {
          id: menu.id,
          name: menu.name,
          location: menu.location,
          isActive: menu.isActive
        }
      }
    });
  } catch (error) {
    console.error('Navigation items API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch navigation items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: NavigationItemPayload & { location?: string } = await request.json();

    const translations = sanitizeTranslations(body.translations);
    if (translations.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one translation with title and url is required' },
        { status: 400 }
      );
    }

    const menu = await resolveMenu(body.menuId, body.location || DEFAULT_LOCATION);

    if (body.parentId) {
      const parentExists = await prisma.navigationItem.findUnique({ where: { id: body.parentId } });
      if (!parentExists) {
        return NextResponse.json(
          { success: false, error: 'Parent item not found' },
          { status: 404 }
        );
      }
    }

    const siblingCount = await prisma.navigationItem.count({
      where: { menuId: menu.id, parentId: body.parentId ?? null }
    });

    const createdItem = await prisma.navigationItem.create({
      data: {
        menuId: menu.id,
        parentId: body.parentId ?? null,
        order: typeof body.order === 'number' ? body.order : siblingCount + 1,
        isActive: body.isActive ?? true,
        isExternal: body.isExternal ?? false,
        target: body.target || '_self',
        iconType: body.iconType || 'fontawesome',
        iconName: body.iconName ?? null,
        iconUrl: body.iconUrl ?? null,
        backgroundColor: normalizeColor(body.backgroundColor),
        textColor: normalizeColor(body.textColor),
        hoverColor: normalizeColor(body.hoverColor),
        activeColor: normalizeColor(body.activeColor),
        fontFamily: body.fontFamily ?? null,
        fontSize: body.fontSize ?? null,
        fontWeight: body.fontWeight ?? null,
        translations: {
          create: translations
        }
      },
      include: {
        translations: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Navigation item created successfully',
      data: formatItem(createdItem, translations[0].language, menu.location)
    });
  } catch (error) {
    console.error('Navigation item create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create navigation item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: NavigationItemPayload & { location?: string } = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const existingItem = await prisma.navigationItem.findUnique({ where: { id: body.id } });
    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    if (body.parentId === body.id) {
      return NextResponse.json(
        { success: false, error: 'Item cannot be its own parent' },
        { status: 400 }
      );
    }

    const translations = sanitizeTranslations(body.translations);
    if (translations.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one translation with title and url is required' },
        { status: 400 }
      );
    }

    const menu = await resolveMenu(body.menuId ?? existingItem.menuId, body.location || DEFAULT_LOCATION);

    if (body.parentId) {
      const parent = await prisma.navigationItem.findUnique({ where: { id: body.parentId } });
      if (!parent) {
        return NextResponse.json(
          { success: false, error: 'Parent item not found' },
          { status: 404 }
        );
      }
    }

    const updatedItem = await prisma.navigationItem.update({
      where: { id: body.id },
      data: {
        menuId: menu.id,
        parentId: body.parentId ?? null,
        order: typeof body.order === 'number' ? body.order : existingItem.order,
        isActive: body.isActive ?? existingItem.isActive,
        isExternal: body.isExternal ?? existingItem.isExternal,
        target: body.target || existingItem.target,
        iconType: body.iconType || existingItem.iconType,
        iconName: body.iconName ?? existingItem.iconName,
        iconUrl: body.iconUrl ?? existingItem.iconUrl,
        backgroundColor: normalizeColor(body.backgroundColor ?? existingItem.backgroundColor),
        textColor: normalizeColor(body.textColor ?? existingItem.textColor),
        hoverColor: normalizeColor(body.hoverColor ?? existingItem.hoverColor),
        activeColor: normalizeColor(body.activeColor ?? existingItem.activeColor),
        fontFamily: body.fontFamily ?? existingItem.fontFamily,
        fontSize: body.fontSize ?? existingItem.fontSize,
        fontWeight: body.fontWeight ?? existingItem.fontWeight,
        translations: {
          deleteMany: {},
          create: translations
        }
      },
      include: {
        translations: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Navigation item updated successfully',
      data: formatItem(updatedItem, translations[0].language, menu.location)
    });
  } catch (error) {
    console.error('Navigation item update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update navigation item' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, direction } = body as { id?: string; direction?: 'up' | 'down' };

    if (!id || (direction !== 'up' && direction !== 'down')) {
      return NextResponse.json(
        { success: false, error: 'Item ID and direction ("up" or "down") are required' },
        { status: 400 }
      );
    }

    const item = await prisma.navigationItem.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    const siblings = await prisma.navigationItem.findMany({
      where: {
        menuId: item.menuId,
        parentId: item.parentId ?? null
      },
      orderBy: [{ order: 'asc' }]
    });

    const currentIndex = siblings.findIndex(sibling => sibling.id === id);
    if (currentIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Item not found in sibling set' },
        { status: 404 }
      );
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= siblings.length) {
      return NextResponse.json(
        { success: false, error: `Cannot move item ${direction}` },
        { status: 400 }
      );
    }

    const targetItem = siblings[targetIndex];

    await prisma.$transaction([
      prisma.navigationItem.update({
        where: { id: item.id },
        data: { order: targetItem.order }
      }),
      prisma.navigationItem.update({
        where: { id: targetItem.id },
        data: { order: item.order }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: `Navigation item moved ${direction} successfully`
    });
  } catch (error) {
    console.error('Navigation item reorder error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reorder navigation item' },
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

    const target = await prisma.navigationItem.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    const allItems = await prisma.navigationItem.findMany({
      where: { menuId: target.menuId },
      select: { id: true, parentId: true }
    });

    const toDelete = new Set<string>([id]);
    let changed = true;

    while (changed) {
      changed = false;
      for (const item of allItems) {
        if (item.parentId && toDelete.has(item.parentId) && !toDelete.has(item.id)) {
          toDelete.add(item.id);
          changed = true;
        }
      }
    }

    const ids = Array.from(toDelete);

    await prisma.$transaction([
      prisma.navigationItemTranslation.deleteMany({ where: { itemId: { in: ids } } }),
      prisma.navigationItem.deleteMany({ where: { id: { in: ids } } })
    ]);

    return NextResponse.json({
      success: true,
      message: 'Navigation item deleted successfully',
      data: { id, deletedCount: ids.length }
    });
  } catch (error) {
    console.error('Navigation delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete navigation item' },
      { status: 500 }
    );
  }
}
