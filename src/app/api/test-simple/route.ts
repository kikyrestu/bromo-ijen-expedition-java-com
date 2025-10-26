// Simplified autoTranslateSection untuk test
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Step 1: Test started');
    
    const body = await request.json();
    console.log('🧪 Step 2: Request body received:', body);
    
    // Test import prisma
    console.log('🧪 Step 3: Testing prisma import...');
    const prisma = await import('@/lib/prisma');
    console.log('🧪 Step 4: Prisma imported successfully');
    
    // Test database query
    console.log('🧪 Step 5: Testing database query...');
    const section = await prisma.default.sectionContent.findUnique({
      where: { sectionId: 'hero' }
    });
    console.log('🧪 Step 6: Database query successful:', section?.title);
    
    // Test simplified translation
    console.log('🧪 Step 7: Testing simplified translation...');
    const translationData = {
      title: section?.title || undefined,
      subtitle: section?.subtitle || undefined,
      description: section?.description || undefined,
      ctaText: section?.ctaText || undefined,
      destinations: section?.destinations || undefined,
      features: section?.features || undefined,
      stats: section?.stats || undefined
    };
    
    console.log('🧪 Step 8: Translation data prepared:', Object.keys(translationData));
    
    // Test simple translation service
    console.log('🧪 Step 9: Testing translation service import...');
    const { translationService } = await import('@/lib/translation-service');
    console.log('🧪 Step 10: Translation service imported successfully');
    
    // Test simple translation
    console.log('🧪 Step 11: Testing simple translation...');
    const translated = await translationService.translateText(
      'Hello World',
      'en',
      'id'
    );
    console.log('🧪 Step 12: Simple translation successful:', translated);
    
    return NextResponse.json({
      success: true,
      message: 'Simplified test successful',
      data: { 
        sectionTitle: section?.title,
        translated: translated
      }
    });
  } catch (error) {
    console.error('❌ Simplified test failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
