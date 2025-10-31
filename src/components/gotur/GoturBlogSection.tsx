'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, ArrowUpRight, BookOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BlogPost {
  id?: string;
  slug?: string;
  title: string;
  category: string;
  date?: string;
  publishDate?: string;
  excerpt?: string;
  description?: string;
  image: string;
  author?: string;
  readTime?: string;
  featured?: boolean;
}

const GoturBlogSection = () => {
  const { currentLanguage } = useLanguage();
  const [sectionContent, setSectionContent] = useState<any>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sectionRes = await fetch(`/api/sections?section=blog&language=${currentLanguage}`);
        const sectionJson = await sectionRes.json();
        if (sectionJson.success) {
          setSectionContent(sectionJson.data);
        }

        const displayCount = sectionJson.data?.displayCount || 3;
        const featuredOnly = sectionJson.data?.featuredOnly || false;
        const sortBy = sectionJson.data?.sortBy || 'newest';

        const queryParams = new URLSearchParams();
        if (featuredOnly) queryParams.append('featured', 'true');
        if (currentLanguage !== 'id') queryParams.append('language', currentLanguage);

        const blogsRes = await fetch(`/api/blogs?${queryParams.toString()}`);
        const blogsJson = await blogsRes.json();

        if (blogsJson.success) {
          let posts: BlogPost[] = blogsJson.data;

          if (sortBy === 'newest') {
            posts = posts.sort(
              (a, b) =>
                new Date(b.publishDate || b.date || '').getTime() -
                new Date(a.publishDate || a.date || '').getTime()
            );
          } else if (sortBy === 'featured') {
            posts = posts.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
          }

          setBlogPosts(posts.slice(0, displayCount));
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
      }
    };

    fetchData();
  }, [currentLanguage]);

  const content = useMemo(() => {
    return {
      title: sectionContent?.title || 'Travel Journal',
      subtitle: sectionContent?.subtitle || 'STAY INSPIRED',
      description:
        sectionContent?.description ||
        'Cerita perjalanan, panduan destinasi, dan rekomendasi itinerary eksklusif dari travel designer kami.',
    };
  }, [sectionContent]);

  const buildDetailUrl = (post: BlogPost) => {
    const base = `/blog/${post.slug || post.id}`;
    return currentLanguage === 'id' ? base : `/${currentLanguage}${base}`;
  };

  if (blogPosts.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-orange-600">
              <BookOpen className="h-4 w-4" />
              {content.subtitle}
            </div>
            <h2 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">{content.title}</h2>
            <p className="text-base leading-relaxed text-slate-600">{content.description}</p>
          </div>

          <Link
            href={currentLanguage === 'id' ? '/blog' : `/${currentLanguage}/blog`}
            className="inline-flex items-center gap-2 rounded-full border border-orange-300 px-6 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
          >
            Lihat Semua Artikel
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {blogPosts.map((post) => (
            <Link
              href={buildDetailUrl(post)}
              key={post.id || post.slug}
              className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-orange-100 bg-gradient-to-br from-white via-orange-50/20 to-white shadow-lg shadow-orange-100/70 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-200/80"
            >
              <div className="relative h-56 w-full overflow-hidden">
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                    <BookOpen className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  {post.category && (
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-800 shadow">
                      {post.category}
                    </span>
                  )}
                  {post.featured && (
                    <span className="rounded-full bg-orange-500/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow">
                      Featured
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-4 p-6">
                <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  {post.publishDate && (
                    <span className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      {post.publishDate}
                    </span>
                  )}
                  {post.readTime && (
                    <span className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      {post.readTime}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-semibold leading-tight text-slate-900 transition group-hover:text-orange-600">
                  {post.title}
                </h3>

                <p className="flex-1 text-sm leading-relaxed text-slate-600">
                  {post.excerpt || post.description || ''}
                </p>

                <div className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 transition group-hover:gap-3">
                  Baca Artikel
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GoturBlogSection;

