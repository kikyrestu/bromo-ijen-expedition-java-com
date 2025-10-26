import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('contentType');
    const contentId = searchParams.get('contentId');

    if (!contentType || !contentId) {
      return NextResponse.json(
        { success: false, error: 'Missing contentType or contentId parameter' },
        { status: 400 }
      );
    }

    console.log(`🔍 Checking translation status for ${contentType}:${contentId}`);

    const supportedLanguages = ['id', 'en', 'de', 'nl', 'zh'];
    const status: Record<string, any> = {};

    // Check translation status for each language
    for (const language of supportedLanguages) {
      try {
        let exists = false;
        let lastUpdated = null;
        let isAutoTranslated = false;

        switch (contentType) {
          case 'section': {
            // For Indonesian (source language), check if original content exists
            if (language === 'id') {
              const originalContent = await prisma.sectionContent.findUnique({
                where: { sectionId: contentId }
              });
              exists = !!originalContent;
              lastUpdated = originalContent?.updatedAt;
              isAutoTranslated = false; // Source language is not auto-translated
            } else {
              const translation = await prisma.sectionContentTranslation.findUnique({
                where: {
                  sectionId_language: {
                    sectionId: contentId,
                    language
                  }
                }
              });
              exists = !!translation;
              lastUpdated = translation?.updatedAt;
              isAutoTranslated = translation?.isAutoTranslated || false;
            }
            break;
          }
          case 'package': {
            // For Indonesian (source language), check if original content exists
            if (language === 'id') {
              const originalContent = await prisma.package.findUnique({
                where: { id: contentId }
              });
              exists = !!originalContent;
              lastUpdated = originalContent?.updatedAt;
              isAutoTranslated = false; // Source language is not auto-translated
            } else {
              const translation = await prisma.packageTranslation.findUnique({
                where: {
                  packageId_language: {
                    packageId: contentId,
                    language
                  }
                }
              });
              exists = !!translation;
              lastUpdated = translation?.updatedAt;
              isAutoTranslated = translation?.isAutoTranslated || false;
            }
            break;
          }
          case 'blog': {
            // For Indonesian (source language), check if original content exists
            if (language === 'id') {
              const originalContent = await prisma.blog.findUnique({
                where: { id: contentId }
              });
              exists = !!originalContent;
              lastUpdated = originalContent?.updatedAt;
              isAutoTranslated = false;
            } else {
              const translation = await prisma.blogTranslation.findUnique({
                where: {
                  blogId_language: {
                    blogId: contentId,
                    language
                  }
                }
              });
              exists = !!translation;
              lastUpdated = translation?.updatedAt;
              isAutoTranslated = translation?.isAutoTranslated || false;
            }
            break;
          }
          case 'testimonial': {
            // For Indonesian (source language), check if original content exists
            if (language === 'id') {
              const originalContent = await prisma.testimonial.findUnique({
                where: { id: contentId }
              });
              exists = !!originalContent;
              lastUpdated = originalContent?.updatedAt;
              isAutoTranslated = false;
            } else {
              const translation = await prisma.testimonialTranslation.findUnique({
                where: {
                  testimonialId_language: {
                    testimonialId: contentId,
                    language
                  }
                }
              });
              exists = !!translation;
              lastUpdated = translation?.updatedAt;
              isAutoTranslated = translation?.isAutoTranslated || false;
            }
            break;
          }
          case 'gallery': {
            // For Indonesian (source language), check if original content exists
            if (language === 'id') {
              const originalContent = await prisma.galleryItem.findUnique({
                where: { id: contentId }
              });
              exists = !!originalContent;
              lastUpdated = originalContent?.updatedAt;
              isAutoTranslated = false;
            } else {
              const translation = await prisma.galleryTranslation.findUnique({
                where: {
                  galleryId_language: {
                    galleryId: contentId,
                    language
                  }
                }
              });
              exists = !!translation;
              lastUpdated = translation?.updatedAt;
              isAutoTranslated = translation?.isAutoTranslated || false;
            }
            break;
          }
          default:
            console.warn(`Unknown content type: ${contentType}`);
        }

        status[language] = {
          exists,
          lastUpdated,
          isAutoTranslated,
          language
        };

        console.log(`📊 ${language}: ${exists ? 'EXISTS' : 'MISSING'} (auto: ${isAutoTranslated})`);
      } catch (error) {
        console.error(`Error checking ${language} translation:`, error);
        status[language] = {
          exists: false,
          error: (error as Error).message,
          language
        };
      }
    }

    console.log(`✅ Translation status check completed for ${contentType}:${contentId}`);

    return NextResponse.json({
      success: true,
      status,
      contentType,
      contentId,
      checkedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Translation status check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check translation status',
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}
