import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// Helper: Parse JSON string safely
function safeParse(jsonString: any, fallback: any = []) {
  if (typeof jsonString !== 'string') return fallback;
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
}

// Helper: Format blog for API response
function formatBlog(blog: any) {
  return {
    id: blog.id,
    slug: blog.slug || blog.id,
    title: blog.title,
    excerpt: blog.excerpt,
    content: blog.content,
    author: blog.author,
    publishDate: blog.publishDate,
    readTime: blog.readTime,
    category: blog.category,
    tags: safeParse(blog.tags, []),
    image: blog.image,
    featured: blog.featured,
    status: blog.status,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt
  };
}

// GET: Fetch blog by slug or ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const identifier = resolvedParams.id;

    // Try to find by slug first, then by ID
    let blog = await prisma.blog.findUnique({
      where: { slug: identifier }
    });

    if (!blog) {
      blog = await prisma.blog.findUnique({
        where: { id: identifier }
      });
    }

    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: formatBlog(blog)
    });

  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}
