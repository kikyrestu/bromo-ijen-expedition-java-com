'use client';

import { useState, use, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  User, 
  Share2, 
  Heart, 
  BookOpen,
  Tag,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import AnimatedSection from './AnimatedSection';

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

interface BlogDetailClientProps {
  params: Promise<{
    id: string;
    lang: string;
  }>;
}

export default function BlogDetailClient({ params }: BlogDetailClientProps) {
  const resolvedParams = use(params);
  const { currentLanguage } = useLanguage();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    fetchBlog();
  }, [resolvedParams.id, currentLanguage]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (currentLanguage !== 'id') queryParams.append('language', currentLanguage);
      
      const response = await fetch(`/api/blogs/${resolvedParams.id}?${queryParams.toString()}`);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(currentLanguage === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getLocalizedUrl = (path: string) => {
    if (currentLanguage === 'id') return path;
    return `/${currentLanguage}${path}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <BookOpen className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Blog Not Found</h1>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
          <Link 
            href={getLocalizedUrl('/blog')}
            className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Hero Image */}
      <AnimatedSection animation="fadeInUp" delay={0.1} duration={0.8}>
        <div className="relative h-[60vh] md:h-[70vh] overflow-hidden bg-orange-500">
          {blog.image ? (
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-full object-cover opacity-90"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-32 h-32 text-white/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
              {/* Category & Featured Badge */}
              <div className="flex items-center space-x-2 mb-4">
                <span className="px-4 py-1 bg-orange-600 text-white text-sm font-medium rounded-full">
                  {blog.category || 'Uncategorized'}
                </span>
                {blog.featured && (
                  <span className="px-4 py-1 bg-purple-600 text-white text-sm font-medium rounded-full">
                    Featured
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {blog.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">{blog.author}</span>
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
      </AnimatedSection>

      {/* Content */}
      <AnimatedSection animation="fadeInUp" delay={0.2} duration={0.8}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Excerpt */}
          {blog.excerpt && (
            <div className="bg-orange-50 border-l-4 border-orange-600 p-8 mb-12 rounded-r-lg">
              <p className="text-lg text-gray-700 leading-relaxed italic">
                {blog.excerpt}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-12 pb-8 border-b border-gray-200">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                isLiked 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">
                {isLiked ? 'Liked' : 'Like'}
              </span>
            </button>

            <button className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-300">
              <Share2 className="w-5 h-5" />
              <span className="font-medium">Share</span>
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
              prose-img:rounded-xl prose-img:shadow-xl prose-img:my-8"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-6">
                <Tag className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-bold text-gray-900">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {blog.tags.map((tag: string, index: number) => (
                  <Link
                    key={index}
                    href={getLocalizedUrl(`/blog?tag=${tag}`)}
                    className="px-4 py-2 bg-orange-100 text-orange-600 text-sm font-medium rounded-lg hover:bg-orange-200 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-12 pt-8 border-t border-gray-200 flex items-center justify-between">
            <Link 
              href={getLocalizedUrl('/blog')}
              className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Blog
            </Link>

            <Link 
              href={getLocalizedUrl('/packages')}
              className="inline-flex items-center bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 font-semibold transition-colors"
            >
              Book Tour
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}

