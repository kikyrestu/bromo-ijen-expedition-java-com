'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedSection from './AnimatedSection';
import BannerSlot from '@/components/banners/BannerSlot';
import { 
  Search, 
  Calendar, 
  User, 
  Clock,
  Tag,
  ArrowRight,
  BookOpen,
  TrendingUp
} from 'lucide-react';

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
}

interface BlogClientProps {
  lang: string;
}

export default function BlogClient({ lang }: BlogClientProps) {
  const { t, currentLanguage } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: t('blog.categories.all', 'All Posts'), count: 0 },
    { id: 'travel', name: t('blog.categories.travelTips', 'Travel Tips'), count: 0 },
    { id: 'guides', name: t('blog.categories.travelGuides', 'Travel Guides'), count: 0 },
    { id: 'adventure', name: t('blog.categories.adventure', 'Adventure'), count: 0 },
    { id: 'stories', name: t('blog.categories.stories', 'Travel Stories'), count: 0 }
  ];

  useEffect(() => {
    fetchBlogPosts();
  }, [currentLanguage]);

  useEffect(() => {
    filterPosts();
  }, [posts, searchQuery, selectedCategory]);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (currentLanguage !== 'id') queryParams.append('language', currentLanguage);
      
      const response = await fetch(`/api/blogs?${queryParams.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = [...posts];

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => 
        post.category?.toLowerCase() === selectedCategory
      );
    }

    setFilteredPosts(filtered);
  };

  const getLocalizedUrl = (slug: string) => {
    if (currentLanguage === 'id') return `/blog/${slug}`;
    return `/${currentLanguage}/blog/${slug}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(currentLanguage === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-white">
      {/* Hero Section */}
      <AnimatedSection animation="fadeInUp" delay={0.1} duration={0.8}>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-700 to-amber-500 opacity-90" />
          <div className="absolute -top-24 -right-32 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
          <div className="relative max-w-6xl mx-auto px-6 lg:px-8 pt-32 pb-28 text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-medium tracking-widest uppercase">{t('blog.subtitle') || 'Travel Journal'}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
              {t('blog.title') || 'Blog & Stories'}
            </h1>
            <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-white/85">
              {t('blog.description') || 'Travel tips, guides, and adventure stories from our journeys'}
            </p>
          </div>
        </section>
      </AnimatedSection>

      <BannerSlot location="blog.hero" variant="hero" className="px-6" />

      {/* Search and Filter Section */}
      <AnimatedSection animation="fadeInUp" delay={0.2} duration={0.8}>
        <section className="-mt-16 pb-12">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] p-8">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={t('blog.searchPlaceholder') || 'Cari artikel...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/70"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        selectedCategory === category.id
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                          : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
                <div className="text-sm text-white/70">
                  {t('blog.resultsCount', `${filteredPosts.length} artikel ketemu`).replace('{count}', filteredPosts.length.toString())}
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Featured Post */}
      {filteredPosts.length > 0 && (
        <AnimatedSection animation="fadeInUp" delay={0.3} duration={0.8}>
          <div className="max-w-6xl mx-auto px-6 lg:px-8 mb-16">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 shadow-[0_25px_80px_-25px_rgba(251,191,36,0.6)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_60%)]" />
              <div className="relative grid md:grid-cols-2 gap-0">
                {/* Image */}
                <div className="relative h-80 md:h-full overflow-hidden">
                  {filteredPosts[0].image ? (
                    <img
                      src={filteredPosts[0].image}
                      alt={filteredPosts[0].title}
                      className="w-full h-full object-cover scale-105 hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-24 h-24 text-white/30" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-10 md:p-14 flex flex-col justify-center text-white">
                  <div className="flex items-center space-x-3 mb-5 text-white/80">
                    <span className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest">
                      <TrendingUp className="w-4 h-4" />
                      <span>{t('blog.featuredBadge', 'Featured')}</span>
                    </span>
                    <span className="text-sm bg-white/10 px-3 py-1 rounded-full border border-white/20">
                      {filteredPosts[0].category || t('blog.categoryDefault', 'Uncategorized')}
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-semibold mb-4 leading-snug">
                    {filteredPosts[0].title}
                  </h2>
                  
                  <p className="text-base md:text-lg text-white/80 mb-6 line-clamp-3">
                    {filteredPosts[0].excerpt}
                  </p>

                  <div className="flex flex-wrap items-center gap-5 text-sm text-white/70 mb-8">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{filteredPosts[0].author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(filteredPosts[0].publishDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{filteredPosts[0].readTime}</span>
                    </div>
                  </div>

                  <Link href={getLocalizedUrl(filteredPosts[0].slug)}>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white text-orange-600 px-6 py-3 font-semibold shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5">
                      <span>{t('blog.heroCta', 'Read More')}</span>
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Posts Grid */}
      <AnimatedSection animation="fadeInUp" delay={0.4} duration={0.8}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8 pb-24">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('blog.emptyTitle', 'No articles found')}</h3>
              <p className="text-gray-600">{t('blog.emptyDescription', 'Try adjusting your search or filter criteria')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.slice(1).map((post, index) => (
                <div
                  key={post.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-[0_20px_60px_-30px_RGBA(15,23,42,0.8)] transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image */}
                  <Link href={getLocalizedUrl(post.slug)}>
                    <div className="relative h-48 overflow-hidden">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-white/30" />
                        </div>
                      )}

                      {post.featured && (
                        <div className="absolute top-4 left-4 rounded-full bg-orange-500/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                          {t('blog.highlightBadge', 'Highlight')}
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-4 flex items-center">
                      <span className="inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-orange-300">
                        {post.category || t('blog.categoryDefault', 'Uncategorized')}
                      </span>
                    </div>

                    <Link href={getLocalizedUrl(post.slug)}>
                      <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 transition-colors group-hover:text-orange-300">
                        {post.title}
                      </h3>
                    </Link>
                    
                    <p className="text-sm text-white/70 mb-6 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="mb-6 flex items-center justify-between text-xs text-white/50">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(post.publishDate)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </span>
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="mb-6 flex flex-wrap gap-2">
                        {post.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs text-white/70">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    <Link href={getLocalizedUrl(post.slug)}>
                      <span className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:border-orange-400 hover:bg-orange-400/20">
                        {t('blog.cardCta', 'Read Article')}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AnimatedSection>

      <BannerSlot location="blog.postFooter" variant="section" className="px-6" />
    </div>
  );
}
