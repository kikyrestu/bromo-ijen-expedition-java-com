'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { Mountain, Flame, Sunrise, MapPin, Star, Users, ArrowUpRight, Compass } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedSection from './AnimatedSection';

interface ExclusiveDestItem {
  id?: string;
  name: string;
  location?: string;
  description?: string;
  image?: string;
  featured?: boolean;
  // for legacy static items
  icon?: ReactElement;
  type?: 'image' | 'feature';
  rating?: number;
  reviews?: number;
  tours?: number;
}

interface ExclusiveDestContent {
  title?: string;
  subtitle?: string;
  description?: string;
  destinations?: ExclusiveDestItem[];
}

interface DestinasiEksklusifSectionProps {
  overrideContent?: ExclusiveDestContent;
  disableAuto?: boolean;
}

const DestinasiEksklusifSection = ({ overrideContent }: DestinasiEksklusifSectionProps) => {
  const { t, currentLanguage } = useLanguage();
  const [fetched, setFetched] = useState<ExclusiveDestContent | null>(null);

  useEffect(() => {
    if (overrideContent) return;
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch(`/api/sections?section=exclusiveDestinations&language=${currentLanguage}`);
        const json = await res.json();
        if (!cancelled && json?.success && json?.data) {
          const d = json.data as any;
          setFetched({
            title: d.title || 'Exclusive Destinations',
            subtitle: d.subtitle || 'Discover Bromo Ijen Wonders',
            description: d.description || '',
            destinations: Array.isArray(d.destinations) ? d.destinations.map((it: any) => ({
              id: it.id || undefined,
              name: it.name || '',
              location: it.location || '',
              description: it.description || '',
              image: it.image || '',
              featured: Boolean(it.featured),
              tours: typeof it.tours === 'number' ? it.tours : undefined
            })) : []
          });
        }
      } catch {
        // silent
      }
    };
    run();
    return () => { cancelled = true; };
  }, [overrideContent, currentLanguage]);

  // No static content - all data from database only

  const content: ExclusiveDestContent = useMemo(() => {
    return overrideContent || fetched || {
      title: 'Exclusive Destinations',
      subtitle: 'Next Adventure Destination', 
      description: 'Explore our carefully curated destinations that showcase the best of East Java',
      destinations: []
    };
  }, [overrideContent, fetched]);

  return (
    <section id="destinasi" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection animation="fadeInUp" delay={0.2} duration={0.8}>
          <div className="text-center mb-16">
            <p className="text-lg text-orange-600 mb-4">{content.subtitle || 'Next Adventure Destination'}</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {content.title || 'Exclusive Destinations'}
            </h2>
            {content.description ? (
              <div
                className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed [&_p]:m-0"
                dangerouslySetInnerHTML={{ __html: (content.description || '') }}
              />
            ) : (
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Explore our carefully curated destinations that showcase the best of East Java
              </p>
            )}
          </div>
        </AnimatedSection>

        {/* Responsive Grid Layout - hero-like masonry (first spans 2 cols) */}
        <AnimatedSection animation="scaleIn" delay={0.4} duration={1.0}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {(content.destinations && content.destinations.length > 0 ? content.destinations : []).slice(0,5).map((dest, index) => (
              <div key={(dest as any).id || `dest-${index}`} className={`group ${index === 0 ? 'md:col-span-2' : ''}`}>
                {dest.type === 'feature' ? (
                  // Feature Cards (purple-like)
                  <div className={`relative bg-orange-600 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-56 ${index === 0 || index === 1 ? 'md:h-[360px]' : 'md:h-[260px]'}`}>
                    {(dest as any).tours ? (
                      <div className="absolute top-3 right-3 z-20">
                        <span className="px-2 py-1 text-[11px] font-semibold bg-rose-500 text-white rounded-md shadow">{(dest as any).tours} tours</span>
                      </div>
                    ) : null}
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-16 h-16 bg-gray-600 rounded-lg mb-2 mx-auto flex items-center justify-center">
                          {dest.icon}
                        </div>
                        <p className="text-sm font-medium">{dest.name}</p>
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 opacity-20">
                      <Compass className="w-8 h-8 text-white" />
                    </div>
                    <div className="relative p-4 sm:p-6 flex flex-col justify-center h-full">
                      <div className="flex justify-center mb-3 sm:mb-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-white rounded-full flex items-center justify-center">
                          {dest.icon}
                        </div>
                      </div>
                      <h3 className="text-white font-bold text-base sm:text-lg text-center mb-3 sm:mb-4">
                        {dest.name}
                      </h3>
                      <p className="text-white/90 text-xs sm:text-sm text-center leading-relaxed">
                        {dest.description}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Image Cards
                  <div className={`relative bg-gray-100 rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${(index === 0 || index === 1) ? 'h-64 md:h-[360px]' : 'h-56 md:h-[260px]' }`}>
                    {/* Image */}
                    {dest.image ? (
                      <img src={dest.image} alt={dest.name} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="w-16 h-16 bg-gray-600 rounded-lg mb-2 mx-auto flex items-center justify-center">
                            {dest.icon || <MapPin className="w-6 h-6 text-gray-300" />}
                          </div>
                          <p className="text-xs font-medium">{dest.name}</p>
                        </div>
                      </div>
                    )}

                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-500"></div>

                    {/* Tours Badge */}
                    {(dest as any).tours ? (
                      <div className="absolute top-3 right-3 z-20">
                        <span className="px-2 py-1 text-[11px] font-semibold bg-rose-500 text-white rounded-md shadow">{(dest as any).tours} tours</span>
                      </div>
                    ) : null}

                    {/* Content - always visible name like screenshot */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end z-10 opacity-100 transition-opacity duration-500">
                      {/* Destination Name */}
                      <h3 className="font-bold text-white mb-2 text-lg drop-shadow">
                        {dest.name}
                      </h3>
                      
                      {/* Location */}
                      {dest.location && (
                        <p className="text-white/90 mb-3 text-sm">
                          {dest.location}
                        </p>
                      )}

                      {/* Description */}
                      {dest.description && (
                        <p className="text-white/80 text-sm leading-relaxed mb-4">
                          {dest.description}
                        </p>
                      )}

                      {/* Rating */}
                      {(dest.rating && dest.reviews) ? (
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-white/90 text-sm">
                            {dest.rating} ({dest.reviews})
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default DestinasiEksklusifSection;