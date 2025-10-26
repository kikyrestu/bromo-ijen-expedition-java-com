import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get('blogId');

    if (!blogId) {
      return NextResponse.json(
        { success: false, error: 'BlogId is required' },
        { status: 400 }
      );
    }

    // Direct database connection
    const connection = await mysql.createConnection(process.env.DATABASE_URL || '');

    // Check if translations exist for this blog
    const [rows] = await connection.execute(
      'SELECT COUNT(*) as count FROM blog_translations WHERE blogId = ?',
      [blogId]
    );

    await connection.end();

    const count = (rows as any[])[0]?.count || 0;
    const hasTranslation = count > 0;

    return NextResponse.json({
      success: true,
      hasTranslation,
      translationCount: count,
      blogId
    });

  } catch (error) {
    console.error('Error checking blog translation status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check blog translation status' },
      { status: 500 }
    );
  }
}
