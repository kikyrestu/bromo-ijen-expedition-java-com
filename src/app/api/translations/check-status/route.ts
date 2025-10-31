import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get('sectionId');

    if (!sectionId) {
      return NextResponse.json(
        { success: false, error: 'SectionId is required' },
        { status: 400 }
      );
    }

    // Check if this specific section has translations (should be 4 languages: en, de, nl, zh)
    const count = await prisma.sectionContentTranslation.count({
      where: { 
        sectionId: sectionId  // CRITICAL: Only check THIS specific section
      }
    });

    // A section is considered "translated" if it has at least 1 translation
    // (ideally should have 4 for all languages)
    const hasTranslation = count > 0;

    console.log(`🔍 Translation Status Check: Section "${sectionId}" has ${count} translations (hasTranslation: ${hasTranslation})`);

    return NextResponse.json({
      success: true,
      hasTranslation,
      translationCount: count,
      sectionId
    });

  } catch (error) {
    console.error('Error checking translation status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check translation status' },
      { status: 500 }
    );
  }
}
