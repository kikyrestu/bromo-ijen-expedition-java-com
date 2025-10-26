'use client';

import { Star, Quote, ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [sectionContent, setSectionContent] = useState<any>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch section metadata (title, subtitle, display settings)
        const sectionRes = await fetch(`/api/sections?section=testimonials&language=${currentLanguage}`);
        const sectionData = await sectionRes.json();
        if (sectionData.success) {
          setSectionContent(sectionData.data);
        }

        // Build query params based on section settings
        const displayCount = sectionData.data?.displayCount || 3;
        const featuredOnly = sectionData.data?.featuredOnly || false;
        const sortBy = sectionData.data?.sortBy || 'newest';

        // Fetch actual testimonials from /api/testimonials (approved only)
        const queryParams = new URLSearchParams();
        queryParams.append('status', 'approved'); // Only show approved testimonials
        if (featuredOnly) queryParams.append('featured', 'true');
        if (currentLanguage !== 'id') queryParams.append('language', currentLanguage);

        const testimonialsRes = await fetch(`/api/testimonials?${queryParams.toString()}`);
        const testimonialsData = await testimonialsRes.json();

        if (testimonialsData.success) {
          let items = testimonialsData.data;

          // Apply sorting
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

          // Apply display count limit
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

  const nextTestimonial = () => {
    if (content.testimonials.length > 0) {
      setCurrentTestimonial((prev) => (prev + 1) % content.testimonials.length);
    }
  };

  const prevTestimonial = () => {
    if (content.testimonials.length > 0) {
      setCurrentTestimonial((prev) => (prev - 1 + content.testimonials.length) % content.testimonials.length);
    }
  };

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (content.testimonials.length <= 1) return;
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, [content.testimonials]);

  if (content.testimonials.length === 0) {
    return null; // Don't show section if no testimonials
  }

  const currentItem = content.testimonials[currentTestimonial] || content.testimonials[0];

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection animation="fadeInUp" delay={0.2} duration={0.8}>
          <div className="grid lg:grid-cols-2 gap-8 items-start mb-16">
          <div>
            {/* Subtitle */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Compass className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                {content.subtitle}
              </span>
            </div>

            {/* Main Title */}
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {content.title}
            </h2>
          </div>
          
          <div>
            {content.description && (
              <p className="text-lg text-gray-600 leading-relaxed">
                {content.description}
              </p>
            )}
          </div>
          </div>
        </AnimatedSection>

        {/* Testimonial Cards Grid */}
        <AnimatedSection animation="fadeInUp" delay={0.4} duration={0.8}>
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {content.testimonials.map((testimonial: Testimonial, index: number) => (
            <div key={testimonial.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4 mb-6">
                {/* Avatar */}
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {testimonial.image ? (
                    <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  {/* Name */}
                  <h4 className="text-lg font-bold text-gray-900 mb-1">
                    {testimonial.name}
                  </h4>
                  {/* Role */}
                  <p className="text-sm text-orange-600 font-medium">
                    {testimonial.role || 'Customer'}
                  </p>
                </div>

                {/* Quote Icon */}
                <div className="text-gray-300 text-4xl font-light">
                  "
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < (testimonial.rating || 5)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-gray-700 leading-relaxed">
                {testimonial.content}
              </blockquote>

              {/* Package Name */}
              {testimonial.packageName && (
                <p className="text-sm text-gray-500 mt-4 italic">
                  Package: {testimonial.packageName}
                </p>
              )}
            </div>
          ))}
        </div>
        </AnimatedSection>

        {/* Dots Indicator */}
        {content.testimonials.length > 1 && (
          <div className="flex justify-center space-x-2">
            {content.testimonials.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  index === currentTestimonial ? 'bg-orange-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialSection;
