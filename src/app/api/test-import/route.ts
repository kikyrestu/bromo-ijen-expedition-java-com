// Test dengan import autoTranslateSection
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
    
    // Test import autoTranslateSection
    console.log('🧪 Step 5: Testing autoTranslateSection import...');
    const { autoTranslateSection } = await import('@/lib/auto-translate');
    console.log('🧪 Step 6: autoTranslateSection imported successfully');
    
    // Test database query
    console.log('🧪 Step 7: Testing database query...');
    const section = await prisma.default.sectionContent.findUnique({
      where: { sectionId: 'hero' }
    });
    console.log('🧪 Step 8: Database query successful:', section?.title);
    
    return NextResponse.json({
      success: true,
      message: 'Import test successful',
      data: { sectionTitle: section?.title }
    });
  } catch (error) {
    console.error('❌ Import test failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
