import { NextRequest, NextResponse } from 'next/server';

// Mock data untuk individual package
const packageData = {
  'bromo-sunrise-adventure': {
    id: 'bromo-sunrise-adventure',
    title: 'Bromo Sunrise Adventure',
    price: 450000,
    originalPrice: 550000,
    currency: 'IDR',
    duration: '3 Days',
    difficulty: 'Easy',
    category: 'Adventure Tour',
    location: 'Bromo Tengger, East Java',
    rating: 4.9,
    reviewCount: 1200,
    description: '3 hari perjalanan sunrise Bromo, trekking ke kawah aktif, dan menjelajahi budaya Tengger yang unik.',
    highlights: [
      'Sunrise view dari Penanjakan',
      'Trekking ke kawah Bromo',
      'Kunjungan ke desa Tengger',
      'Transportasi jeep 4WD',
      'Guide berpengalaman',
      'Makan 3x sehari'
    ],
    includes: [
      'Transportasi dari Surabaya',
      'Jeep 4WD untuk Bromo',
      'Guide profesional',
      'Makan 3x sehari',
      'Penginapan 2 malam',
      'Tiket masuk TNBTS'
    ],
    excludes: [
      'Tiket pesawat',
      'Asuransi perjalanan',
      'Tips untuk guide',
      'Pengeluaran pribadi'
    ],
    itinerary: [
      {
        day: 1,
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
    reviews: [
      {
        name: 'Sarah Johnson',
        date: '2024-01-15',
        rating: 5,
        comment: 'Amazing experience! The sunrise was absolutely breathtaking. Our guide was very knowledgeable and helpful.'
      },
      {
        name: 'Michael Chen',
        date: '2024-01-10',
        rating: 5,
        comment: 'Perfect tour! Everything was well organized and the views were incredible. Highly recommended!'
      },
      {
        name: 'Emily Rodriguez',
        date: '2024-01-05',
        rating: 4,
        comment: 'Great tour overall. The sunrise was beautiful, though it was quite cold. Make sure to bring warm clothes!'
      }
    ],
    images: [
      '/api/placeholder/800/600',
      '/api/placeholder/800/600',
      '/api/placeholder/800/600',
      '/api/placeholder/800/600',
      '/api/placeholder/800/600'
    ],
    featured: true,
    available: true,
    minParticipants: 2,
    maxParticipants: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  'ijen-blue-fire-quest': {
    id: 'ijen-blue-fire-quest',
    title: 'Ijen Blue Fire Quest',
    price: 380000,
    originalPrice: 450000,
    currency: 'IDR',
    duration: '2 Days',
    difficulty: 'Moderate',
    category: 'Adventure Tour',
    location: 'Banyuwangi, East Java',
    rating: 4.8,
    reviewCount: 980,
    description: 'Petualangan malam ke Kawah Ijen untuk menyaksikan blue fire dan danau asam terbesar di dunia.',
    highlights: [
      'Blue fire phenomenon',
      'Danau asam terbesar dunia',
      'Night trekking experience',
      'Gas mask provided',
      'Professional guide',
      'Transportation included'
    ],
    includes: [
      'Transportasi dari Surabaya',
      'Gas mask untuk keamanan',
      'Guide berpengalaman',
      'Makan 2x sehari',
      'Penginapan 1 malam',
      'Tiket masuk Ijen'
    ],
    excludes: [
      'Tiket pesawat',
      'Asuransi perjalanan',
      'Tips untuk guide',
      'Pengeluaran pribadi'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Surabaya - Banyuwangi',
        activities: [
          'Penjemputan di Surabaya',
          'Perjalanan ke Banyuwangi',
          'Check-in hotel',
          'Briefing program'
        ],
        meals: ['Lunch', 'Dinner'],
        accommodation: 'Hotel di Banyuwangi'
      },
      {
        day: 2,
        title: 'Ijen Blue Fire - Surabaya',
        activities: [
          'Wake up call 00:30',
          'Perjalanan ke basecamp Ijen',
          'Night trekking ke kawah',
          'Blue fire viewing',
          'Sunrise di kawah rim',
          'Perjalanan kembali ke Surabaya'
        ],
        meals: ['Breakfast', 'Lunch'],
        accommodation: '-'
      }
    ],
    reviews: [
      {
        name: 'David Kim',
        date: '2024-01-12',
        rating: 5,
        comment: 'Incredible experience! The blue fire was mesmerizing. The night trek was challenging but worth it.'
      },
      {
        name: 'Lisa Wang',
        date: '2024-01-08',
        rating: 4,
        comment: 'Amazing natural phenomenon. The guide was very helpful and the gas masks were essential.'
      }
    ],
    images: [
      '/api/placeholder/800/600',
      '/api/placeholder/800/600',
      '/api/placeholder/800/600',
      '/api/placeholder/800/600'
    ],
    featured: true,
    available: true,
    minParticipants: 2,
    maxParticipants: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

// GET /api/packages/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const packageId = resolvedParams.id;
    
    const packageInfo = packageData[packageId as keyof typeof packageData];
    
    if (!packageInfo) {
      return NextResponse.json(
        { success: false, error: 'Package not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: packageInfo
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch package' },
      { status: 500 }
    );
  }
}

// PUT /api/packages/[id] (Update package)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const packageId = resolvedParams.id;
    const body = await request.json();
    
    const packageInfo = packageData[packageId as keyof typeof packageData];
    
    if (!packageInfo) {
      return NextResponse.json(
        { success: false, error: 'Package not found' },
        { status: 404 }
      );
    }

    // Update package data
    Object.assign(packageInfo, body, {
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: packageInfo,
      message: 'Package updated successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update package' },
      { status: 500 }
    );
  }
}

// DELETE /api/packages/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const packageId = resolvedParams.id;
    
    const packageInfo = packageData[packageId as keyof typeof packageData];
    
    if (!packageInfo) {
      return NextResponse.json(
        { success: false, error: 'Package not found' },
        { status: 404 }
      );
    }

    // Delete package
    delete packageData[packageId as keyof typeof packageData];

    return NextResponse.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete package' },
      { status: 500 }
    );
  }
}
