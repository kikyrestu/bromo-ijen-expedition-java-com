import { NextRequest, NextResponse } from 'next/server';

// Mock data untuk bookings
const bookings = [
  {
    id: 1,
    packageId: 'bromo-sunrise-adventure',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+62 812-3456-7890',
    checkInDate: '2024-02-15',
    checkOutDate: '2024-02-17',
    adults: 2,
    children: 0,
    infants: 0,
    totalPrice: 900000,
    currency: 'IDR',
    status: 'confirmed', // 'pending', 'confirmed', 'cancelled', 'completed'
    specialRequests: 'Vegetarian meals please',
    paymentStatus: 'paid', // 'pending', 'paid', 'failed', 'refunded'
    paymentMethod: 'bank_transfer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    packageId: 'ijen-blue-fire-quest',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah@example.com',
    customerPhone: '+62 813-4567-8901',
    checkInDate: '2024-02-20',
    checkOutDate: '2024-02-21',
    adults: 1,
    children: 0,
    infants: 0,
    totalPrice: 380000,
    currency: 'IDR',
    status: 'pending',
    specialRequests: '',
    paymentStatus: 'pending',
    paymentMethod: 'credit_card',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/bookings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page');

    let filteredBookings = [...bookings];

    // Filter by status
    if (status) {
      filteredBookings = filteredBookings.filter(booking => 
        booking.status === status
      );
    }

    // Filter by payment status
    if (paymentStatus) {
      filteredBookings = filteredBookings.filter(booking => 
        booking.paymentStatus === paymentStatus
      );
    }

    // Sort by latest first
    filteredBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '10');
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedBookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredBookings.length,
        totalPages: Math.ceil(filteredBookings.length / limitNum)
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings (Create booking)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.packageId || !body.customerName || !body.customerEmail || !body.checkInDate) {
      return NextResponse.json(
        { success: false, error: 'Package ID, customer name, email, and check-in date are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.customerEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate dates
    const checkInDate = new Date(body.checkInDate);
    const checkOutDate = body.checkOutDate ? new Date(body.checkOutDate) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return NextResponse.json(
        { success: false, error: 'Check-in date cannot be in the past' },
        { status: 400 }
      );
    }

    if (checkOutDate && checkOutDate <= checkInDate) {
      return NextResponse.json(
        { success: false, error: 'Check-out date must be after check-in date' },
        { status: 400 }
      );
    }

    // Calculate total price (this would normally fetch package price from database)
    const adults = body.adults || 1;
    const children = body.children || 0;
    const infants = body.infants || 0;
    
    // Mock price calculation (in real app, fetch from package data)
    const basePrice = 450000; // This should come from package data
    const totalPrice = (adults * basePrice) + (children * basePrice * 0.7) + (infants * 0);

    const newBooking = {
      id: Date.now(),
      packageId: body.packageId,
      customerName: body.customerName,
      customerEmail: body.customerEmail.toLowerCase(),
      customerPhone: body.customerPhone || '',
      checkInDate: body.checkInDate,
      checkOutDate: body.checkOutDate || null,
      adults: adults,
      children: children,
      infants: infants,
      totalPrice: totalPrice,
      currency: 'IDR',
      status: 'pending',
      specialRequests: body.specialRequests || '',
      paymentStatus: 'pending',
      paymentMethod: body.paymentMethod || 'bank_transfer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    bookings.push(newBooking);

    // Here you would typically send confirmation email
    // await sendBookingConfirmation(newBooking);

    return NextResponse.json({
      success: true,
      data: newBooking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// PUT /api/bookings (Update booking status)
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const bookingIndex = bookings.findIndex(booking => booking.id === parseInt(id));

    if (bookingIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    bookings[bookingIndex] = {
      ...bookings[bookingIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: bookings[bookingIndex],
      message: 'Booking updated successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings (Cancel booking)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const bookingIndex = bookings.findIndex(booking => booking.id === parseInt(id));

    if (bookingIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Instead of deleting, mark as cancelled
    bookings[bookingIndex].status = 'cancelled';
    bookings[bookingIndex].updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      data: bookings[bookingIndex],
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
