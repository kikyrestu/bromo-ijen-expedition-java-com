'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedSection from './AnimatedSection';
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
    { id: 'all', name: 'All Posts', count: 0 },
    { id: 'travel', name: 'Travel Tips', count: 0 },
    { id: 'guides', name: 'Travel Guides', count: 0 },
    { id: 'adventure', name: 'Adventure', count: 0 },
    { id: 'stories', name: 'Travel Stories', count: 0 }
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
    <div className="bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <AnimatedSection animation="fadeInUp" delay={0.1} duration={0.8}>
        <div className="bg-orange-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-6 text-white/90" />
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                {t('blog.title') || 'Blog & Stories'}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
                {t('blog.description') || 'Travel tips, guides, and adventure stories from our journeys'}
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Search and Filter Section */}
      <AnimatedSection animation="fadeInUp" delay={0.2} duration={0.8}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('blog.searchPlaceholder') || 'Search articles...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      selectedCategory === category.id
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              Found {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Featured Post */}
      {filteredPosts.length > 0 && (
        <AnimatedSection animation="fadeInUp" delay={0.3} duration={0.8}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <div className="bg-orange-600 rounded-2xl overflow-hidden shadow-2xl">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image */}
                <div className="relative h-96 md:h-auto bg-orange-700">
                  {filteredPosts[0].image ? (
                    <img
                      src={filteredPosts[0].image}
                      alt={filteredPosts[0].title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-24 h-24 text-white/30" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-8 md:p-12 flex flex-col justify-center text-white">
                  <div className="flex items-center space-x-2 mb-4">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm font-semibold">Featured Article</span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    {filteredPosts[0].title}
                  </h2>
                  
                  <p className="text-lg text-white/90 mb-6 line-clamp-3">
                    {filteredPosts[0].excerpt}
                  </p>

                  <div className="flex items-center space-x-6 text-sm text-white/80 mb-6">
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
                    <button className="inline-flex items-center space-x-2 bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300">
                      <span>Read More</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Posts Grid */}
      <AnimatedSection animation="fadeInUp" delay={0.4} duration={0.8}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.slice(1).map((post, index) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                >
                  {/* Image */}
                  <Link href={getLocalizedUrl(post.slug)}>
                      <div className="relative h-48 overflow-hidden bg-orange-500">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-white/30" />
                        </div>
                      )}

                      {post.featured && (
                        <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          Featured
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                        {post.category || 'Uncategorized'}
                      </span>
                    </div>

                    <Link href={getLocalizedUrl(post.slug)}>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {post.title}
                      </h3>
                    </Link>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(post.publishDate)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    <Link href={getLocalizedUrl(post.slug)}>
                      <button className="w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 transition-all duration-300 flex items-center justify-center space-x-2">
                        <span>Read Article</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AnimatedSection>
    </div>
  );
}

