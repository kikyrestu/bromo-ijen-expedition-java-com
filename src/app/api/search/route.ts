import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// Search result types
interface SearchPackage {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  price: number;
  rating: number;
  highlights: string[];
}

interface SearchBlog {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  publishDate: string;
}

interface SearchDestination {
  id: string;
  name: string;
  description: string;
  location: string;
  rating: number;
}

interface SearchResults {
  packages: SearchPackage[];
  blogs: SearchBlog[];
  destinations: SearchDestination[];
}

// GET /api/search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type'); // 'all', 'packages', 'blogs', 'destinations'
    const limit = searchParams.get('limit');
    const page = searchParams.get('page');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const searchQuery = query.toLowerCase().trim();
    const limitNum = parseInt(limit || '10');
    const pageNum = parseInt(page || '1');

    let results: SearchResults = {
      packages: [],
      blogs: [],
      destinations: []
    };

    // Search packages
    if (!type || type === 'all' || type === 'packages') {
      const packages = await prisma.package.findMany({
        where: {
          OR: [
            { title: { contains: searchQuery } },
            { description: { contains: searchQuery } },
            { category: { contains: searchQuery } },
            { location: { contains: searchQuery } },
            { slug: { contains: searchQuery } }
          ],
          status: 'published'
        },
        take: limitNum,
        skip: (pageNum - 1) * limitNum,
        orderBy: { createdAt: 'desc' }
      });

      results.packages = packages.map(pkg => ({
        id: pkg.id,
        title: pkg.title,
        description: pkg.description,
        category: pkg.category || '',
        location: pkg.location || '',
        price: pkg.price || 0,
        rating: pkg.rating || 0,
        highlights: typeof pkg.highlights === 'string' ? JSON.parse(pkg.highlights) : (pkg.highlights || [])
      }));
    }

    // Search blogs
    if (!type || type === 'all' || type === 'blogs') {
      const blogs = await prisma.blog.findMany({
        where: {
          OR: [
            { title: { contains: searchQuery } },
            { excerpt: { contains: searchQuery } },
            { category: { contains: searchQuery } },
            { tags: { contains: searchQuery } },
            { author: { contains: searchQuery } }
          ],
          status: 'published'
        },
        take: limitNum,
        skip: (pageNum - 1) * limitNum,
        orderBy: { publishDate: 'desc' }
      });

      results.blogs = blogs.map(blog => ({
        id: blog.id,
        title: blog.title,
        excerpt: blog.excerpt,
        category: blog.category || '',
        tags: blog.tags ? JSON.parse(blog.tags) : [],
        author: blog.author,
        publishDate: blog.publishDate?.toISOString().split('T')[0] || ''
      }));
    }

    // Search destinations
    if (!type || type === 'all' || type === 'destinations') {
      const destinations = await prisma.destination.findMany({
        where: {
          OR: [
            { name: { contains: searchQuery } },
            { description: { contains: searchQuery } },
            { location: { contains: searchQuery } },
            { category: { contains: searchQuery } }
          ]
        },
        take: limitNum,
        skip: (pageNum - 1) * limitNum,
        orderBy: { name: 'asc' }
      });

      results.destinations = destinations.map(dest => ({
        id: dest.id,
        name: dest.name,
        description: dest.description || '',
        location: dest.location || '',
        rating: dest.rating || 0,
      }));
    }

    // Calculate total results
    const totalResults = results.packages.length + results.blogs.length + results.destinations.length;

    // Pagination for each type
    if (type && type !== 'all') {
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      
      if (type === 'packages') {
        results.packages = results.packages.slice(startIndex, endIndex);
      } else if (type === 'blogs') {
        results.blogs = results.blogs.slice(startIndex, endIndex);
      } else if (type === 'destinations') {
        results.destinations = results.destinations.slice(startIndex, endIndex);
      }
    } else {
      // For 'all' type, limit each category
      results.packages = results.packages.slice(0, 5);
      results.blogs = results.blogs.slice(0, 5);
      results.destinations = results.destinations.slice(0, 5);
    }

    return NextResponse.json({
      success: true,
      data: results,
      meta: {
        query: query,
        type: type || 'all',
        totalResults: totalResults,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalPages: type && type !== 'all' ? Math.ceil(totalResults / limitNum) : 1
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}

// POST /api/search (Advanced search with filters)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      query, 
      type = 'all', 
      filters = {}, 
      sort = 'relevance',
      limit = 10,
      page = 1 
    } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const searchQuery = query.toLowerCase().trim();
    let results: SearchResults = {
      packages: [],
      blogs: [],
      destinations: []
    };

    // Search packages with filters
    if (type === 'all' || type === 'packages') {
      const packageFilters: any = {
        OR: [
          { title: { contains: searchQuery } },
          { description: { contains: searchQuery } },
          { category: { contains: searchQuery } },
          { location: { contains: searchQuery } }
        ],
        status: 'published'
      };

      // Apply additional filters
      if (filters.category) {
        packageFilters.category = { contains: filters.category };
      }
      if (filters.minPrice) {
        packageFilters.price = { ...packageFilters.price, gte: filters.minPrice };
      }
      if (filters.maxPrice) {
        packageFilters.price = { ...packageFilters.price, lte: filters.maxPrice };
      }
      if (filters.minRating) {
        packageFilters.rating = { gte: filters.minRating };
      }

      // Sort packages
      let orderBy: any = { createdAt: 'desc' };
      switch (sort) {
        case 'price_low':
          orderBy = { price: 'asc' };
          break;
        case 'price_high':
          orderBy = { price: 'desc' };
          break;
        case 'rating':
          orderBy = { rating: 'desc' };
          break;
      }

      const packages = await prisma.package.findMany({
        where: packageFilters,
        take: limit,
        skip: (page - 1) * limit,
        orderBy
      });

      results.packages = packages.map(pkg => ({
        id: pkg.id,
        title: pkg.title,
        description: pkg.description,
        category: pkg.category || '',
        location: pkg.location || '',
        price: pkg.price || 0,
        rating: pkg.rating || 0,
        highlights: typeof pkg.highlights === 'string' ? JSON.parse(pkg.highlights) : (pkg.highlights || [])
      }));
    }

    // Search blogs with filters
    if (type === 'all' || type === 'blogs') {
      const blogFilters: any = {
        OR: [
          { title: { contains: searchQuery } },
          { excerpt: { contains: searchQuery } },
          { category: { contains: searchQuery } },
          { author: { contains: searchQuery } }
        ],
        status: 'published'
      };

      // Apply additional filters
      if (filters.category) {
        blogFilters.category = { contains: filters.category };
      }
      if (filters.author) {
        blogFilters.author = { contains: filters.author };
      }

      const blogs = await prisma.blog.findMany({
        where: blogFilters,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { publishDate: 'desc' }
      });

      results.blogs = blogs.map(blog => ({
        id: blog.id,
        title: blog.title,
        excerpt: blog.excerpt,
        category: blog.category || '',
        tags: blog.tags ? JSON.parse(blog.tags) : [],
        author: blog.author,
        publishDate: blog.publishDate?.toISOString().split('T')[0] || ''
      }));
    }

    // Search destinations with filters
    if (type === 'all' || type === 'destinations') {
      const destinationFilters: any = {
        OR: [
          { name: { contains: searchQuery } },
          { description: { contains: searchQuery } },
          { location: { contains: searchQuery } }
        ]
      };

      // Apply additional filters
      if (filters.minRating) {
        destinationFilters.rating = { gte: filters.minRating };
      }

      const destinations = await prisma.destination.findMany({
        where: destinationFilters,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { name: 'asc' }
      });

      results.destinations = destinations.map(dest => ({
        id: dest.id,
        name: dest.name,
        description: dest.description || '',
        location: dest.location || '',
        rating: dest.rating || 0,
      }));
    }

    return NextResponse.json({
      success: true,
      data: results,
      meta: {
        query: query,
        type: type,
        filters: filters,
        sort: sort,
        pagination: {
          page: page,
          limit: limit
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to perform advanced search' },
      { status: 500 }
    );
  }
}
