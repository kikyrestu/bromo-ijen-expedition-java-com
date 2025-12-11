import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Ping Google Search Console (no API key needed, just ping URL)
async function pingGoogleSearchConsole(sitemapUrl: string): Promise<boolean> {
  try {
    const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    const response = await fetch(pingUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SitemapPing/1.0)'
      }
    });
    
    // Google returns 200 even if there are warnings, so we check for success
    return response.ok;
  } catch (error) {
    console.error('Error pinging Google Search Console:', error);
    return false;
  }
}

// Ping Bing Webmaster Tools (no API key needed, just ping URL)
async function pingBingWebmaster(sitemapUrl: string): Promise<boolean> {
  try {
    const pingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    const response = await fetch(pingUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SitemapPing/1.0)'
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error pinging Bing Webmaster:', error);
    return false;
  }
}

// POST: Generate sitemap and ping search engines
export async function POST(request: NextRequest) {
  try {
    // Get settings from database
    const settings = await prisma.settings.findUnique({
      where: { id: 'default' }
    });

    const siteUrl = settings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://bromoijen.com';
    const sitemapUrl = `${siteUrl}/sitemap.xml`;

    // Generate sitemap (this will be served dynamically via /sitemap.xml route)
    // We don't need to save it, just ensure it's generated
    
    // Get counts for stats
    const [packageCount, blogCount] = await Promise.all([
      prisma.package.count({ where: { status: 'published' } }),
      prisma.blog.count({ where: { status: 'published' } })
    ]);

    const totalPages = 1 + packageCount + blogCount + 1; // +1 for home, +1 for gallery

    // Ping search engines
    const [googlePinged, bingPinged] = await Promise.all([
      pingGoogleSearchConsole(sitemapUrl),
      pingBingWebmaster(sitemapUrl)
    ]);

    // Log sitemap generation
    await prisma.sitemapLog.create({
      data: {
        totalPages,
        lastGenerated: new Date(),
        googlePinged,
        bingPinged
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Sitemap generated and search engines pinged',
      data: {
        totalPages,
        googlePinged,
        bingPinged,
        sitemapUrl,
        lastGenerated: new Date().toISOString()
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
    // Get latest sitemap log
    const latestLog = await prisma.sitemapLog.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (latestLog) {
      return NextResponse.json({
        success: true,
        data: {
          totalPages: latestLog.totalPages,
          lastGenerated: latestLog.lastGenerated?.toISOString() || latestLog.createdAt.toISOString(),
          googlePinged: latestLog.googlePinged,
          bingPinged: latestLog.bingPinged
        }
      });
    }

    // Return default if no log exists
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
