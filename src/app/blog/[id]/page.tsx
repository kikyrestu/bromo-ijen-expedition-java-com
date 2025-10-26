'use client';

import { useState, use, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import DynamicHeader from '@/components/DynamicHeader';
import Breadcrumbs from '@/components/Breadcrumbs';
import { generateBlogPostSchema } from '@/lib/seo-utils';
import { 
  Calendar, 
  Clock, 
  User, 
  Share2, 
  Heart, 
  BookOpen,
  Tag,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  readTime: string;
  category: string;
  tags: string[];
  image: string;
  featured: boolean;
  status: string;
}

const BlogDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [seoData, setSeoData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/blogs/${resolvedParams.id}`);
        const data = await response.json();

        if (data.success) {
          setBlog(data.data);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [resolvedParams.id]);

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        if (data.success) {
          setSettings(data.data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  // Fetch SEO data when blog is loaded
  useEffect(() => {
    if (blog?.slug) {
      const fetchSeoData = async () => {
        try {
          const seoRes = await fetch(`/api/seo?pageType=blog&pageSlug=${blog.slug}`);
          const seoJson = await seoRes.json();
          if (seoJson.success) {
            setSeoData(seoJson.data);
          }
        } catch (error) {
          console.error('Error fetching SEO data:', error);
        }
      };
      fetchSeoData();
    }
  }, [blog]);

  if (loading) {
  return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Blog Not Found</h1>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
          <Link 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
                </div>
              </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
    });
  };

  // SEO Data
  const title = seoData?.title || `${blog.title} | Bromo Ijen Blog`;
  const description = seoData?.description || blog.excerpt || blog.content?.substring(0, 160);
  const keywords = seoData?.keywords || blog.tags?.join(', ') || 'travel blog, bromo, ijen';
  const canonicalUrl = seoData?.canonicalUrl || `${settings?.siteUrl}/blog/${blog.slug}`;
  const ogImage = seoData?.ogImage || blog.image || settings?.defaultOgImage;
  const siteName = settings?.siteName || 'Bromo Ijen Tour & Travel';
  const siteUrl = settings?.siteUrl || 'https://bromoijen.com';

  // Generate JSON-LD Schema
  const blogPostSchema = generateBlogPostSchema(blog, siteUrl);

  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Robots */}
        <meta name="robots" content={blog.status === 'published' ? 'index,follow' : 'noindex,nofollow'} />
        
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content={siteName} />
        <meta property="article:published_time" content={blog.publishDate} />
        <meta property="article:author" content={blog.author} />
        <meta property="article:section" content={blog.category} />
        {blog.tags?.map((tag: string) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={ogImage} />
      </Head>

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostSchema) }}
      />

      <div className="min-h-screen bg-white">
        <DynamicHeader />

        {/* Breadcrumbs */}
        <div className="mt-36">
          <Breadcrumbs items={[
            { name: 'Blog', url: '/blog' },
            { name: blog.title, url: `/blog/${blog.slug}` }
          ]} />
                  </div>

      {/* Hero Image */}
      <div className="relative h-96 bg-gray-900 overflow-hidden">
        {blog.image ? (
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-32 h-32 text-gray-700" />
                </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            {/* Category Badge */}
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-3 py-1 bg-orange-600 text-white text-sm font-medium rounded-full">
                {blog.category}
              </span>
              {blog.featured && (
                <span className="px-3 py-1 bg-purple-600 text-white text-sm font-medium rounded-full">
                  Featured
                </span>
              )}
              </div>

              {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {blog.title}
              </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span className="text-sm">{blog.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">{formatDate(blog.publishDate)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm">{blog.readTime}</span>
              </div>
              </div>
              </div>
            </div>
          </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Excerpt */}
        {blog.excerpt && (
          <div className="bg-orange-50 border-l-4 border-orange-600 p-6 mb-8 rounded-r-lg">
            <p className="text-lg text-gray-700 leading-relaxed italic">
              {blog.excerpt}
            </p>
                </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-8 pb-8 border-b">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isLiked 
                ? 'bg-red-100 text-red-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">
              {isLiked ? 'Liked' : 'Like'}
            </span>
          </button>

          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">Share</span>
          </button>
            </div>

        {/* Blog Content */}
        <div 
          className="prose prose-lg max-w-none
            prose-headings:font-bold prose-headings:text-gray-900
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
            prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline
            prose-ul:my-6 prose-ul:space-y-2
            prose-li:text-gray-700
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-img:rounded-lg prose-img:shadow-lg"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t">
            <div className="flex items-center space-x-2 mb-4">
              <Tag className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
            </div>
              <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag: string, index: number) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  #{tag}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Back to Blog */}
        <div className="mt-12 pt-8 border-t">
          <Link 
            href="/" 
            className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Blog
          </Link>
        </div>
      </article>
    </div>
    </>
  );
};

export default BlogDetailPage;
