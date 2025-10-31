import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, ROLES, userCan } from '@/lib/auth';
import { cookies } from 'next/headers';

// Helper to get current user from session
async function getCurrentUser(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  
  if (!token) {
    return null;
  }
  
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true }
  });
  
  if (!session || session.expiresAt < new Date()) {
    return null;
  }
  
  return session.user;
}

// GET - Get all users
export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }
    
    // Check permission
    if (!userCan(currentUser.role as any, 'manage_users')) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions'
      }, { status: 403 });
    }
    
    // Get query params
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    // Build where clause
    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { username: { contains: search } },
        { email: { contains: search } },
        { displayName: { contains: search } }
      ];
    }
    
    const users = await prisma.user.findMany({
      where,
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
        lastLoginAt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({
      success: true,
      users
    });
  } catch (error: any) {
    console.error('[Users GET] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch users'
    }, { status: 500 });
  }
}

// POST - Create new user
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }
    
    // Check permission
    if (!userCan(currentUser.role as any, 'create_users')) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions'
      }, { status: 403 });
    }
    
    const body = await request.json();
    const { username, email, password, displayName, firstName, lastName, role, status } = body;
    
    // Validate required fields
    if (!username || !email || !password || !displayName) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }
    
    // Check if username or email already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });
    
    if (existing) {
      return NextResponse.json({
        success: false,
        error: existing.username === username ? 'Username already exists' : 'Email already exists'
      }, { status: 409 });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        displayName,
        firstName: firstName || '',
        lastName: lastName || '',
        role: role || ROLES.SUBSCRIBER,
        status: status || 'active'
      },
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
        createdAt: true
      }
    });
    
    return NextResponse.json({
      success: true,
      user
    });
  } catch (error: any) {
    console.error('[Users POST] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create user'
    }, { status: 500 });
  }
}

// PUT - Update user
export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }
    
    const body = await request.json();
    const { id, username, email, password, displayName, firstName, lastName, role, status } = body;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'User ID required'
      }, { status: 400 });
    }
    
    // Check permission (users can edit their own profile, or need manage_users permission)
    const isOwnProfile = currentUser.id === id;
    if (!isOwnProfile && !userCan(currentUser.role as any, 'edit_users')) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions'
      }, { status: 403 });
    }
    
    // Prepare update data
    const updateData: any = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (displayName) updateData.displayName = displayName;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    
    // Only admins can change role and status
    if (userCan(currentUser.role as any, 'manage_users')) {
      if (role) updateData.role = role;
      if (status) updateData.status = status;
    }
    
    // Hash password if provided
    if (password) {
      updateData.password = await hashPassword(password);
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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
        createdAt: true
      }
    });
    
    return NextResponse.json({
      success: true,
      user
    });
  } catch (error: any) {
    console.error('[Users PUT] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.code === 'P2002' ? 'Username or email already exists' : 'Failed to update user'
    }, { status: 500 });
  }
}

// DELETE - Delete user
export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }
    
    // Check permission
    if (!userCan(currentUser.role as any, 'delete_users')) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions'
      }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'User ID required'
      }, { status: 400 });
    }
    
    // Prevent deleting own account
    if (currentUser.id === id) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete your own account'
      }, { status: 400 });
    }
    
    await prisma.user.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    console.error('[Users DELETE] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete user'
    }, { status: 500 });
  }
}

