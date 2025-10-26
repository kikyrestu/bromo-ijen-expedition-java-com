// Minimal test untuk cek apakah masalahnya di import atau function call
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Minimal test started');
    
    const body = await request.json();
    console.log('🧪 Request body received:', body);
    
    return NextResponse.json({
      success: true,
      message: 'Minimal test successful',
      data: body
    });
  } catch (error) {
    console.error('❌ Minimal test failed:', error);
    return NextResponse.json(
      { success: false, error: 'Minimal test failed' },
      { status: 500 }
    );
  }
}
