'use client';

import { Calendar, ArrowRight, BookOpen, Clock, User, Tag } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import Image from 'next/image';
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
    layoutStyle?: string;
    displayCount?: number;
    featuredOnly?: boolean;
    sortBy?: string;
  };
}

const BlogSection = ({ overrideContent }: BlogSectionProps) => {
  const { t, currentLanguage } = useLanguage();
  const [sectionContent, setSectionContent] = useState<any>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const shouldFetch = !overrideContent || overrideContent.posts === undefined;
    if (!shouldFetch) {
      setSectionContent(overrideContent);
      setBlogPosts(overrideContent.posts || []);
      return;
    }

    const fetchData = async () => {
      try {
        const sectionRes = await fetch(`/api/sections?section=blog&language=${currentLanguage}`);
        const sectionData = await sectionRes.json();
        if (sectionData.success) {
          setSectionContent(sectionData.data);
        }

        const displayCountSetting = overrideContent?.displayCount ?? sectionData.data?.displayCount ?? 3;
        const featuredOnlySetting = overrideContent?.featuredOnly ?? sectionData.data?.featuredOnly ?? false;
        const sortBySetting = overrideContent?.sortBy ?? sectionData.data?.sortBy ?? 'newest';

        const queryParams = new URLSearchParams();
        if (featuredOnlySetting) queryParams.append('featured', 'true');
        if (currentLanguage !== 'id') queryParams.append('language', currentLanguage);

        const blogsRes = await fetch(`/api/blogs?${queryParams.toString()}`);
        const blogsData = await blogsRes.json();

        if (blogsData.success) {
          let posts = blogsData.data as BlogPost[];

          if (sortBySetting === 'newest') {
            posts = posts.sort((a, b) =>
              new Date(b.publishDate || b.date || '').getTime() - new Date(a.publishDate || a.date || '').getTime()
            );
          } else if (sortBySetting === 'oldest') {
            posts = posts.sort((a, b) =>
              new Date(a.publishDate || a.date || '').getTime() - new Date(b.publishDate || b.date || '').getTime()
            );
          } else if (sortBySetting === 'featured') {
            posts = posts.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
          }

          setBlogPosts(posts.slice(0, displayCountSetting));
        }
      } catch (error) {
        console.error('Error fetching blog data:', error);
      }
    };

    fetchData();
  }, [overrideContent, currentLanguage]);

  const content = useMemo(() => {
    return {
      title: overrideContent?.title || sectionContent?.title || t('blog.title'),
      subtitle: overrideContent?.subtitle || sectionContent?.subtitle || 'LATEST INSIGHTS',
      posts: overrideContent?.posts || blogPosts,
    };
  }, [overrideContent, sectionContent, blogPosts, t]);

  return (
    <section className="py-16 md:py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
          <AnimatedSection animation="fadeInUp">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {content.title}
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl">
              Read our latest stories and travel guides.
            </p>
          </AnimatedSection>

          <AnimatedSection animation="fadeInLeft" delay={0.2}>
            <Link 
              href={currentLanguage === 'id' ? '/blog' : `/${currentLanguage}/blog`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 bg-white text-slate-900 font-medium hover:bg-slate-50 transition-colors text-sm"
            >
              View all articles
            </Link>
          </AnimatedSection>
        </div>

        {content.posts.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p>{t('blog.no_posts')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {content.posts.map((post, index) => (
              <AnimatedSection 
                key={post.id || index} 
                animation="fadeInUp" 
                delay={index * 0.1}
                className="h-full"
              >
                <Link
                  href={`/blog/${post.slug || post.id}`}
                  className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300"
                >
                  {/* Image Container */}
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    {post.image ? (
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-slate-300" />
                      </div>
                    )}
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Category Badge */}
                    {post.category && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                          {post.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-grow p-6">
                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-[10px] text-slate-500 mb-3 font-medium uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {post.date || post.publishDate}
                      </span>
                      {post.readTime && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors leading-tight">
                      {post.title}
                    </h3>

                    <p className="text-slate-600 text-sm line-clamp-3 mb-5 flex-grow leading-relaxed">
                      {post.excerpt || post.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-auto">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <User className="w-3 h-3" />
                        </div>
                        <span>{post.author || 'Admin'}</span>
                      </div>
                      
                      <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
