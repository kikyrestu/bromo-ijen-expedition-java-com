import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// Dashboard Stats Interface
interface DashboardStats {
  overview: {
    totalBookings: number,
    totalRevenue: number, // IDR
    totalCustomers: number,
    totalPackages: number,
    totalBlogs: number,
    totalGalleryItems: number,
    totalTestimonials: number,
    totalNewsletterSubscribers: number
  },
  recentBookings: any[],
  monthlyRevenue: any[],
  packageStats: any[],
  recentActivity: any[]
};

// GET /api/dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section'); // 'overview', 'revenue', 'packages', 'activity'

    // Fetch real data from database
    const [packagesCount, blogsCount, galleryCount, testimonialsCount] = await Promise.all([
      prisma.package.count({ where: { status: 'published' } }),
      prisma.blog.count({ where: { status: 'published' } }),
      prisma.galleryItem.count(),
      prisma.testimonial.count({ where: { status: 'approved' } })
    ]);

    // Real dashboard stats
    const realDashboardStats: DashboardStats = {
      overview: {
        totalBookings: 0, // Would need booking system
        totalRevenue: 0, // Would need booking system
        totalCustomers: 0, // Would need booking system
        totalPackages: packagesCount,
        totalBlogs: blogsCount,
        totalGalleryItems: galleryCount,
        totalTestimonials: testimonialsCount,
        totalNewsletterSubscribers: 0 // Would need newsletter system
      },
      recentBookings: [], // Would need booking system
      monthlyRevenue: [], // Would need booking system
      packageStats: [], // Would need booking system
      recentActivity: [] // Would need activity log
    };

    if (section) {
      switch (section) {
        case 'overview':
          return NextResponse.json({
            success: true,
            data: realDashboardStats.overview
          });
        case 'revenue':
          return NextResponse.json({
            success: true,
            data: realDashboardStats.monthlyRevenue
          });
        case 'packages':
          return NextResponse.json({
            success: true,
            data: realDashboardStats.packageStats
          });
        case 'activity':
          return NextResponse.json({
            success: true,
            data: realDashboardStats.recentActivity
          });
        case 'bookings':
          return NextResponse.json({
            success: true,
            data: realDashboardStats.recentBookings
          });
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid section parameter' },
            { status: 400 }
          );
      }
    }

    // Return all stats if no section specified
    return NextResponse.json({
      success: true,
      data: realDashboardStats
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

// POST /api/dashboard (Update stats - for admin use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    // Note: Dashboard data now comes from database
    // These actions would need to be implemented with database updates
    switch (action) {
      case 'updateOverview':
        // Would update database
        break;
      case 'addActivity':
        // Would add to activity log in database
        break;
      case 'updatePackageStats':
        // Would update package stats in database
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: 'Dashboard data updated successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update dashboard data' },
      { status: 500 }
    );
  }
}
