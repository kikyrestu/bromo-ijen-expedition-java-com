import { NextRequest, NextResponse } from 'next/server';

// Mock data untuk contact messages
const contactMessages = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+62 812-3456-7890',
    subject: 'Bromo Ijen Tour Inquiry',
    message: 'Hi, I would like to know more about your Bromo Ijen tour packages. Can you provide more details about the itinerary and pricing?',
    status: 'new', // 'new', 'read', 'replied', 'closed'
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+62 813-4567-8901',
    subject: 'Custom Package Request',
    message: 'We are a group of 8 people interested in a custom Bromo Ijen tour. Can you create a special package for us?',
    status: 'read',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/contact
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page');

    let filteredMessages = [...contactMessages];

    // Filter by status
    if (status) {
      filteredMessages = filteredMessages.filter(message => 
        message.status === status
      );
    }

    // Sort by latest first
    filteredMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '10');
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedMessages = filteredMessages.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedMessages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredMessages.length,
        totalPages: Math.ceil(filteredMessages.length / limitNum)
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contact messages' },
      { status: 500 }
    );
  }
}

// POST /api/contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required' },
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

    const newMessage = {
      id: Date.now(),
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      subject: body.subject || 'General Inquiry',
      message: body.message,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    contactMessages.push(newMessage);

    // Here you would typically send an email notification
    // await sendEmailNotification(newMessage);

    return NextResponse.json({
      success: true,
      data: newMessage,
      message: 'Contact message sent successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to send contact message' },
      { status: 500 }
    );
  }
}

// PUT /api/contact (for updating message status)
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const messageIndex = contactMessages.findIndex(message => message.id === parseInt(id));

    if (messageIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    contactMessages[messageIndex] = {
      ...contactMessages[messageIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: contactMessages[messageIndex],
      message: 'Message updated successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update message' },
      { status: 500 }
    );
  }
}

// DELETE /api/contact
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const messageIndex = contactMessages.findIndex(message => message.id === parseInt(id));

    if (messageIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    contactMessages.splice(messageIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
