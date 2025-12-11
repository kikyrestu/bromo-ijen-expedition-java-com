'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedSection from './AnimatedSection';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  Calendar,
  Mountain,
  Flame,
  Map,
  ChevronRight,
  SlidersHorizontal,
  Compass,
  Tag,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourPackage {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  price: string | number;
  priceRaw: number;
  originalPrice?: string | number;
  originalPriceRaw?: number;
  rating: number;
  reviewCount: number;
  image: string;
  destinations: string[];
  features: string[];
}

interface TourPackagesClientProps {
  lang: string;
}

export default function TourPackagesClient({ lang }: TourPackagesClientProps) {
  const { t, currentLanguage } = useLanguage();
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'name'>('name');

  const categories = [
    { id: 'all', name: 'All Packages', icon: SlidersHorizontal },
    { id: 'bromo', name: 'Bromo Tours', icon: Mountain },
    { id: 'ijen', name: 'Ijen Tours', icon: Flame },
    { id: 'combo', name: 'Combo Tours', icon: Map }
  ];

  useEffect(() => {
    fetchPackages();
  }, [currentLanguage]);

  useEffect(() => {
    filterAndSortPackages();
  }, [packages, searchQuery, selectedCategory, sortBy]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (currentLanguage !== 'id') queryParams.append('language', currentLanguage);
      
      const response = await fetch(`/api/packages?${queryParams.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setPackages(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPackages = () => {
    let filtered = [...packages];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(pkg => 
        pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(pkg => 
        pkg.category.toLowerCase() === selectedCategory
      );
    }

    // Sort packages
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (a.priceRaw || 0) - (b.priceRaw || 0);
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.title.localeCompare(b.title);
      }
    });

    setFilteredPackages(filtered);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getLocalizedUrl = (slug: string) => {
    if (currentLanguage === 'id') return `/packages/${slug}`;
    return `/${currentLanguage}/packages/${slug}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 pb-20 font-sans selection:bg-orange-500/30">
      {/* Hero Section */}
      <div className="relative pt-40 pb-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center opacity-10 fixed-bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 via-gray-50/90 to-gray-50" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        
        {/* Decorative Blobs */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-orange-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] animate-pulse delay-1000" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-orange-600 text-sm font-medium mb-8">
              <Compass className="w-4 h-4 animate-spin-slow" />
              <span className="tracking-wide uppercase text-xs font-bold">{t('packages.subtitle') || 'Explore Indonesia'}</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-slate-900">
              {t('packages.title') || 'Tour Packages'}
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
              {t('packages.description') || 'Discover amazing destinations with our carefully crafted tour packages'}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="sticky top-24 z-40 mb-16"
        >
          <div className="p-2 rounded-[2rem] bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="flex flex-col lg:flex-row gap-4 p-2">
              {/* Search */}
              <div className="relative flex-grow group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder={t('packages.searchPlaceholder') || 'Search packages...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 rounded-full bg-slate-50 border border-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-orange-500/50 transition-all"
                />
              </div>

              {/* Categories */}
              <div className="flex overflow-x-auto pb-2 lg:pb-0 gap-2 no-scrollbar items-center">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                        selectedCategory === category.id
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sort */}
              <div className="relative min-w-[180px]">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full appearance-none px-5 py-3 rounded-full bg-slate-50 border border-transparent text-slate-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-orange-500/50 transition-all cursor-pointer"
                >
                  <option value="name" className="bg-white text-slate-900">Sort by Name</option>
                  <option value="price" className="bg-white text-slate-900">Price (Low to High)</option>
                  <option value="rating" className="bg-white text-slate-900">Rating (High to Low)</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link 
                  href={getLocalizedUrl(pkg.slug)}
                  className="group flex flex-col h-full bg-white border border-slate-200 rounded-[2rem] overflow-hidden hover:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 hover:-translate-y-2"
                >
                  {/* Image Container */}
                  <div className="relative h-72 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
                    {pkg.image ? (
                      <img
                        src={pkg.image}
                        alt={pkg.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <Mountain className="w-16 h-16 text-slate-300" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                      <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/20 text-slate-900 text-xs font-medium flex items-center gap-1.5 w-fit shadow-sm">
                        <MapPin className="w-3 h-3 text-orange-500" />
                        {pkg.destinations?.[0] || 'Indonesia'}
                      </span>
                      {pkg.originalPriceRaw && pkg.priceRaw && (
                        <span className="px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-bold w-fit shadow-sm">
                          {Math.round((1 - pkg.priceRaw / pkg.originalPriceRaw) * 100)}% OFF
                        </span>
                      )}
                    </div>

                    <div className="absolute top-4 right-4 z-20">
                      <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/20 text-slate-900 text-xs font-bold flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                        {pkg.rating}
                      </span>
                    </div>

                    {/* Price Overlay */}
                    <div className="absolute bottom-4 left-4 z-20">
                      <p className="text-xs text-white/80 mb-0.5 font-medium">Starting from</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-white">{formatPrice(pkg.priceRaw)}</span>
                        {pkg.originalPriceRaw && (
                          <span className="text-sm text-white/60 line-through decoration-orange-500/50">
                            {formatPrice(pkg.originalPriceRaw)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-grow p-8">
                    <h3 className="text-2xl font-bold mb-3 text-slate-900 group-hover:text-orange-600 transition-colors leading-tight">
                      {pkg.title}
                    </h3>
                    
                    <p className="text-slate-600 text-sm line-clamp-2 mb-6 leading-relaxed">
                      {pkg.description}
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span>{pkg.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="w-4 h-4 text-orange-500" />
                        <span>{pkg.reviewCount} reviews</span>
                      </div>
                    </div>

                    {/* Features Tags */}
                    {pkg.features && pkg.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-8">
                        {pkg.features.slice(0, 3).map((feature, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-600">
                            {feature}
                          </span>
                        ))}
                        {pkg.features.length > 3 && (
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-600">
                            +{pkg.features.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* CTA */}
                    <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between group/btn">
                      <span className="text-sm font-medium text-slate-500 group-hover/btn:text-orange-600 transition-colors">
                        View Itinerary
                      </span>
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

        {filteredPackages.length === 0 && (
          <div className="text-center py-32">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 mb-6 border border-slate-200">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No packages found</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              We couldn't find any packages matching your search. Try adjusting your filters or search terms.
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
    </div>
  );
}

