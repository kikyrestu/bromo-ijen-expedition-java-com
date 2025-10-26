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
  SlidersHorizontal
} from 'lucide-react';

interface TourPackage {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  price: number;
  originalPrice?: number;
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
          return a.price - b.price;
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
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                {t('packages.title') || 'Tour Packages'}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
                {t('packages.description') || 'Discover amazing destinations with our carefully crafted tour packages'}
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
                  placeholder={t('packages.searchPlaceholder') || 'Search packages...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                          selectedCategory === category.id
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                >
                  <option value="name">Name</option>
                  <option value="price">Price (Low to High)</option>
                  <option value="rating">Rating (High to Low)</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              Found {filteredPackages.length} package{filteredPackages.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Packages Grid */}
      <AnimatedSection animation="fadeInUp" delay={0.3} duration={0.8}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {filteredPackages.length === 0 ? (
            <div className="text-center py-20">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No packages found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPackages.map((pkg, index) => (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                >
                  {/* Image */}
                  <Link href={getLocalizedUrl(pkg.slug)}>
                      <div className="relative h-48 overflow-hidden bg-orange-500">
                      {pkg.image ? (
                        <img
                          src={pkg.image}
                          alt={pkg.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Mountain className="w-16 h-16 text-white/50" />
                        </div>
                      )}
                      
                      {/* Price Badge */}
                      <div className="absolute top-4 left-4 bg-white text-orange-600 px-3 py-1 rounded-full font-bold text-sm">
                        {formatPrice(pkg.price)}
                      </div>

                      {/* Rating Badge */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
                        <span className="text-sm font-semibold text-gray-900">{pkg.rating}</span>
                      </div>

                      {/* Discount Badge */}
                      {pkg.originalPrice && (
                        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          {Math.round((1 - pkg.price / pkg.originalPrice) * 100)}% OFF
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-6">
                    <Link href={getLocalizedUrl(pkg.slug)}>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                        {pkg.title}
                      </h3>
                    </Link>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {pkg.description}
                    </p>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="text-sm">{pkg.duration}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">{pkg.destinations?.join(', ') || 'Various destinations'}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span className="text-sm">{pkg.reviewCount} reviews</span>
                      </div>
                    </div>

                    {/* Features */}
                    {pkg.features && pkg.features.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {pkg.features.slice(0, 3).map((feature, idx) => (
                            <span key={idx} className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA Button */}
                    <Link href={getLocalizedUrl(pkg.slug)}>
                      <button className="w-full bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700 transition-all duration-300 flex items-center justify-center space-x-2">
                        <span>View Details</span>
                        <ChevronRight className="w-5 h-5" />
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

