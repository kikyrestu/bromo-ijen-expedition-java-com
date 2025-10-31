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
  let contentType = '';
  let contentId = '';
  
  try {
    const body = await request.json();
    contentType = body.contentType;
    contentId = body.contentId;
    const forceRetranslate = body.forceRetranslate || false;

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

        // Helper: safely parse JSON string fields from database
        const safeParse = (value: string | null | undefined) => {
          if (!value || typeof value !== 'string') return undefined;
          try {
            return JSON.parse(value);
          } catch (e) {
            return undefined;
          }
        };

        // Prepare translation data - include ALL translatable text fields
        // CRITICAL: Parse JSON strings from database to objects before translation!
        const translationData = {
          title: section.title || undefined,
          subtitle: section.subtitle || undefined,
          description: section.description || undefined,
          ctaText: section.ctaText || undefined,
          buttonText: section.buttonText || undefined,
          phone: section.phone || undefined,
          email: section.email || undefined,
          destinations: safeParse(section.destinations),  // Parse JSON string to array
          features: safeParse(section.features),          // Parse JSON string to array
          stats: safeParse(section.stats),                // Parse JSON string to array
          packages: safeParse(section.packages),          // Parse JSON string to array
          testimonials: safeParse(section.testimonials),  // Parse JSON string to array
          posts: safeParse(section.posts),                // Parse JSON string to array
          items: safeParse(section.items),                // Parse JSON string to array
          categories: safeParse(section.categories)       // Parse JSON string to array
          // NOTE: Excluding non-translatable fields:
          // - image, logo, backgroundVideo (URLs)
          // - ctaLink (URL)
          // - displayCount, featuredOnly, category, sortBy, layoutStyle (settings)
          // - showFilters, enableLightbox, enableAutoSlide, etc. (boolean settings)
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

        // Helper to safely parse JSON fields
        const safeParse = (value: string | null): any => {
          if (!value) return undefined;
          try {
            return JSON.parse(value);
          } catch {
            return undefined;
          }
        };

        // Prepare translation data (convert null to undefined and parse JSON strings)
        const translationData = {
          title: pkg.title,
          description: pkg.description,
          longDescription: pkg.longDescription || undefined,
          destinations: safeParse(pkg.destinations),
          includes: safeParse(pkg.includes),
          excludes: safeParse(pkg.excludes),
          highlights: safeParse(pkg.highlights),
          itinerary: safeParse(pkg.itinerary),
          faqs: safeParse(pkg.faqs),
          groupSize: pkg.groupSize,
          difficulty: pkg.difficulty,
          bestFor: pkg.bestFor,
          departure: pkg.departure || undefined,
          return: pkg.return || undefined,
          location: pkg.location || undefined
        };

        console.log('📦 Translation data prepared:', {
          title: translationData.title,
          highlights: Array.isArray(translationData.highlights) ? `${translationData.highlights.length} items` : 'NOT ARRAY',
          includes: Array.isArray(translationData.includes) ? `${translationData.includes.length} items` : 'NOT ARRAY'
        });

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
      data: result,
      logs: [
        { type: 'success', message: `Translation initiated for ${contentType}: ${contentId}`, timestamp: new Date().toISOString() },
        { type: 'info', message: `Translating to 4 languages: EN, DE, NL, ZH`, timestamp: new Date().toISOString() },
        { type: 'info', message: `Force retranslate: ${forceRetranslate}`, timestamp: new Date().toISOString() },
        { type: 'success', message: `Check Translation Manager in ~30 seconds for results`, timestamp: new Date().toISOString() }
      ]
    });

  } catch (error) {
    console.error('❌ Error triggering translation:', error);
    
    const errorMessage = (error as Error).message;
    const isTimeout = errorMessage.includes('timeout');
    const isNotFound = errorMessage.includes('not found');
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to trigger translation',
        details: errorMessage,
        logs: [
          { type: 'error', message: `Translation failed for ${contentType}: ${contentId}`, timestamp: new Date().toISOString() },
          { type: 'error', message: errorMessage, timestamp: new Date().toISOString() },
          { 
            type: 'warning', 
            message: isTimeout ? 'Database connection timeout - try again' : 
                     isNotFound ? 'Content not found in database' : 
                     'Check console for detailed error', 
            timestamp: new Date().toISOString() 
          }
        ]
      },
      { status: 500 }
    );
  }
}
