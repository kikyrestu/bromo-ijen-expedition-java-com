import { NextRequest, NextResponse } from 'next/server';

// Mock data untuk individual booking
const bookingData = {
  'booking-123': {
    id: 'booking-123',
    packageId: 'bromo-sunrise-adventure',
    packageName: 'Bromo Sunrise Adventure',
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
    status: 'confirmed',
    specialRequests: 'Vegetarian meals please',
    paymentStatus: 'paid',
    paymentMethod: 'bank_transfer',
    paymentReference: 'TXN-123456789',
    bookingReference: 'BR-2024-001',
    itinerary: [
      {
        day: 1,
        date: '2024-02-15',
        title: 'Surabaya - Probolinggo - Cemoro Lawang',
        activities: [
          'Penjemputan di Surabaya',
          'Perjalanan ke Probolinggo',
          'Check-in hotel di Cemoro Lawang',
          'Briefing program'
        ],
        meals: ['Lunch', 'Dinner'],
        accommodation: 'Hotel di Cemoro Lawang'
      },
      {
        day: 2,
        date: '2024-02-16',
        title: 'Sunrise Bromo - Kawah Bromo',
        activities: [
          'Wake up call 03:00',
          'Jeep ke Penanjakan',
          'Sunrise viewing',
          'Trekking ke kawah Bromo',
          'Kunjungan desa Tengger'
        ],
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        accommodation: 'Hotel di Cemoro Lawang'
      },
      {
        day: 3,
        date: '2024-02-17',
        title: 'Cemoro Lawang - Surabaya',
        activities: [
          'Breakfast di hotel',
          'Perjalanan kembali ke Surabaya',
          'Drop off di Surabaya'
        ],
        meals: ['Breakfast'],
        accommodation: '-'
      }
    ],
    contactInfo: {
      guideName: 'Ahmad Susanto',
      guidePhone: '+62 812-9876-5432',
      emergencyContact: '+62 813-1234-5678',
      officeAddress: 'Jl. Raya Bromo No. 123, Probolinggo, East Java'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

// GET /api/bookings/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const bookingId = resolvedParams.id;
    
    const booking = bookingData[bookingId as keyof typeof bookingData];
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[id] (Update booking)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const bookingId = resolvedParams.id;
    const body = await request.json();
    
    const booking = bookingData[bookingId as keyof typeof bookingData];
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update booking data
    Object.assign(booking, body, {
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: booking,
      message: 'Booking updated successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[id] (Cancel booking)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const bookingId = resolvedParams.id;
    
    const booking = bookingData[bookingId as keyof typeof bookingData];
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Mark as cancelled instead of deleting
    booking.status = 'cancelled';
    booking.updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      data: booking,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
