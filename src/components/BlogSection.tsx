'use client';

import { Calendar, Folder, ArrowRight, BookOpen, FileText, Clock } from 'lucide-react';
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

  const effectiveLayout = overrideContent?.layoutStyle || sectionContent?.layoutStyle || 'grid';

  const content = useMemo(() => {
    return {
      title: overrideContent?.title || sectionContent?.title || t('blog.title'),
      subtitle: overrideContent?.subtitle || sectionContent?.subtitle || 'LATEST INSIGHTS',
      posts: overrideContent?.posts || blogPosts,
      layoutStyle: effectiveLayout
    };
  }, [overrideContent, sectionContent, blogPosts, t, effectiveLayout]);

  return (
    <section id="blog" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Clean Header */}
        <AnimatedSection animation="fadeInUp" delay={0.2} duration={0.8}>
          <div className="text-center mb-12">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-50 rounded-full mb-4">
              <BookOpen className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
                {content.subtitle}
              </span>
            </div>
          
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {content.title}
            </h2>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp" delay={0.4} duration={0.8}>
          {content.posts.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>{t('blog.no_posts')}</p>
            </div>
          )}

          {content.layoutStyle === 'spotlight' ? (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              {content.posts[0] && (
                <Link
                  href={`/blog/${content.posts[0].slug || content.posts[0].id}`}
                  className="group"
                  key={content.posts[0].id || 'spotlight-featured'}
                >
                  <article className="relative h-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_25px_60px_-30px_rgba(15,23,42,0.25)] transition-all duration-300 hover:shadow-[0_35px_70px_-35px_rgba(15,23,42,0.35)]">
                    <div className="relative h-72 overflow-hidden">
                      {content.posts[0].image ? (
                        <img
                          src={content.posts[0].image}
                          alt={content.posts[0].title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur">
                          <div className="text-center text-white/80">
                            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-xl bg-white/10">
                              <FileText className="h-8 w-8" />
                            </div>
                            <p className="text-xs uppercase tracking-[0.3em]">No Image</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-8">
                        {content.posts[0].category && (
                          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur">
                            {content.posts[0].category}
                          </span>
                        )}

                        <h3 className="text-2xl font-semibold text-white md:text-3xl">
                          {content.posts[0].title}
                        </h3>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/80">
                          {content.posts[0].date && (
                            <span className="inline-flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {content.posts[0].date}
                            </span>
                          )}
                          {content.posts[0].readTime && (
                            <span className="inline-flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {content.posts[0].readTime}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-8">
                      <p className="mb-6 text-base text-slate-600 line-clamp-3">
                        {content.posts[0].excerpt || content.posts[0].description || ''}
                      </p>

                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500">
                        <span>{t('blog.cardCta') || 'Read Article'}</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </article>
                </Link>
              )}

              <div className="flex flex-col gap-6">
                {content.posts.slice(1, 4).map((post: BlogPost, index: number) => (
                  <Link
                    href={`/blog/${post.slug || post.id}`}
                    key={post.id || `spotlight-list-${index}`}
                    className="group"
                  >
                    <article className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                      <div className="relative aspect-square w-32 overflow-hidden rounded-xl">
                        {post.image ? (
                          <img
                            src={post.image}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-800/10">
                            <FileText className="h-6 w-6 text-slate-400" />
                          </div>
                        )}
                        {post.category && (
                          <span className="absolute left-2 top-2 rounded-full bg-orange-500 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                            {post.category}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col">
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          {post.date && (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {post.date}
                            </span>
                          )}
                          {post.readTime && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {post.readTime}
                            </span>
                          )}
                        </div>

                        <h4 className="mt-2 text-base font-semibold text-slate-900 line-clamp-2">
                          {post.title}
                        </h4>

                        <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                          {post.excerpt || post.description || ''}
                        </p>

                        <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-orange-500">
                          <span>{t('blog.cardCta') || 'Read Article'}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-3">
              {content.posts.map((post: BlogPost, index: number) => {
                return (
                  <Link
                    href={`/blog/${post.slug || post.id}`}
                    key={post.id || `post-${index}`}
                    className="group h-full"
                  >
                    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
                      <div className="relative h-64 bg-gray-200">
                        {post.image ? (
                          <img
                            src={post.image}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                            <div className="text-center text-white">
                              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-lg bg-gray-600">
                                <FileText className="h-8 w-8 text-gray-300" />
                              </div>
                              <p className="text-xs">Blog Image</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col bg-gray-900 p-6">
                        <div className="mb-4 flex items-center space-x-4 text-white/80">
                          {post.date && (
                            <span className="inline-flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4" />
                              {post.date}
                            </span>
                          )}
                          {post.category && (
                            <span className="inline-flex items-center gap-2 text-sm">
                              <Folder className="h-4 w-4" />
                              {post.category}
                            </span>
                          )}
                        </div>

                        <h3 className="flex-shrink-0 text-lg font-bold text-white line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="mt-3 flex-1 text-sm text-white/80 line-clamp-3">
                          {post.excerpt || post.description || ''}
                        </p>

                        <div className="mt-6 inline-flex items-center text-orange-400 transition-colors duration-200 hover:text-orange-300">
                          <span className="text-sm font-medium">{t('blog.cardCta') || 'Read Article'}</span>
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </AnimatedSection>
      </div>
    </section>
  );
};

export default BlogSection;
