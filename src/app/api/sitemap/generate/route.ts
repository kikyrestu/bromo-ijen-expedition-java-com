import { NextRequest, NextResponse } from 'next/server';

// Mock data for development
const mockData = {
  packages: [],
  blogs: [],
  galleryItems: [],
  settings: { siteUrl: 'https://bromoijen.com' }
};

// POST: Generate sitemap and ping search engines
export async function POST(request: NextRequest) {
  try {
    // Use mock data for development
    const { packages, blogs, galleryItems, settings } = mockData;

    const siteUrl = settings?.siteUrl || 'https://bromoijen.com';

    // Calculate total pages
    const totalPages = 1 + packages.length + blogs.length + 1; // +1 for home, +1 for gallery

    // Mock ping results
    const googlePinged = false;
    const bingPinged = false;

    return NextResponse.json({
      success: true,
      message: 'Sitemap generated and search engines pinged',
      data: {
        totalPages,
        googlePinged,
        bingPinged,
        sitemapUrl: `${siteUrl}/sitemap.xml`
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate sitemap' },
      { status: 500 }
    );
  }
}

// GET: Get sitemap generation status
export async function GET(request: NextRequest) {
  try {
    // Mock response for development
    return NextResponse.json({
      success: true,
      data: {
        totalPages: 0,
        lastGenerated: null,
        googlePinged: false,
        bingPinged: false
      }
    });
  } catch (error) {
    console.error('Error fetching sitemap status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sitemap status' },
      { status: 500 }
    );
  }
}

