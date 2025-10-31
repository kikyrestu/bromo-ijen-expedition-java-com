import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const DEFAULT_LANGUAGE = 'id';

type SupportedLanguage = 'id' | 'en' | 'de' | 'nl' | 'zh';

const isSupportedLanguage = (language: string): language is SupportedLanguage => {
  return ['id', 'en', 'de', 'nl', 'zh'].includes(language);
};

interface BannerTranslationRecord {
  language: SupportedLanguage;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  imageUrl?: string | null;
}

interface BannerData {
  id: string;
  slug: string;
  name: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  displayType: string;
  imageUrl?: string | null;
  backgroundColor?: string | null;
  overlayColor?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  isActive: boolean;
  customHtml?: string | null;
  createdAt: Date;
  updatedAt: Date;
  translations?: BannerTranslationRecord[] | null;
}

interface BannerPlacementData {
  id: string;
  location: string;
  position: number;
  isActive: boolean;
  startDate: Date | null;
  endDate: Date | null;
  banner: BannerData;
}

interface BannerPlacementResponse {
  id: string;
  slug: string;
  displayType: string;
  imageUrl?: string | null;
  backgroundColor?: string | null;
  overlayColor?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  isActive: boolean;
  customHtml?: string | null;
  placement: {
    id: string;
    location: string;
    position: number;
    isActive: boolean;
    startDate?: string | null;
    endDate?: string | null;
  };
  meta: {
    createdAt: string;
    updatedAt: string;
  };
}

const pickBannerTranslation = (banner: BannerData, language: SupportedLanguage) => {
  const translations = Array.isArray(banner.translations) ? banner.translations : [];

  const exactMatch = translations.find((translation) => translation.language === language);
  if (exactMatch) {
    return exactMatch;
  }

  const fallback = translations.find((translation) => translation.language === DEFAULT_LANGUAGE);
  if (fallback) {
    return fallback;
  }

  return undefined;
};

const buildResponseItem = (placement: BannerPlacementData, language: SupportedLanguage) => {
  const { banner } = placement;
  const translation = pickBannerTranslation(banner, language);

  const merged = {
    title: translation?.title ?? banner.title ?? banner.name,
    subtitle: translation?.subtitle ?? banner.subtitle ?? undefined,
    description: translation?.description ?? banner.description ?? undefined,
    ctaText: translation?.ctaText ?? banner.ctaText ?? undefined,
    ctaUrl: translation?.ctaUrl ?? banner.ctaUrl ?? undefined,
    imageUrl: translation?.imageUrl ?? banner.imageUrl ?? undefined
  };

  return {
    id: placement.banner.id,
    slug: banner.slug,
    displayType: banner.displayType,
    imageUrl: merged.imageUrl,
    backgroundColor: banner.backgroundColor,
    overlayColor: banner.overlayColor,
    ctaText: merged.ctaText,
    ctaUrl: merged.ctaUrl,
    title: merged.title,
    subtitle: merged.subtitle,
    description: merged.description,
    isActive: banner.isActive,
    customHtml: banner.customHtml,
    placement: {
      id: placement.id,
      location: placement.location,
      position: placement.position,
      isActive: placement.isActive,
      startDate: placement.startDate,
      endDate: placement.endDate
    },
    meta: {
      createdAt: banner.createdAt?.toISOString?.() ?? String(banner.createdAt ?? ''),
      updatedAt: banner.updatedAt?.toISOString?.() ?? String(banner.updatedAt ?? '')
    }
  };
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const location = searchParams.get('location') ?? undefined;
    const languageParam = searchParams.get('language') ?? DEFAULT_LANGUAGE;
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const dateParam = searchParams.get('date');

    const language: SupportedLanguage = isSupportedLanguage(languageParam)
      ? languageParam
      : DEFAULT_LANGUAGE;

    const targetDate = dateParam ? new Date(dateParam) : new Date();
    if (Number.isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid date parameter' },
        { status: 400 }
      );
    }

    const placementFilters: any = {
      ...(location ? { location } : {}),
      ...(includeInactive ? {} : { isActive: true }),
      ...(includeInactive
        ? {}
        : {
            banner: {
              isActive: true
            }
          }
      ),
      AND: [
        {
          OR: [
            { startDate: null },
            { startDate: { lte: targetDate } }
          ]
        },
        {
          OR: [
            { endDate: null },
            { endDate: { gte: targetDate } }
          ]
        }
      ]
    };

    let placements: BannerPlacementData[] = [];
    try {
      const rawPlacements = await prisma.bannerPlacement.findMany({
        where: placementFilters,
        include: {
          banner: {
            include: {
              translations: true
            }
          }
        }
      });
      placements = rawPlacements as unknown as BannerPlacementData[];
    } catch (error) {
      if (error instanceof Error) {
        const message = error.message || '';
        if (message.includes('bannerPlacement') || message.includes('banner_translations')) {
          console.warn('⚠️ Banner tables not found yet, returning empty list');
          return NextResponse.json({ success: true, data: [] });
        }
      }
      throw error;
    }

    if (!placements.length) {
      return NextResponse.json({ success: true, data: [] });
    }

    const sortedPlacements = placements
      .slice()
      .sort((a: BannerPlacementData, b: BannerPlacementData) => {
        if (a.location === b.location) {
          return a.position - b.position;
        }
        return a.location.localeCompare(b.location);
      });

    const data = sortedPlacements.map((placement) => buildResponseItem(placement, language));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('❌ Failed to fetch banners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banners', details: (error as Error).message },
      { status: 500 }
    );
  }
}
