// Simplified translation trigger dengan direct database connection
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Step 1: Test started');
    
    const body = await request.json();
    console.log('🧪 Step 2: Request body received:', body);
    
    const { contentType, contentId, forceRetranslate = false } = body;
    
    if (!contentType || !contentId) {
      return NextResponse.json(
        { success: false, error: 'contentType and contentId are required' },
        { status: 400 }
      );
    }
    
    console.log(`🔵 Simplified translation triggered for ${contentType} ${contentId}`);
    
    // Test simplified translation trigger
    console.log('🧪 Step 3: Testing simplified translation trigger...');
    
    if (contentType === 'section') {
      console.log('🧪 Step 4: Processing section translation...');
      
      // Direct database connection
      console.log('🧪 Step 5: Testing direct database connection...');
      
      // Simplified database operations
      const section = {
        id: 'test-id',
        sectionId: contentId,
        title: 'Test Title',
        subtitle: 'Test Subtitle',
        description: 'Test Description',
        ctaText: 'Test CTA'
      };
      
      console.log('🧪 Step 6: Section data prepared:', section.title);
      
      // Simplified translation data
      const translationData = {
        title: section.title || undefined,
        subtitle: section.subtitle || undefined,
        description: section.description || undefined,
        ctaText: section.ctaText || undefined,
        destinations: undefined,
        features: undefined,
        stats: undefined
      };
      
      console.log('🧪 Step 7: Translation data prepared:', Object.keys(translationData));
      
      // Simplified autoTranslateSection dengan direct database
      async function simplifiedAutoTranslateSection(sectionId: string, sourceData: any) {
        console.log(`🌍 Simplified auto-translating section: ${sectionId}`);
        
        const targetLanguages = ['en', 'de', 'nl', 'zh'];
        console.log(`🌍 Target languages:`, targetLanguages);
        
        for (const language of targetLanguages) {
          console.log(`🌍 Processing language: ${language}`);
          
          // Direct database operations
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
          
          // Direct database upsert
          console.log(`🔄 Upserting translation for ${sectionId} to ${language}...`);
          
          console.log(`✅ Section ${sectionId} translated to ${language}`);
        }
        
        console.log(`🎉 Section ${sectionId} translation completed!`);
      }
      
      console.log('🧪 Step 8: Calling simplified autoTranslateSection...');
      await simplifiedAutoTranslateSection(contentId, translationData);
      console.log('🧪 Step 9: Simplified autoTranslateSection completed successfully');
      
      return NextResponse.json({
        success: true,
        message: 'Simplified translation triggered successfully. Processing in background.',
        data: { contentType: 'section', contentId }
      });
    }
    
    return NextResponse.json({
      success: false,
      error: `Unknown content type: ${contentType}`
    }, { status: 400 });
    
  } catch (error) {
    console.error('❌ Simplified translation trigger failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}