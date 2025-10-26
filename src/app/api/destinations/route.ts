import { NextRequest, NextResponse } from 'next/server';

// Mock data untuk destinations
const destinations = [
  {
    id: 1,
    name: "Raja Ampat",
    location: "Papua Barat",
    category: "beach",
    rating: 4.9,
    visitors: "2.5K",
    duration: "5 Days",
    price: "Rp 8.500.000",
    description: "Surga bawah laut dengan keindahan terumbu karang yang menakjubkan dan biota laut yang beragam.",
    highlights: ["Diving", "Snorkeling", "Island Hopping", "Sunset Cruise"],
    image: "/destinations/raja-ampat.jpg"
  },
  {
    id: 2,
    name: "Bromo Tengger",
    location: "Jawa Timur",
    category: "mountain",
    rating: 4.8,
    visitors: "3.2K",
    duration: "3 Days",
    price: "Rp 2.500.000",
    description: "Pemandangan sunrise yang spektakuler di kawasan gunung berapi aktif dengan panorama yang memukau.",
    highlights: ["Sunrise View", "Hiking", "Camping", "Photography"],
    image: "/destinations/bromo.jpg"
  }
];

// Mock data untuk packages
const packages = [
  {
    id: 1,
    name: "Bali Paradise",
    duration: "5 Days 4 Nights",
    price: "Rp 4.500.000",
    originalPrice: "Rp 5.200.000",
    discount: "13%",
    rating: 4.9,
    reviews: 128,
    category: "Popular",
    description: "Jelajahi keindahan Bali dengan paket lengkap yang mencakup pantai, budaya, dan kuliner terbaik.",
    destinations: ["Ubud", "Seminyak", "Uluwatu", "Sanur"],
    includes: [
      "Hotel 4-star dengan breakfast",
      "Transportasi AC",
      "Guide profesional",
      "Tiket masuk semua destinasi",
      "Welcome dinner",
      "Airport transfer"
    ],
    highlights: [
      "Sunset di Uluwatu Temple",
      "Terasering Jatiluwih",
      "Snorkeling di Nusa Penida",
      "Cultural show di Ubud"
    ],
    groupSize: "2-12 people",
    difficulty: "Easy",
    bestFor: "Couples, Families"
  }
];

// Mock data untuk testimonials
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Travel Blogger",
    content: "Pengalaman traveling dengan Tour & Travel Indonesia benar-benar luar biasa! Mereka memberikan pelayanan yang sangat profesional dan destinasi yang menakjubkan. Highly recommended!",
    rating: 5
  }
];

// GET /api/destinations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let filteredDestinations = destinations;
    if (category && category !== 'all') {
      filteredDestinations = destinations.filter(dest => dest.category === category);
    }
    
    return NextResponse.json({
      success: true,
      data: filteredDestinations
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch destinations' },
      { status: 500 }
    );
  }
}

// POST /api/destinations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validasi data
    if (!body.name || !body.location || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const newDestination = {
      id: destinations.length + 1,
      ...body,
      createdAt: new Date().toISOString()
    };
    
    destinations.push(newDestination);
    
    return NextResponse.json({
      success: true,
      data: newDestination
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create destination' },
      { status: 500 }
    );
  }
}

// PUT /api/destinations/[id]
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    
    const destinationIndex = destinations.findIndex(dest => dest.id === id);
    if (destinationIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Destination not found' },
        { status: 404 }
      );
    }
    
    destinations[destinationIndex] = {
      ...destinations[destinationIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: destinations[destinationIndex]
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update destination' },
      { status: 500 }
    );
  }
}

// DELETE /api/destinations/[id]
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    
    const destinationIndex = destinations.findIndex(dest => dest.id === id);
    if (destinationIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Destination not found' },
        { status: 404 }
      );
    }
    
    destinations.splice(destinationIndex, 1);
    
    return NextResponse.json({
      success: true,
      message: 'Destination deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete destination' },
      { status: 500 }
    );
  }
}
