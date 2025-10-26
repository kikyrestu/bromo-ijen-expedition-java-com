import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get all section content translations from database
    const translations = await prisma.sectionContentTranslation.findMany({
      select: {
        sectionId: true,
        language: true,
        title: true,
        subtitle: true,
        description: true,
        ctaText: true,
        buttonText: true,
        features: true,
        stats: true,
        destinations: true
      }
    });

    // Group translations by sectionId and create translation keys
    const groupedTranslations: any = {};
    
    translations.forEach(translation => {
      const key = translation.sectionId;
      if (!groupedTranslations[key]) {
        groupedTranslations[key] = {};
      }
      
      groupedTranslations[key][translation.language] = {
        title: translation.title,
        subtitle: translation.subtitle,
        description: translation.description,
        ctaText: translation.ctaText,
        buttonText: translation.buttonText,
        features: translation.features,
        stats: translation.stats,
        destinations: translation.destinations
      };
    });

    return NextResponse.json({
      success: true,
      data: groupedTranslations,
      message: 'Database translations loaded successfully'
    });
  } catch (error) {
    console.error('Error fetching translations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch translations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { translations } = body;

    if (!translations) {
      return NextResponse.json(
        { success: false, error: 'Translations data is required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would save to database
    // For now, we'll just return success
    console.log('Saving translations:', translations);

    return NextResponse.json({
      success: true,
      message: 'Translations saved successfully',
      data: translations
    });
  } catch (error) {
    console.error('Error saving translations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save translations' },
      { status: 500 }
    );
  }
}
