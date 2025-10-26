// src/app/api/seo/bulk-generate/route.ts - Bulk SEO generation endpoint
import { NextRequest, NextResponse } from 'next/server';
import { bulkGenerateSeo } from '@/lib/auto-seo-generator';

// POST: Generate SEO data for all existing content
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting bulk SEO generation...');
    
    const result = await bulkGenerateSeo();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'SEO data generated for all content',
        data: result
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to generate SEO data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in bulk SEO generation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate SEO data' },
      { status: 500 }
    );
  }
}

// GET: Check SEO generation status
export async function GET(request: NextRequest) {
  try {
    const { PrismaClient } = await import('@/generated/prisma');
    const prisma = new PrismaClient();
    
    const seoCount = await prisma.seoData.count();
    const packageCount = await prisma.package.count({ where: { status: 'published' } });
    const blogCount = await prisma.blog.count({ where: { status: 'published' } });
    
    return NextResponse.json({
      success: true,
      data: {
        seoDataCount: seoCount,
        publishedPackages: packageCount,
        publishedBlogs: blogCount,
        coverage: seoCount > 0 ? Math.round((seoCount / (packageCount + blogCount + 8)) * 100) : 0 // +8 for main sections
      }
    });
  } catch (error) {
    console.error('Error checking SEO status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check SEO status' },
      { status: 500 }
    );
  }
}
