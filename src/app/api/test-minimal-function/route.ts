// Minimal autoTranslateSection untuk test
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
    
    // Test minimal autoTranslateSection
    console.log('🧪 Step 7: Testing minimal autoTranslateSection...');
    
    // Minimal translation function
    async function minimalAutoTranslateSection(sectionId: string, sourceData: any) {
      console.log(`🌍 Minimal auto-translating section: ${sectionId}`);
      console.log(`🌍 Source data keys:`, Object.keys(sourceData));
      
      const targetLanguages = ['en', 'de', 'nl', 'zh'];
      console.log(`🌍 Target languages:`, targetLanguages);
      
      for (const language of targetLanguages) {
        console.log(`🌍 Processing language: ${language}`);
        
        // Check if translation already exists
        const existing = await prisma.default.sectionContentTranslation.findUnique({
          where: {
            sectionId_language: {
              sectionId,
              language
            }
          }
        });
        
        if (existing) {
          console.log(`⏭️  Translation for section ${sectionId} in ${language} already exists, skipping...`);
          continue;
        }
        
        console.log(`🔄 Translating section ${sectionId} to ${language}...`);
        
        // Simple translation data
        const translatedData = {
          sectionId,
          language,
          title: sourceData.title || undefined,
          subtitle: sourceData.subtitle || undefined,
          description: sourceData.description || undefined,
          ctaText: sourceData.ctaText || undefined,
          isAutoTranslated: true
        };
        
        // Upsert translation
        await prisma.default.sectionContentTranslation.upsert({
          where: {
            sectionId_language: {
              sectionId,
              language
            }
          },
          update: translatedData,
          create: translatedData
        });
        
        console.log(`✅ Section ${sectionId} translated to ${language}`);
      }
      
      console.log(`🎉 Section ${sectionId} translation completed!`);
    }
    
    const translationData = {
      title: section?.title || undefined,
      subtitle: section?.subtitle || undefined,
      description: section?.description || undefined,
      ctaText: section?.ctaText || undefined,
      destinations: section?.destinations || undefined,
      features: section?.features || undefined,
      stats: section?.stats || undefined
    };
    
    console.log('🧪 Step 8: Calling minimal autoTranslateSection...');
    await minimalAutoTranslateSection('hero', translationData);
    console.log('🧪 Step 9: Minimal autoTranslateSection completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Minimal test successful',
      data: { sectionTitle: section?.title }
    });
  } catch (error) {
    console.error('❌ Minimal test failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
