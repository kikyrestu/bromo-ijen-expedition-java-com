import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

type BannerPayload = {
  id?: string;
  name: string;
  slug?: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  displayType?: string;
  imageUrl?: string | null;
  backgroundColor?: string | null;
  overlayColor?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  isActive?: boolean;
  customHtml?: string | null;
  translations?: Array<{
    language: string;
    title?: string | null;
    subtitle?: string | null;
    description?: string | null;
    ctaText?: string | null;
    ctaUrl?: string | null;
    imageUrl?: string | null;
  }>;
  placements?: Array<{
    id?: string;
    location: string;
    position?: number;
    isActive?: boolean;
    startDate?: string | null;
    endDate?: string | null;
  }>;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const banners = await prisma.banner.findMany({
      where: {
        isActive: activeOnly ? true : undefined,
        placements: location
          ? {
              some: {
                location,
                isActive: activeOnly ? true : undefined,
              },
            }
          : undefined,
      },
      include: {
        translations: true,
        placements: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: banners });
  } catch (error) {
    console.error('❌ Failed to fetch banners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banners', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BannerPayload;

    if (!body.name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Banner name is required' },
        { status: 400 }
      );
    }

    const slug = body.slug?.trim() || generateSlug(body.name);

    const banner = await prisma.banner.create({
      data: {
        slug,
        name: body.name,
        title: body.title,
        subtitle: body.subtitle,
        description: body.description,
        displayType: body.displayType || 'image',
        imageUrl: body.imageUrl,
        backgroundColor: body.backgroundColor,
        overlayColor: body.overlayColor,
        ctaText: body.ctaText,
        ctaUrl: body.ctaUrl,
        isActive: body.isActive ?? true,
        customHtml: body.customHtml,
        translations: body.translations
          ? {
              create: body.translations.map((translation) => ({
                language: translation.language,
                title: translation.title,
                subtitle: translation.subtitle,
                description: translation.description,
                ctaText: translation.ctaText,
                ctaUrl: translation.ctaUrl,
                imageUrl: translation.imageUrl,
              })),
            }
          : undefined,
        placements: body.placements?.length
          ? {
              create: body.placements.map((placement) => ({
                location: placement.location,
                position: placement.position ?? 0,
                isActive: placement.isActive ?? true,
                startDate: placement.startDate ? new Date(placement.startDate) : undefined,
                endDate: placement.endDate ? new Date(placement.endDate) : undefined,
              })),
            }
          : undefined,
      },
      include: {
        translations: true,
        placements: true,
      },
    });

    return NextResponse.json({ success: true, data: banner }, { status: 201 });
  } catch (error) {
    console.error('❌ Failed to create banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create banner', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as BannerPayload;

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    const existingBanner = await prisma.banner.findUnique({
      where: { id: body.id },
      include: {
        translations: true,
        placements: true,
      },
    });

    if (!existingBanner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    const banner = await prisma.banner.update({
      where: { id: body.id },
      data: {
        name: body.name ?? existingBanner.name,
        slug: body.slug?.trim() || existingBanner.slug,
        title: body.title ?? existingBanner.title,
        subtitle: body.subtitle ?? existingBanner.subtitle,
        description: body.description ?? existingBanner.description,
        displayType: body.displayType ?? existingBanner.displayType,
        imageUrl: body.imageUrl ?? existingBanner.imageUrl,
        backgroundColor: body.backgroundColor ?? existingBanner.backgroundColor,
        overlayColor: body.overlayColor ?? existingBanner.overlayColor,
        ctaText: body.ctaText ?? existingBanner.ctaText,
        ctaUrl: body.ctaUrl ?? existingBanner.ctaUrl,
        isActive: body.isActive ?? existingBanner.isActive,
        customHtml: body.customHtml ?? existingBanner.customHtml,
        translations: body.translations
          ? {
              deleteMany: {},
              create: body.translations.map((translation) => ({
                language: translation.language,
                title: translation.title,
                subtitle: translation.subtitle,
                description: translation.description,
                ctaText: translation.ctaText,
                ctaUrl: translation.ctaUrl,
                imageUrl: translation.imageUrl,
              })),
            }
          : undefined,
        placements: body.placements
          ? {
              deleteMany: {
                id: {
                  notIn: body.placements
                    .filter((placement) => placement.id)
                    .map((placement) => placement.id as string),
                },
              },
              upsert: body.placements.map((placement) => ({
                where: {
                  id: placement.id ?? '__new__',
                },
                update: {
                  location: placement.location,
                  position: placement.position ?? 0,
                  isActive: placement.isActive ?? true,
                  startDate: placement.startDate ? new Date(placement.startDate) : null,
                  endDate: placement.endDate ? new Date(placement.endDate) : null,
                },
                create: {
                  location: placement.location,
                  position: placement.position ?? 0,
                  isActive: placement.isActive ?? true,
                  startDate: placement.startDate ? new Date(placement.startDate) : undefined,
                  endDate: placement.endDate ? new Date(placement.endDate) : undefined,
                },
              })),
            }
          : undefined,
      },
      include: {
        translations: true,
        placements: true,
      },
    });

    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    console.error('❌ Failed to update banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update banner', details: (error as Error).message },
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
        { success: false, error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    await prisma.bannerTranslation.deleteMany({
      where: { bannerId: id },
    });

    await prisma.bannerPlacement.deleteMany({
      where: { bannerId: id },
    });

    await prisma.banner.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('❌ Failed to delete banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete banner', details: (error as Error).message },
      { status: 500 }
    );
  }
}
