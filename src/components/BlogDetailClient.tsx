'use client';

import { useState, use, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/static-translations';
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
  ArrowRight,
  ChevronRight,
  Facebook,
  Twitter,
  Linkedin,
  Copy
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

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
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.1]);

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog?.title,
          text: blog?.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-slate-900">
        <div className="text-center max-w-md px-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-200 shadow-sm">
            <BookOpen className="w-10 h-10 text-slate-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-slate-900">{t('blogNotFound', currentLanguage)}</h1>
          <p className="text-slate-600 mb-8">The blog post you're looking for doesn't exist or has been moved.</p>
          <Link 
            href={getLocalizedUrl('/blog')}
            className="inline-flex items-center px-8 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors font-medium shadow-lg shadow-orange-500/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToBlog', currentLanguage)}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 pb-20 font-sans selection:bg-orange-500/30">
      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-orange-500 z-50 origin-left"
        style={{ scaleX: useScroll().scrollYProgress }}
      />

      {/* Hero Section with Parallax */}
      <div className="relative h-[85vh] overflow-hidden">
        <motion.div 
          style={{ y, scale }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-900/60 to-slate-900/90 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 via-transparent to-slate-900/50 z-10" />
          {blog.image ? (
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
              <BookOpen className="w-32 h-32 text-slate-400" />
            </div>
          )}
        </motion.div>

        <motion.div 
          style={{ opacity }}
          className="absolute inset-0 z-20 flex flex-col justify-end pb-32 px-6"
        >
          <div className="max-w-4xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <Link 
                  href={getLocalizedUrl('/blog')}
                  className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back
                </Link>
                <span className="px-4 py-1.5 rounded-full bg-orange-500 text-white text-sm font-bold uppercase tracking-wider shadow-lg shadow-orange-500/20">
                  {blog.category || t('uncategorized', currentLanguage)}
                </span>
                {blog.featured && (
                  <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium flex items-center gap-2">
                    <Heart className="w-3 h-3 fill-white" />
                    {t('featured', currentLanguage)}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight drop-shadow-2xl">
                {blog.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-white/90 text-sm md:text-base">
                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                    {blog.author.charAt(0)}
                  </div>
                  <span className="font-medium">{blog.author}</span>
                </div>
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  <span>{formatDate(blog.publishDate)}</span>
                </div>
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span>{blog.readTime}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Content Section */}
      <div className="relative z-30 -mt-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white border border-slate-200 rounded-3xl p-8 md:p-16 shadow-xl relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />
            
            {/* Excerpt */}
            {blog.excerpt && (
              <div className="relative mb-16">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-orange-500/0 rounded-full" />
                <p className="pl-8 text-xl md:text-2xl text-slate-700 leading-relaxed font-light italic">
                  "{blog.excerpt}"
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between mb-16 pb-8 border-b border-slate-100">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`group flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300 ${
                  isLiked 
                    ? 'bg-red-50 text-red-500 border border-red-200' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${isLiked ? 'fill-current' : ''}`} />
                <span className="font-medium">
                  {isLiked ? 'Liked' : 'Like'}
                </span>
              </button>

              <div className="relative">
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-3 px-6 py-3 bg-slate-50 text-slate-600 rounded-full hover:bg-slate-100 border border-slate-200 transition-all duration-300"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="font-medium">{t('share', currentLanguage)}</span>
                </button>
                
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
                    <button className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                      <Facebook className="w-4 h-4" /> Facebook
                    </button>
                    <button className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                      <Twitter className="w-4 h-4" /> Twitter
                    </button>
                    <button className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                      <Linkedin className="w-4 h-4" /> LinkedIn
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        setShowShareMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 border-t border-slate-100"
                    >
                      <Copy className="w-4 h-4" /> Copy Link
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Blog Content */}
            <div 
              className="prose prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-slate-900 prose-headings:tracking-tight
                prose-h2:text-3xl md:prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:text-slate-900
                prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-6 prose-h3:text-orange-600
                prose-p:text-slate-600 prose-p:leading-loose prose-p:mb-8 prose-p:text-lg
                prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                prose-ul:my-8 prose-ul:space-y-4
                prose-li:text-slate-600 prose-li:marker:text-orange-500
                prose-strong:text-slate-900 prose-strong:font-semibold
                prose-img:rounded-3xl prose-img:shadow-xl prose-img:my-12 prose-img:border prose-img:border-slate-200
                prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:bg-orange-50 prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic prose-blockquote:text-slate-700
                prose-code:text-orange-600 prose-code:bg-slate-100 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-20 pt-10 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-6 text-slate-500">
                  <Tag className="w-5 h-5" />
                  <h3 className="text-lg font-medium">{t('tags', currentLanguage)}</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {blog.tags.map((tag: string, index: number) => (
                    <Link
                      key={index}
                      href={getLocalizedUrl(`/blog?tag=${tag}`)}
                      className="px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 text-sm font-medium rounded-full hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-all duration-300 hover:-translate-y-1"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Navigation Footer */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <Link 
              href={getLocalizedUrl('/blog')}
              className="group flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-colors px-8 py-4 rounded-full hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-lg">{t('backToBlog', currentLanguage)}</span>
            </Link>

            <Link 
              href={getLocalizedUrl('/packages')}
              className="group flex items-center gap-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-10 py-5 rounded-full font-bold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-1 transition-all duration-300"
            >
              <span className="text-lg">{t('bookTour', currentLanguage)}</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
