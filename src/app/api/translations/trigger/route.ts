/**
 * Manual Translation Trigger API
 * 
 * Endpoint untuk trigger translation secara MANUAL dari CMS
 * Tidak otomatis, harus diklik button oleh admin
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  autoTranslatePackage,
  autoTranslateBlog,
  autoTranslateTestimonial,
  autoTranslateGallery,
  autoTranslateSection
} from '@/lib/auto-translate';
import prisma from '@/lib/prisma';

// POST /api/translations/trigger
// Body: { contentType, contentId, forceRetranslate }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentType, contentId, forceRetranslate = false } = body;

    if (!contentType || !contentId) {
      return NextResponse.json(
        { success: false, error: 'contentType and contentId are required' },
        { status: 400 }
      );
    }

    console.log(`🔵 Manual translation triggered for ${contentType} ${contentId}`);

    let result;

    switch (contentType) {
      case 'section': {
        // Get section data with timeout protection
        const section = await Promise.race([
          prisma.sectionContent.findUnique({
            where: { sectionId: contentId }
          }),
          new Promise<any>((_, reject) => 
            setTimeout(() => reject(new Error('Database query timeout')), 10000)
          )
        ]);

        if (!section) {
          return NextResponse.json(
            { success: false, error: 'Section not found' },
            { status: 404 }
          );
        }

        const translationData = {
          title: section.title || undefined,
          subtitle: section.subtitle || undefined,
          description: section.description || undefined,
          ctaText: section.ctaText || undefined,
          destinations: section.destinations || undefined,
          features: section.features || undefined,
          stats: section.stats || undefined
        };

        await autoTranslateSection(contentId, translationData, forceRetranslate);
        result = { contentType: 'section', contentId };
        break;
      }

      case 'package': {
        // Get package data
        const pkg = await prisma.package.findUnique({
          where: { id: contentId }
        });

        if (!pkg) {
          return NextResponse.json(
            { success: false, error: 'Package not found' },
            { status: 404 }
          );
        }

        // Prepare translation data (convert null to undefined)
        const translationData = {
          title: pkg.title,
          description: pkg.description,
          longDescription: pkg.longDescription || undefined,
          destinations: pkg.destinations,
          includes: pkg.includes,
          excludes: pkg.excludes || undefined,
          highlights: pkg.highlights,
          itinerary: pkg.itinerary || undefined,
          faqs: pkg.faqs || undefined,
          groupSize: pkg.groupSize,
          difficulty: pkg.difficulty,
          bestFor: pkg.bestFor,
          departure: pkg.departure || undefined,
          return: pkg.return || undefined,
          location: pkg.location || undefined
        };

        // Trigger translation
        await autoTranslatePackage(contentId, translationData, forceRetranslate);
        result = { contentType: 'package', contentId };
        break;
      }

      case 'blog': {
        const blog = await prisma.blog.findUnique({
          where: { id: contentId }
        });

        if (!blog) {
          return NextResponse.json(
            { success: false, error: 'Blog not found' },
            { status: 404 }
          );
        }

        const translationData = {
          title: blog.title,
          excerpt: blog.excerpt,
          content: blog.content,
          category: blog.category,
          tags: blog.tags
        };

        await autoTranslateBlog(contentId, translationData, forceRetranslate);
        result = { contentType: 'blog', contentId };
        break;
      }

      case 'testimonial': {
        const testimonial = await prisma.testimonial.findUnique({
          where: { id: contentId }
        });

        if (!testimonial) {
          return NextResponse.json(
            { success: false, error: 'Testimonial not found' },
            { status: 404 }
          );
        }

        const translationData = {
          name: testimonial.name,
          role: testimonial.role,
          content: testimonial.content,
          packageName: testimonial.packageName,
          location: testimonial.location
        };

        await autoTranslateTestimonial(contentId, translationData, forceRetranslate);
        result = { contentType: 'testimonial', contentId };
        break;
      }

      case 'gallery': {
        const gallery = await prisma.galleryItem.findUnique({
          where: { id: contentId }
        });

        if (!gallery) {
          return NextResponse.json(
            { success: false, error: 'Gallery item not found' },
            { status: 404 }
          );
        }

        const translationData = {
          title: gallery.title,
          description: gallery.description || undefined,
          tags: gallery.tags
        };

        await autoTranslateGallery(contentId, translationData, forceRetranslate);
        result = { contentType: 'gallery', contentId };
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown content type: ${contentType}` },
          { status: 400 }
        );
    }

    console.log(`✅ Translation triggered successfully for ${contentType} ${contentId}`);

    return NextResponse.json({
      success: true,
      message: 'Translation triggered successfully. Processing in background.',
      data: result
    });

  } catch (error) {
    console.error('❌ Error triggering translation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to trigger translation',
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}
