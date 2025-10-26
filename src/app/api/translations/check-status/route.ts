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

    // Use Prisma for better connection pooling
    const count = await prisma.sectionContentTranslation.count({
      where: { sectionId }
    });

    const hasTranslation = count > 0;

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
