import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { updateBlogLocalizedUrls } from '@/lib/localized-urls';
import { getBlogTranslation } from '@/lib/auto-translate';

// Mock blogs data
const mockBlogs = [
  {
    id: '1',
    slug: 'bromo-photography-guide',
    title: 'Complete Guide to Bromo Photography',
    excerpt: 'Master the art of capturing stunning sunrise photos at Mount Bromo with expert tips and techniques',
    content: '<p>Learn how to capture the perfect Bromo sunrise shot with these professional photography tips...</p>',
    author: 'Bromo Ijen Tour Team',
    category: 'Photography',
    tags: ['Bromo', 'Photography', 'Sunrise', 'Tips'],
    readTime: '5 min read',
    publishDate: '2025-01-15',
    image: '/uploads/bromo-photography-guide.jpg',
    status: 'published',
    featured: true,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: '2',
    slug: 'ijen-hiking-tips',
    title: 'Essential Hiking Tips for Mount Ijen',
    excerpt: 'Everything you need to know before hiking to the blue fire crater',
    content: '<p>Prepare for your Ijen adventure with these essential hiking tips and safety guidelines...</p>',
    author: 'Bromo Ijen Tour Team',
    category: 'Adventure',
    tags: ['Ijen', 'Hiking', 'Blue Fire', 'Adventure'],
    readTime: '7 min read',
    publishDate: '2025-01-10',
    image: '/uploads/ijen-hiking-tips.jpg',
    status: 'published',
    featured: false,
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-10')
  },
  {
    id: '3',
    slug: 'budget-travel-guide',
    title: 'Budget Travel Guide to Bromo Ijen',
    excerpt: 'Discover how to explore Bromo and Ijen on a budget without compromising the experience',
    content: '<p>Travel smart and save money with these budget-friendly tips for your Bromo Ijen adventure...</p>',
    author: 'Bromo Ijen Tour Team',
    category: 'Budget Travel',
    tags: ['Budget', 'Tips', 'Travel Guide'],
    readTime: '6 min read',
    publishDate: '2025-01-05',
    image: '/uploads/budget-travel-guide.jpg',
    status: 'published',
    featured: false,
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-05')
  }
];

// Helper: Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper: Auto-generate SEO metadata for blogs
async function autoGenerateBlogSeo(blog: any, slug: string, siteUrl: string = 'https://bromoijen.com') {
  // Check if SEO data already exists
  const existingSeo = await prisma.seoData.findUnique({
    where: { pageType_pageSlug: { pageType: 'blog', pageSlug: slug } }
  });

  if (existingSeo) return; // Don't overwrite existing SEO data

  // Strip HTML tags from content
  const stripHtml = (html: string) => html?.replace(/<[^>]*>/g, '') || '';
  const cleanExcerpt = stripHtml(blog.excerpt || blog.content);

  // Generate SEO data
  const title = `${blog.title} | Bromo Ijen Travel Blog`.substring(0, 60);
  const description = cleanExcerpt.substring(0, 160);
  const tags = Array.isArray(blog.tags) ? blog.tags : safeParse(blog.tags, []);
  const keywords = tags.join(', ') || 'bromo tour blog, ijen tour, travel indonesia';

  await prisma.seoData.create({
    data: {
      pageType: 'blog',
      pageSlug: slug,
      title,
      description,
      keywords,
      canonicalUrl: `${siteUrl}/blog/${slug}`,
      ogImage: blog.image || '/og-default.jpg',
      ogType: 'article',
      noIndex: blog.status === 'draft'
    }
  });
}

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

// GET: Fetch all blogs or specific blog
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const includeAll = searchParams.get('includeAll') === 'true';
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const language = searchParams.get('language') || 'id';

    // Get single blog
    if (id) {
      const blog = await prisma.blog.findUnique({
        where: { id }
      });

      if (!blog) {
        return NextResponse.json(
          { success: false, error: 'Blog not found' },
          { status: 404 }
        );
      }

      try {
        // Get translation from database if needed
        let merged = blog;
        if (language !== 'id') {
          const translation = await getBlogTranslation(blog.id, language as any);
          
          if (translation) {
            // Merge original data with translated fields
            merged = {
              ...blog,
              title: translation.title || blog.title,
              excerpt: translation.excerpt || blog.excerpt,
              content: translation.content || blog.content,
              category: translation.category || blog.category,
              tags: translation.tags || blog.tags
            };
            console.log(`✅ Using database translation for blog ${blog.id} (${language})`);
          } else {
            // console.log(`⚠️  No translation found for blog ${blog.id} in ${language}, using original`);
          }
        }

        return NextResponse.json({
          success: true,
          data: formatBlog(merged)
        });
      } catch (error) {
        console.warn(`Error getting translation for blog ${blog.id}:`, error);
        return NextResponse.json({
          success: true,
          data: formatBlog(blog)
        });
      }
    }

    // Build where clause for database query
    const where: any = {};
    
    // Filter by status (default: only published for frontend)
    if (!includeAll) {
      where.status = 'published';
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    // Get all blogs with filters from database
    const blogs = await prisma.blog.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { publishDate: 'desc' }
      ]
    });

    // Get translations from database if language is not Indonesian
    let translatedBlogs = blogs;
    if (language !== 'id') {
      translatedBlogs = await Promise.all(
        blogs.map(async (blog) => {
          // Fetch translation from database
          const translation = await getBlogTranslation(blog.id, language as any);
          
          if (!translation) {
            // console.log(`⚠️  No translation found for blog ${blog.id} in ${language}`);
            return blog;
          }
          
          // Merge original blog with translated fields
          return {
            ...blog,
            title: translation.title || blog.title,
            excerpt: translation.excerpt || blog.excerpt,
            content: translation.content || blog.content,
            category: translation.category || blog.category,
            tags: translation.tags || blog.tags
          };
        })
      );
    }
    
    return NextResponse.json({
      success: true,
      data: translatedBlogs.map(formatBlog)
    });

  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

// POST: Create new blog
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation
    if (!body.title || !body.excerpt || !body.content) {
      return NextResponse.json(
        { success: false, error: 'Title, excerpt, and content are required' },
        { status: 400 }
      );
    }

    // Auto-generate slug from title
    let slug = generateSlug(body.title);
    const existingSlug = await prisma.blog.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Parse publishDate
    const publishDate = body.publishDate 
      ? new Date(body.publishDate) 
      : new Date();

    // Create blog
    const newBlog = await prisma.blog.create({
      data: {
        slug: slug,
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      author: body.author || 'Bromo Ijen Tour Team',
        publishDate: publishDate,
      readTime: body.readTime || '5 min read',
        category: body.category || 'Travel Guide',
        tags: JSON.stringify(body.tags || []),
        image: body.image || '',
      featured: body.featured || false,
        status: body.status || 'draft'
      }
    });

    // Generate localized URLs
    if (newBlog.slug) {
      try {
        await updateBlogLocalizedUrls(newBlog.id, newBlog.slug);
        console.log('✅ Localized URLs generated for blog:', newBlog.id);
      } catch (error) {
        console.error('⚠️ Failed to generate localized URLs:', error);
        // Don't fail the request, just log the error
      }
    }

    // Auto-generate SEO metadata
    await autoGenerateBlogSeo({
      title: newBlog.title,
      excerpt: newBlog.excerpt,
      content: newBlog.content,
      tags: newBlog.tags,
      image: newBlog.image,
      status: newBlog.status
    }, slug);

    return NextResponse.json({
      success: true,
      data: formatBlog(newBlog)
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create blog' },
      { status: 500 }
    );
  }
}

// PUT: Update existing blog
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body.id;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Blog ID is required' },
        { status: 400 }
      );
    }

    // Check if blog exists
    const existingBlog = await prisma.blog.findUnique({
      where: { id: id }
    });

    if (!existingBlog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (body.title !== undefined) {
      updateData.title = body.title;
      // Regenerate slug if title changes
      let newSlug = generateSlug(body.title);
      const slugConflict = await prisma.blog.findFirst({
        where: {
          slug: newSlug,
          id: { not: id }
        }
      });
      if (slugConflict) {
        newSlug = `${newSlug}-${Date.now()}`;
      }
      updateData.slug = newSlug;
    }

    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.author !== undefined) updateData.author = body.author;
    if (body.publishDate !== undefined) updateData.publishDate = new Date(body.publishDate);
    if (body.readTime !== undefined) updateData.readTime = body.readTime;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.tags !== undefined) updateData.tags = JSON.stringify(body.tags);
    if (body.image !== undefined) updateData.image = body.image;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.status !== undefined) updateData.status = body.status;

    const updatedBlog = await prisma.blog.update({
      where: { id: id },
      data: updateData
    });

    // Regenerate localized URLs if slug changed
    if (updatedBlog.slug && (body.title || body.slug)) {
      try {
        await updateBlogLocalizedUrls(updatedBlog.id, updatedBlog.slug);
        console.log('✅ Localized URLs regenerated for blog:', updatedBlog.id);
      } catch (error) {
        console.error('⚠️ Failed to regenerate localized URLs:', error);
        // Don't fail the request, just log the error
      }
    }

    // Update SEO noIndex if status changed
    if (body.status !== undefined && updatedBlog.slug) {
      try {
        await prisma.seoData.updateMany({
          where: {
            pageType: 'blog',
            pageSlug: updatedBlog.slug
          },
          data: {
            noIndex: body.status === 'draft'
          }
        });
      } catch (seoError) {
        console.warn('Failed to update SEO noIndex:', seoError);
      }
    }

    // Auto-generate SEO if title changed
    if (body.title !== undefined && updateData.slug) {
      await autoGenerateBlogSeo({
        title: updatedBlog.title,
        excerpt: updatedBlog.excerpt,
        content: updatedBlog.content,
        tags: updatedBlog.tags,
        image: updatedBlog.image,
        status: updatedBlog.status
      }, updateData.slug);
    }

    return NextResponse.json({
      success: true,
      data: formatBlog(updatedBlog)
    });

  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update blog' },
      { status: 500 }
    );
  }
}

// DELETE: Delete blog
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Blog ID is required' },
        { status: 400 }
      );
    }

    // Check if blog exists
    const existingBlog = await prisma.blog.findUnique({
      where: { id: id }
    });

    if (!existingBlog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }

    await prisma.blog.delete({
      where: { id: id }
    });

    return NextResponse.json({
      success: true,
      message: 'Blog deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}
