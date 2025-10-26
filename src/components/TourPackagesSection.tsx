'use client';

import { Calendar, Users, Clock, Star, CheckCircle, ArrowRight, Compass, Mountain, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedSection from './AnimatedSection';

interface Package {
  id: string;
  slug?: string; // SEO-friendly URL slug
  name: string;
  price: string;
  priceUnit: string;
  description: string;
  rating: number;
  reviews: string;
  image: string;
  duration: string;
  highlights: string[];
  featured?: boolean;
  category?: string;
}

interface SectionContent {
  title?: string;
  subtitle?: string;
  description?: string;
  displayCount?: number;
  featuredOnly?: boolean;
  category?: string;
  sortBy?: string;
}

interface TourPackagesSectionProps {
  overrideContent?: SectionContent;
  publishedOnly?: boolean; // Force filter published only (for CMS preview)
}

const TourPackagesSection = ({ overrideContent, publishedOnly = false }: TourPackagesSectionProps) => {
  const { t, currentLanguage } = useLanguage();
  const [packages, setPackages] = useState<Package[]>([]);
  const [sectionContent, setSectionContent] = useState<SectionContent>({});
  const [loading, setLoading] = useState(true);

  const sanitizeHtml = (html: string) => {
    if (!html) return '';
    // remove script tags
    let out = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
    // remove on* attributes
    out = out.replace(/ on\w+="[^"]*"/gi, '');
    out = out.replace(/ on\w+='[^']*'/gi, '');
    return out;
  };

  useEffect(() => {
    fetchData();
  }, [currentLanguage]);

  const fetchData = async () => {
    try {
      // Fetch packages from API
      // If publishedOnly=true (CMS preview), only fetch published
      // Otherwise, check if it's admin view to include all
      const isAdminView = !publishedOnly && typeof window !== 'undefined' && window.location.pathname.includes('/cms');
      const packagesUrl = `/api/packages${isAdminView ? '?includeAll=true' : ''}${currentLanguage !== 'id' ? `${isAdminView ? '&' : '?'}language=${currentLanguage}` : ''}`;
      const packagesRes = await fetch(packagesUrl);
      const packagesData = await packagesRes.json();

      // Fetch section content
      const sectionRes = await fetch(`/api/sections?section=tourPackages&language=${currentLanguage}`);
      const sectionData = await sectionRes.json();

      if (packagesData.success) {
        let filteredPackages = packagesData.data;

        // Apply filters from section content or override
        const content = overrideContent || sectionData.data;
        setSectionContent(content);

        if (content?.featuredOnly) {
          filteredPackages = filteredPackages.filter((pkg: Package) => pkg.featured);
        }

        if (content?.category && content.category !== 'all') {
          filteredPackages = filteredPackages.filter((pkg: Package) => pkg.category === content.category);
        }

        // Apply sorting
        if (content?.sortBy === 'rating') {
          filteredPackages.sort((a: Package, b: Package) => b.rating - a.rating);
        } else if (content?.sortBy === 'popular') {
          filteredPackages.sort((a: Package, b: Package) => parseInt(b.reviews) - parseInt(a.reviews));
        }

        // Apply display count limit
        if (content?.displayCount && content.displayCount > 0) {
          filteredPackages = filteredPackages.slice(0, content.displayCount);
        }

        setPackages(filteredPackages);
      }
    } catch (error) {
      console.error('Error fetching tour packages data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="packages" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading tour packages...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="packages" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection animation="fadeInUp" delay={0.2} duration={0.8}>
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-3">
                {sectionContent?.title || t('packages.title')}
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl">
                {sectionContent?.description || 'Explore our carefully curated tour packages designed to give you the best experience.'}
              </p>
            </div>
            <Link href={currentLanguage === 'id' ? '/packages' : `/${currentLanguage}/packages`} className="hidden lg:block text-orange-600 hover:text-orange-700 font-semibold">
              View all tours →
            </Link>
          </div>
        </AnimatedSection>

        {/* Packages Grid 2x2 - Modern Card Design */}
        <AnimatedSection animation="fadeInUp" delay={0.4} duration={0.8}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {packages.map((pkg) => (
            <Link key={pkg.id} href={`/${currentLanguage === 'id' ? '' : currentLanguage}/packages/${pkg.slug || pkg.id}`} className="group block">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                {/* Image Full Width */}
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  {pkg.image ? (
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-600 rounded-lg mb-2 flex items-center justify-center mx-auto">
                          <Mountain className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
                        </div>
                        <p className="text-xs">No Image</p>
                      </div>
                    </div>
                  )}

                  {/* Heart Icon Top Right */}
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>

                  {/* Play Icon Bottom Left */}
                  <div className="absolute bottom-3 left-3 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Category Badge */}
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase">{pkg.category || 'TOUR'}</span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{pkg.name}</h3>

                  {/* Location & Duration */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-xs">Location</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs">{pkg.duration}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {pkg.description.replace(/<[^>]*>/g, '').substring(0, 80)}...
                  </p>

                  {/* Rating & Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">5</span>
                      <span className="text-xs text-gray-500">({pkg.reviews})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">from</span>
                      <div className="text-lg font-bold text-gray-900">{pkg.price}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default TourPackagesSection;