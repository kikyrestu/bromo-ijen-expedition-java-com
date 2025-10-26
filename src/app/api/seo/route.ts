import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// Helper function to generate language-specific keywords
function generateLanguageKeywords(language: string): string {
  const keywords = {
    id: 'bromo tour, ijen tour, wisata bromo, wisata ijen, paket wisata jawa timur',
    en: 'bromo tour, ijen tour, east java travel, mount bromo, ijen crater, indonesia adventure',
    de: 'bromo tour, ijen tour, ostjava reisen, mount bromo, ijen krater, indonesien abenteuer',
    nl: 'bromo tour, ijen tour, oost-java reizen, mount bromo, ijen krater, indonesië avontuur',
    zh: '布罗莫旅游, 伊真旅游, 东爪哇旅游, 布罗莫山, 伊真火山口, 印度尼西亚冒险'
  };
  return keywords[language as keyof typeof keywords] || keywords.en;
}

// Helper function to generate dynamic SEO data from content
async function generateDynamicSeoData(pageType: string, pageSlug: string, language: string) {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bromoijen.com';
    
    // Try to fetch content based on page type
    let content = null;
    
    if (pageType === 'section') {
      const response = await fetch(`${siteUrl}/api/sections?section=${pageSlug}&language=${language}`);
      const data = await response.json();
      content = data.success ? data.data : null;
    } else if (pageType === 'package') {
      const response = await fetch(`${siteUrl}/api/packages?slug=${pageSlug}&language=${language}`);
      const data = await response.json();
      content = data.success ? data.data : null;
    } else if (pageType === 'blog') {
      const response = await fetch(`${siteUrl}/api/blogs/${pageSlug}?language=${language}`);
      const data = await response.json();
      content = data.success ? data.data : null;
    }
    
    if (content) {
      const canonicalUrl = language === 'id' 
        ? `${siteUrl}/${pageType}/${pageSlug}`
        : `${siteUrl}/${language}/${pageType}/${pageSlug}`;
        
      return {
        title: content.title || `${pageType} - Bromo Ijen Tour`,
        description: content.description || content.excerpt || 'Experience the best volcanic adventures',
        keywords: generateLanguageKeywords(language),
        canonicalUrl,
        ogImage: content.image || '/og-default.jpg',
        ogType: 'website',
        noIndex: false
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error generating dynamic SEO data:', error);
    return null;
  }
}

// GET: Fetch SEO data for a specific page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageType = searchParams.get('pageType');
    const pageSlug = searchParams.get('pageSlug');
    const getAll = searchParams.get('all');
    const language = searchParams.get('language') || 'id';

    // Get all SEO data for CMS
    if (getAll === 'true') {
      const allSeoData = await prisma.seoData.findMany({
        orderBy: { updatedAt: 'desc' }
      });
      return NextResponse.json({
        success: true,
        data: allSeoData
      });
    }

    // Get specific page SEO data
    if (!pageType || !pageSlug) {
      return NextResponse.json(
        { success: false, error: 'pageType and pageSlug are required' },
        { status: 400 }
      );
    }

    const seoData = await prisma.seoData.findUnique({
      where: {
        pageType_pageSlug: {
          pageType,
          pageSlug
        }
      }
    });

    if (!seoData) {
      // Try to generate SEO data from dynamic content
      const dynamicSeoData = await generateDynamicSeoData(pageType, pageSlug, language);
      
      if (dynamicSeoData) {
        return NextResponse.json({
          success: true,
          data: dynamicSeoData
        });
      }

      // Return default SEO data from settings
      const settings = await prisma.settings.findUnique({
        where: { id: 'default' }
      });

      const siteUrl = settings?.siteUrl || 'https://bromoijen.com';
      const canonicalUrl = language === 'id' 
        ? `${siteUrl}/${pageType}/${pageSlug}`
        : `${siteUrl}/${language}/${pageType}/${pageSlug}`;

      return NextResponse.json({
        success: true,
        data: {
          title: settings?.siteName || 'Bromo Ijen Tour',
          description: settings?.siteDescription || 'Experience the best volcanic adventures',
          keywords: generateLanguageKeywords(language),
          canonicalUrl,
          ogImage: settings?.defaultOgImage || '/og-default.jpg',
          ogType: 'website',
          noIndex: false
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: seoData
    });
  } catch (error) {
    console.error('Error fetching SEO data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SEO data' },
      { status: 500 }
    );
  }
}

// POST: Create or update SEO data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageType, pageSlug, title, description, keywords, canonicalUrl, ogImage, ogType, noIndex } = body;

    if (!pageType || !pageSlug || !title || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: pageType, pageSlug, title, description' },
        { status: 400 }
      );
    }

    // Validate title and description length
    if (title.length > 60) {
      return NextResponse.json(
        { success: false, error: 'Title must be 60 characters or less for optimal SEO' },
        { status: 400 }
      );
    }

    if (description.length > 160) {
      return NextResponse.json(
        { success: false, error: 'Description must be 160 characters or less for optimal SEO' },
        { status: 400 }
      );
    }

    // Upsert SEO data
    const seoData = await prisma.seoData.upsert({
      where: {
        pageType_pageSlug: {
          pageType,
          pageSlug
        }
      },
      update: {
        title,
        description,
        keywords: keywords || '',
        canonicalUrl,
        ogImage: ogImage || null,
        ogType: ogType || 'website',
        noIndex: noIndex || false
      },
      create: {
        pageType,
        pageSlug,
        title,
        description,
        keywords: keywords || '',
        canonicalUrl,
        ogImage: ogImage || null,
        ogType: ogType || 'website',
        noIndex: noIndex || false
      }
    });

    // Trigger sitemap regeneration
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/sitemap/generate`, {
      method: 'POST'
    }).catch(() => console.log('Sitemap regeneration triggered'));

    return NextResponse.json({
      success: true,
      data: seoData,
      message: 'SEO data saved successfully'
    });
  } catch (error) {
    console.error('Error saving SEO data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save SEO data' },
      { status: 500 }
    );
  }
}

// DELETE: Remove SEO data
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

    await prisma.seoData.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'SEO data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting SEO data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete SEO data' },
      { status: 500 }
    );
  }
}

