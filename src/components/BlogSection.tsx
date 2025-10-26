'use client';

import { Calendar, Folder, ArrowRight, BookOpen, FileText } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedSection from './AnimatedSection';

interface BlogPost {
  id?: string;
  slug?: string;
  title: string;
  category: string;
  date?: string;
  publishDate?: string;
  excerpt?: string;
  description?: string;
  content?: string;
  image: string;
  url?: string;
  author?: string;
  readTime?: string;
  status?: string;
  featured?: boolean;
}

interface BlogSectionProps {
  overrideContent?: {
    title?: string;
    subtitle?: string;
    description?: string;
    posts?: BlogPost[];
  };
}

const BlogSection = ({ overrideContent }: BlogSectionProps) => {
  const { t, currentLanguage } = useLanguage();
  const [sectionContent, setSectionContent] = useState<any>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch section metadata (title, subtitle, display settings)
        const sectionRes = await fetch(`/api/sections?section=blog&language=${currentLanguage}`);
        const sectionData = await sectionRes.json();
        if (sectionData.success) {
          setSectionContent(sectionData.data);
        }

        // Build query params based on section settings
        const displayCount = sectionData.data?.displayCount || 3;
        const featuredOnly = sectionData.data?.featuredOnly || false;
        const sortBy = sectionData.data?.sortBy || 'newest';

        // Fetch actual blog posts from /api/blogs (published only)
        const queryParams = new URLSearchParams();
        if (featuredOnly) queryParams.append('featured', 'true');
        if (currentLanguage !== 'id') queryParams.append('language', currentLanguage);
        
        const blogsRes = await fetch(`/api/blogs?${queryParams.toString()}`);
        const blogsData = await blogsRes.json();
        
        if (blogsData.success) {
          let posts = blogsData.data;

          // Apply sorting
          if (sortBy === 'newest') {
            posts = posts.sort((a: BlogPost, b: BlogPost) => 
              new Date(b.publishDate || b.date || '').getTime() - new Date(a.publishDate || a.date || '').getTime()
            );
          } else if (sortBy === 'oldest') {
            posts = posts.sort((a: BlogPost, b: BlogPost) => 
              new Date(a.publishDate || a.date || '').getTime() - new Date(b.publishDate || b.date || '').getTime()
            );
          } else if (sortBy === 'featured') {
            posts = posts.sort((a: BlogPost, b: BlogPost) => 
              (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
            );
          }

          // Apply display count limit
          setBlogPosts(posts.slice(0, displayCount));
        }
      } catch (error) {
        console.error('Error fetching blog data:', error);
      }
    };

    if (!overrideContent) {
      fetchData();
    }
  }, [overrideContent, currentLanguage]);

  const content = useMemo(() => {
    return {
      title: overrideContent?.title || sectionContent?.title || t('blog.title'),
      subtitle: overrideContent?.subtitle || sectionContent?.subtitle || 'LATEST INSIGHTS',
      posts: overrideContent?.posts || blogPosts
    };
  }, [overrideContent, sectionContent, blogPosts, t]);

  return (
    <section id="blog" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection animation="fadeInUp" delay={0.2} duration={0.8}>
          <div className="text-center mb-16">
          {/* Section Label */}
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              {content.subtitle}
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {content.title}
          </h2>
          </div>
        </AnimatedSection>

        {/* Blog Posts Grid */}
        <AnimatedSection animation="fadeInUp" delay={0.4} duration={0.8}>
        {content.posts.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>{t('blog.no_posts')}</p>
          </div>
        )}
        <div className="grid md:grid-cols-3 gap-8">
          {content.posts.map((post: BlogPost, index: number) => {
            return (
            <Link 
              href={`/blog/${post.slug || post.id}`} 
              key={post.id || `post-${index}`}
              className="group h-full"
            >
              <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col cursor-pointer">
                {/* Image */}
                <div className="relative h-64 bg-gray-200 overflow-hidden flex-shrink-0">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-16 h-16 bg-gray-600 rounded-lg mb-2 mx-auto flex items-center justify-center">
                          <FileText className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-xs">Blog Image</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Footer */}
                <div className="bg-gray-900 p-6 flex-1 flex flex-col">
                  {/* Meta Info */}
                  <div className="flex items-center space-x-4 mb-4 flex-shrink-0">
                    {/* Date */}
                    {post.date && (
                      <div className="flex items-center space-x-2 text-white/80">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{post.date}</span>
                      </div>
                    )}
                    
                    {/* Category */}
                    {post.category && (
                      <div className="flex items-center space-x-2 text-white/80">
                        <Folder className="w-4 h-4" />
                        <span className="text-sm">{post.category}</span>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-3 leading-tight line-clamp-2 flex-shrink-0">
                    {post.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/80 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                    {post.excerpt || post.description || ''}
                  </p>

                  {/* Read More */}
                  <div className="flex items-center text-orange-400 hover:text-orange-300 transition-colors duration-200 flex-shrink-0 mt-auto">
                    <span className="text-sm font-medium">Read More</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </article>
            </Link>
            );
          })}
        </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default BlogSection;
