'use client';

import { Star, Quote, ChevronLeft, ChevronRight, MessageSquare, MapPin } from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import AnimatedSection from './AnimatedSection';

interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
  image?: string;
  packageName?: string;
  location?: string;
  status?: string;
  featured?: boolean;
  createdAt?: string;
}

interface TestimonialSectionProps {
  overrideContent?: {
    title?: string;
    subtitle?: string;
    description?: string;
    displayCount?: number;
    featuredOnly?: boolean;
    sortBy?: string;
  };
}

const TestimonialSection = ({ overrideContent }: TestimonialSectionProps) => {
  const { t, currentLanguage } = useLanguage();
  const [sectionContent, setSectionContent] = useState<any>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sectionRes = await fetch(`/api/sections?section=testimonials&language=${currentLanguage}`);
        const sectionData = await sectionRes.json();
        if (sectionData.success) {
          setSectionContent(sectionData.data);
        }

        const displayCount = sectionData.data?.displayCount || 9; // Increased default count
        const featuredOnly = sectionData.data?.featuredOnly || false;
        const sortBy = sectionData.data?.sortBy || 'newest';

        const queryParams = new URLSearchParams();
        queryParams.append('status', 'approved');
        if (featuredOnly) queryParams.append('featured', 'true');
        if (currentLanguage !== 'id') queryParams.append('language', currentLanguage);

        const testimonialsRes = await fetch(`/api/testimonials?${queryParams.toString()}`);
        const testimonialsData = await testimonialsRes.json();

        if (testimonialsData.success) {
          let items = testimonialsData.data;

          if (sortBy === 'newest') {
            items = items.sort((a: Testimonial, b: Testimonial) =>
              new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
            );
          } else if (sortBy === 'oldest') {
            items = items.sort((a: Testimonial, b: Testimonial) =>
              new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime()
            );
          } else if (sortBy === 'rating') {
            items = items.sort((a: Testimonial, b: Testimonial) =>
              (b.rating || 0) - (a.rating || 0)
            );
          }

          setTestimonials(items.slice(0, displayCount));
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      }
    };

    if (!overrideContent) {
      fetchData();
    }
  }, [overrideContent, currentLanguage]);

  const content = useMemo(() => {
    return {
      title: overrideContent?.title || sectionContent?.title || t('testimonials.title'),
      subtitle: overrideContent?.subtitle || sectionContent?.subtitle || 'TESTIMONIALS',
      description: overrideContent?.description || sectionContent?.description || '',
      testimonials: testimonials
    };
  }, [overrideContent, sectionContent, testimonials, t]);

  if (content.testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-20 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
          <AnimatedSection animation="fadeInUp">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {content.title}
            </h2>
            <div 
              className="text-base md:text-lg text-slate-600 max-w-2xl [&>p]:mb-2 last:[&>p]:mb-0"
              dangerouslySetInnerHTML={{ __html: content.description || 'See what our travelers are saying about their experiences.' }}
            />
          </AnimatedSection>
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {content.testimonials.map((item, index) => (
            <AnimatedSection
              key={item.id}
              animation="fadeInUp"
              delay={index * 0.1}
              className="break-inside-avoid"
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group">
                {/* Header: User Info */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-bold text-slate-400 bg-slate-50">
                        {item.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="text-orange-600 font-medium">{item.role || 'Traveler'}</span>
                      {item.location && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" />
                            {item.location}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < (item.rating || 5)
                          ? 'text-orange-400 fill-orange-400'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Content */}
                <div className="relative mb-5">
                  <p className="text-slate-600 leading-relaxed text-sm relative z-10">
                    "{item.content}"
                  </p>
                </div>

                {/* Package Tag (if available) */}
                {item.packageName && (
                  <div className="pt-5 border-t border-slate-50">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 text-[10px] font-bold text-slate-900 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      {item.packageName}
                    </span>
                  </div>
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
