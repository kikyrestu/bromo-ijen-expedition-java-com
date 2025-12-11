'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import BannerSlot from '@/components/banners/BannerSlot';
import { 
  Search, 
  Calendar, 
  User, 
  Clock,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Filter,
  Tag,
  MapPin,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    { id: 'all', name: t('blog.categories.all', 'All Posts') },
    { id: 'travel', name: t('blog.categories.travelTips', 'Travel Tips') },
    { id: 'guides', name: t('blog.categories.travelGuides', 'Travel Guides') },
    { id: 'adventure', name: t('blog.categories.adventure', 'Adventure') },
    { id: 'stories', name: t('blog.categories.stories', 'Travel Stories') }
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
    // If slug is missing, fallback to id or empty string to prevent errors
    const identifier = slug || '';
    if (currentLanguage === 'id') return `/blog/${identifier}`;
    return `/${currentLanguage}/blog/${identifier}`;
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const featuredPost = filteredPosts.find(p => p.featured) || filteredPosts[0];
  const regularPosts = filteredPosts.filter(p => p.id !== featuredPost?.id);

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 pb-20 font-sans selection:bg-orange-500/30">
      {/* Hero Section */}
      <div className="relative pt-40 pb-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')] bg-cover bg-center opacity-10 fixed-bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 via-gray-50/90 to-gray-50" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        
        {/* Decorative Blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] animate-pulse delay-1000" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-orange-600 text-sm font-medium mb-8">
              <Compass className="w-4 h-4 animate-spin-slow" />
              <span className="tracking-wide uppercase text-xs font-bold">{t('blog.subtitle') || 'Travel Journal'}</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-slate-900">
              {t('blog.title') || 'Blog & Stories'}
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
              {t('blog.description') || 'Discover travel tips, guides, and adventure stories from our journeys across Indonesia.'}
            </p>
          </motion.div>
        </div>
      </div>

      <BannerSlot location="blog.hero" variant="hero" className="px-6 mb-16 max-w-7xl mx-auto" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Search & Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="sticky top-24 z-40 mb-16"
        >
          <div className="p-2 rounded-[2rem] bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
              {/* Categories */}
              <div className="flex overflow-x-auto pb-2 md:pb-0 gap-1 w-full md:w-auto no-scrollbar px-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-5 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                      selectedCategory === category.id
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full md:w-80 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder={t('blog.searchPlaceholder') || 'Search articles...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 rounded-full bg-slate-50 border border-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-orange-500/50 transition-all"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Featured Post */}
        {featuredPost && !searchQuery && selectedCategory === 'all' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-20"
          >
            <Link href={getLocalizedUrl(featuredPost.slug || featuredPost.id)} className="group block relative rounded-[2rem] overflow-hidden bg-white border border-slate-200 hover:border-orange-500/30 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-orange-500/10">
              <div className="grid md:grid-cols-12 gap-0">
                <div className="md:col-span-7 relative h-80 md:h-[500px] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 md:bg-gradient-to-r" />
                  <img
                    src={featuredPost.image || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80'}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute top-6 left-6 z-20">
                    <span className="px-4 py-2 rounded-full bg-orange-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-500/20 flex items-center gap-2">
                      <TrendingUp className="w-3 h-3" />
                      Featured Story
                    </span>
                  </div>
                </div>
                <div className="md:col-span-5 p-8 md:p-12 flex flex-col justify-center relative">
                  {/* Decorative background for text area */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-white/80 backdrop-blur-sm md:hidden" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 text-sm text-slate-500 mb-6">
                      <span className="text-orange-600 font-medium px-3 py-1 rounded-full bg-orange-50 border border-orange-200">
                        {featuredPost.category}
                      </span>
                      <span>•</span>
                      <span>{formatDate(featuredPost.publishDate)}</span>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-slate-900 group-hover:text-orange-600 transition-colors leading-tight">
                      {featuredPost.title}
                    </h2>
                    
                    <p className="text-slate-600 mb-8 line-clamp-3 text-lg leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <User className="w-4 h-4 text-orange-500" />
                          {featuredPost.author}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="w-4 h-4 text-orange-500" />
                          {featuredPost.readTime}
                        </div>
                      </div>
                      
                      <span className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                        <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {(searchQuery || selectedCategory !== 'all' ? filteredPosts : regularPosts).map((post, index) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link 
                  href={getLocalizedUrl(post.slug || post.id)}
                  className="group flex flex-col h-full bg-white border border-slate-200 rounded-[2rem] overflow-hidden hover:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="relative h-72 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
                    <img
                      src={post.image || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80'}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4 z-20">
                      <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/20 text-slate-900 text-xs font-medium flex items-center gap-1.5 shadow-sm">
                        <Tag className="w-3 h-3 text-orange-500" />
                        {post.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col flex-grow p-8">
                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-4 font-medium uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-orange-500" />
                        {formatDate(post.publishDate)}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold mb-3 line-clamp-2 text-slate-900 group-hover:text-orange-600 transition-colors leading-snug">
                      {post.title}
                    </h3>
                    
                    <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto group/btn">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-700 font-medium">{post.author}</span>
                          <span className="text-[10px] text-slate-400">{post.readTime} read</span>
                        </div>
                      </div>
                      
                      <span className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                        <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-32">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 mb-6 border border-slate-200">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No articles found</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              We couldn't find any articles matching your search. Try adjusting your keywords or category filters.
            </p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="mt-8 px-6 py-2.5 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <BannerSlot location="blog.postFooter" variant="section" className="px-6 mt-24 max-w-7xl mx-auto" />
    </div>
  );
}
