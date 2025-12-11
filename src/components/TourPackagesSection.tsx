'use client';

import { Calendar, Users, Clock, Star, MapPin, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import Image from 'next/image';
import AnimatedSection from './AnimatedSection';

interface Package {
  id: string;
  slug?: string;
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
  location?: string;
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
  publishedOnly?: boolean;
}

const TourPackagesSection = ({ overrideContent, publishedOnly = false }: TourPackagesSectionProps) => {
  const { t, currentLanguage } = useLanguage();
  const [packages, setPackages] = useState<Package[]>([]);
  const [sectionContent, setSectionContent] = useState<SectionContent>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [currentLanguage]);

  const fetchData = async () => {
    try {
      const isAdminView = !publishedOnly && typeof window !== 'undefined' && window.location.pathname.includes('/cms');
      const packagesUrl = `/api/packages${isAdminView ? '?includeAll=true' : ''}${currentLanguage !== 'id' ? `${isAdminView ? '&' : '?'}language=${currentLanguage}` : ''}`;
      const packagesRes = await fetch(packagesUrl);
      const packagesData = await packagesRes.json();

      const sectionRes = await fetch(`/api/sections?section=tourPackages&language=${currentLanguage}`);
      const sectionData = await sectionRes.json();

      if (packagesData.success) {
        let filteredPackages = packagesData.data;
        const content = overrideContent || sectionData.data;
        setSectionContent(content);

        if (content?.featuredOnly) {
          filteredPackages = filteredPackages.filter((pkg: Package) => pkg.featured);
        }

        if (content?.category && content.category !== 'all') {
          filteredPackages = filteredPackages.filter((pkg: Package) => pkg.category === content.category);
        }

        if (content?.sortBy === 'rating') {
          filteredPackages.sort((a: Package, b: Package) => b.rating - a.rating);
        } else if (content?.sortBy === 'popular') {
          filteredPackages.sort((a: Package, b: Package) => parseInt(b.reviews) - parseInt(a.reviews));
        }

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
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
          <AnimatedSection animation="fadeInUp">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {sectionContent?.title || t('packages.title')}
            </h2>
            <div 
              className="text-base md:text-lg text-slate-600 max-w-2xl [&>p]:mb-2 last:[&>p]:mb-0"
              dangerouslySetInnerHTML={{ __html: sectionContent?.description || 'Discover our most popular adventures and create unforgettable memories.' }}
            />
          </AnimatedSection>

          <AnimatedSection animation="fadeInLeft" delay={0.2}>
            <Link 
              href={currentLanguage === 'id' ? '/packages' : `/${currentLanguage}/packages`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 bg-white text-slate-900 font-medium hover:bg-slate-50 transition-colors text-sm"
            >
              View all packages
            </Link>
          </AnimatedSection>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {packages.map((pkg, index) => (
            <AnimatedSection
              key={pkg.id}
              animation="fadeInUp"
              delay={index * 0.1}
            >
              <Link 
                href={`${currentLanguage === 'id' ? '' : `/${currentLanguage}`}/packages/${pkg.slug || pkg.id}`}
                className="group block h-full bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-slate-100 animate-pulse" />
                  {pkg.image && (
                    <Image
                      src={pkg.image}
                      alt={pkg.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      unoptimized
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold text-slate-900 shadow-sm uppercase tracking-wider">
                      {pkg.category || 'TOUR'}
                    </span>
                    {pkg.featured && (
                      <span className="px-3 py-1 rounded-full bg-orange-500 text-[10px] font-bold text-white shadow-sm uppercase tracking-wider">
                        FEATURED
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{pkg.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                      <span className="font-bold text-slate-900">5.0</span>
                      <span>({pkg.reviews})</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                    {pkg.name}
                  </h3>

                  <p className="text-slate-600 text-sm line-clamp-2 mb-5 leading-relaxed">
                    {pkg.description.replace(/<[^>]*>/g, '')}
                  </p>

                  <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                    <div>
                      <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">Starts from</div>
                      <div className="text-lg font-bold text-slate-900">
                        {pkg.price}
                      </div>
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
      </div>
    </section>
  );
};

export default TourPackagesSection;
