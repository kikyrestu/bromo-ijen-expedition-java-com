import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Navigation API is available',
      endpoints: [
        '/api/navigation/menus',
        '/api/navigation/items'
      ],
      supportedLocations: ['header', 'footer', 'mobile']
    });
  } catch (error) {
    console.error('Navigation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch navigation data' },
      { status: 500 }
    );
  }
}
