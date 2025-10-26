import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { 
  getLocalizedUrlSettingsForCMS, 
  updateLocalizedUrlSettings,
  updatePackageLocalizedUrls,
  updateBlogLocalizedUrls 
} from '@/lib/localized-urls';

// GET - Fetch localized URL settings
export async function GET(request: NextRequest) {
  try {
    const settings = await getLocalizedUrlSettingsForCMS();
    
    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching localized URL settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch localized URL settings' },
      { status: 500 }
    );
  }
}

// PUT - Update localized URL settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentType, urlPaths, autoGenerate, customPattern } = body;

    if (!contentType || !urlPaths) {
      return NextResponse.json(
        { success: false, error: 'Content type and URL paths are required' },
        { status: 400 }
      );
    }

    const success = await updateLocalizedUrlSettings(
      contentType,
      urlPaths,
      autoGenerate || false,
      customPattern
    );

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Localized URL settings updated successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to update localized URL settings' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating localized URL settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update localized URL settings' },
      { status: 500 }
    );
  }
}

// POST - Regenerate localized URLs for all content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentType } = body;

    if (!contentType) {
      return NextResponse.json(
        { success: false, error: 'Content type is required' },
        { status: 400 }
      );
    }

    let updatedCount = 0;

    if (contentType === 'packages') {
      // Update all packages
      const packages = await prisma.package.findMany({
        where: { slug: { not: null } },
        select: { id: true, slug: true }
      });

      for (const pkg of packages) {
        if (pkg.slug) {
          await updatePackageLocalizedUrls(pkg.id, pkg.slug);
          updatedCount++;
        }
      }
    } else if (contentType === 'blogs') {
      // Update all blogs
      const blogs = await prisma.blog.findMany({
        where: { slug: { not: null } },
        select: { id: true, slug: true }
      });

      for (const blog of blogs) {
        if (blog.slug) {
          await updateBlogLocalizedUrls(blog.id, blog.slug);
          updatedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Regenerated localized URLs for ${updatedCount} ${contentType}`,
      updatedCount
    });
  } catch (error) {
    console.error('Error regenerating localized URLs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to regenerate localized URLs' },
      { status: 500 }
    );
  }
}

