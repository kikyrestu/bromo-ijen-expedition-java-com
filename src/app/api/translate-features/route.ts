import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { translationService } from '@/lib/translation-service';

export async function POST(request: NextRequest) {
  try {
    const { sectionId, language } = await request.json();

    if (!sectionId || !language) {
      return NextResponse.json(
        { success: false, error: 'SectionId and language are required' },
        { status: 400 }
      );
    }

    console.log(`🚀 Starting features translation for ${sectionId} to ${language}`);

    // Get original section content
    const sectionContent = await prisma.sectionContent.findUnique({
      where: { sectionId }
    });

    if (!sectionContent) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      );
    }

    // Parse features from database
    let features = [];
    if (sectionContent.features) {
      try {
        features = JSON.parse(sectionContent.features);
      } catch (e) {
        console.error('Error parsing features:', e);
        return NextResponse.json(
          { success: false, error: 'Invalid features format' },
          { status: 400 }
        );
      }
    }

    if (features.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No features to translate' },
        { status: 400 }
      );
    }

    // Translate features
    const translatedFeatures = [];
    for (const feature of features) {
      const translatedFeature = { ...feature };
      
      // Translate title
      if (feature.title) {
        try {
          translatedFeature.title = await translationService.translateText(
            feature.title, 
            'id', 
            language
          );
        } catch (error) {
          console.error('Error translating title:', error);
          translatedFeature.title = feature.title; // Keep original on error
        }
      }

      // Translate description
      if (feature.description) {
        try {
          translatedFeature.description = await translationService.translateText(
            feature.description, 
            'id', 
            language
          );
        } catch (error) {
          console.error('Error translating description:', error);
          translatedFeature.description = feature.description; // Keep original on error
        }
      }

      translatedFeatures.push(translatedFeature);
    }

    // Save translation to database
    await prisma.sectionContentTranslation.upsert({
      where: {
        sectionId_language: {
          sectionId,
          language
        }
      },
      update: {
        features: JSON.stringify(translatedFeatures),
        isAutoTranslated: true
      },
      create: {
        sectionId,
        language,
        features: JSON.stringify(translatedFeatures),
        isAutoTranslated: true
      }
    });

    console.log(`✅ Features translation completed for ${sectionId} to ${language}`);

    return NextResponse.json({
      success: true,
      data: {
        sectionId,
        language,
        features: translatedFeatures,
        message: `Features translated successfully to ${language}`
      }
    });

  } catch (error) {
    console.error('Error translating features:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
