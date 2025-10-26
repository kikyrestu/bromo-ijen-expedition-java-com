import { NextRequest, NextResponse } from 'next/server';

// Subscriber interface
interface Subscriber {
  id: number;
  email: string;
  name: string;
  status: 'active' | 'unsubscribed' | 'pending';
  subscribedAt: string;
  unsubscribedAt: string | null;
  preferences: {
    travelTips: boolean;
    promotions: boolean;
    blogUpdates: boolean;
    packageUpdates: boolean;
  };
}

// Mock data untuk newsletter subscribers
const subscribers: Subscriber[] = [
  {
    id: 1,
    email: 'john@example.com',
    name: 'John Doe',
    status: 'active', // 'active', 'unsubscribed', 'pending'
    subscribedAt: new Date().toISOString(),
    unsubscribedAt: null,
    preferences: {
      travelTips: true,
      promotions: true,
      blogUpdates: true,
      packageUpdates: false
    }
  },
  {
    id: 2,
    email: 'sarah@example.com',
    name: 'Sarah Johnson',
    status: 'active',
    subscribedAt: new Date().toISOString(),
    unsubscribedAt: null,
    preferences: {
      travelTips: true,
      promotions: false,
      blogUpdates: true,
      packageUpdates: true
    }
  }
];

// GET /api/newsletter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page');

    let filteredSubscribers = [...subscribers];

    // Filter by status
    if (status) {
      filteredSubscribers = filteredSubscribers.filter(subscriber => 
        subscriber.status === status
      );
    }

    // Sort by latest first
    filteredSubscribers.sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime());

    // Pagination
    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '10');
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedSubscribers = filteredSubscribers.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedSubscribers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredSubscribers.length,
        totalPages: Math.ceil(filteredSubscribers.length / limitNum)
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}

// POST /api/newsletter (Subscribe)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSubscriber = subscribers.find(subscriber => 
      subscriber.email.toLowerCase() === body.email.toLowerCase()
    );

    if (existingSubscriber) {
      if (existingSubscriber.status === 'active') {
        return NextResponse.json(
          { success: false, error: 'Email is already subscribed' },
          { status: 409 }
        );
      } else {
        // Reactivate subscription
        existingSubscriber.status = 'active';
        existingSubscriber.subscribedAt = new Date().toISOString();
        existingSubscriber.unsubscribedAt = null;
        
        return NextResponse.json({
          success: true,
          data: existingSubscriber,
          message: 'Subscription reactivated successfully'
        });
      }
    }

    const newSubscriber: Subscriber = {
      id: Date.now(),
      email: body.email.toLowerCase(),
      name: body.name || '',
      status: 'active' as const,
      subscribedAt: new Date().toISOString(),
      unsubscribedAt: null,
      preferences: {
        travelTips: body.preferences?.travelTips ?? true,
        promotions: body.preferences?.promotions ?? true,
        blogUpdates: body.preferences?.blogUpdates ?? true,
        packageUpdates: body.preferences?.packageUpdates ?? false
      }
    };

    subscribers.push(newSubscriber);

    // Here you would typically send a welcome email
    // await sendWelcomeEmail(newSubscriber);

    return NextResponse.json({
      success: true,
      data: newSubscriber,
      message: 'Successfully subscribed to newsletter'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}

// PUT /api/newsletter (Update preferences or unsubscribe)
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const action = searchParams.get('action'); // 'update', 'unsubscribe'
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const subscriberIndex = subscribers.findIndex(subscriber => 
      subscriber.email.toLowerCase() === email.toLowerCase()
    );

    if (subscriberIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    if (action === 'unsubscribe') {
      subscribers[subscriberIndex].status = 'unsubscribed';
      subscribers[subscriberIndex].unsubscribedAt = new Date().toISOString();
      
      return NextResponse.json({
        success: true,
        data: subscribers[subscriberIndex],
        message: 'Successfully unsubscribed from newsletter'
      });
    } else {
      // Update preferences
      subscribers[subscriberIndex].preferences = {
        ...subscribers[subscriberIndex].preferences,
        ...body.preferences
      };
      
      return NextResponse.json({
        success: true,
        data: subscribers[subscriberIndex],
        message: 'Preferences updated successfully'
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

// DELETE /api/newsletter (Permanent delete)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const subscriberIndex = subscribers.findIndex(subscriber => 
      subscriber.email.toLowerCase() === email.toLowerCase()
    );

    if (subscriberIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    subscribers.splice(subscriberIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Subscriber permanently deleted'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete subscriber' },
      { status: 500 }
    );
  }
}
