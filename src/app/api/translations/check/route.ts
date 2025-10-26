/**
 * Translation Coverage Check API
 * 
 * Endpoint untuk check apakah semua content sudah ditranslate dengan lengkap
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  checkAllTranslations,
  checkPackageTranslations,
  checkBlogTranslations,
  checkTestimonialTranslations,
  checkGalleryTranslations,
  getItemsNeedingTranslation
} from '@/lib/translation-checker';

// GET /api/translations/check
// Query params:
// - section: 'all' | 'packages' | 'blogs' | 'testimonials' | 'gallery'
// - onlyMissing: 'true' | 'false' (default: false)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') || 'all';
    const onlyMissing = searchParams.get('onlyMissing') === 'true';

    console.log(`🔍 Checking translations for section: ${section}`);

    let result;

    if (onlyMissing) {
      // Return only items that need translation
      result = await getItemsNeedingTranslation();
      
      return NextResponse.json({
        success: true,
        data: result,
        message: 'Items needing translation retrieved'
      });
    }

    // Check specific section or all
    switch (section) {
      case 'packages':
        result = await checkPackageTranslations();
        break;
      
      case 'blogs':
        result = await checkBlogTranslations();
        break;
      
      case 'testimonials':
        result = await checkTestimonialTranslations();
        break;
      
      case 'gallery':
        result = await checkGalleryTranslations();
        break;
      
      case 'all':
      default:
        result = await checkAllTranslations();
        break;
    }

    console.log(`✅ Translation check completed for ${section}`);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Translation coverage for ${section} retrieved`
    });

  } catch (error) {
    console.error('❌ Error checking translations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check translations',
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}
