import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        authenticated: false
      }, { status: 401 });
    }

    // Find session
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            firstName: true,
            lastName: true,
            role: true,
            status: true,
            avatar: true,
            lastLoginAt: true
          }
        }
      }
    });

    if (!session) {
      cookieStore.delete('session_token');
      return NextResponse.json({
        success: false,
        authenticated: false,
        error: 'Invalid session'
      }, { status: 401 });
    }

    // Check if session expired
    if (session.expiresAt < new Date()) {
      await prisma.session.delete({
        where: { id: session.id }
      });
      cookieStore.delete('session_token');
      return NextResponse.json({
        success: false,
        authenticated: false,
        error: 'Session expired'
      }, { status: 401 });
    }

    // Check if user is still active
    if (session.user.status !== 'active') {
      await prisma.session.delete({
        where: { id: session.id }
      });
      cookieStore.delete('session_token');
      return NextResponse.json({
        success: false,
        authenticated: false,
        error: 'Account inactive'
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: session.user
    });
  } catch (error) {
    console.error('[Auth Session] Error:', error);
    return NextResponse.json({
      success: false,
      authenticated: false,
      error: 'Session check failed'
    }, { status: 500 });
  }
}

