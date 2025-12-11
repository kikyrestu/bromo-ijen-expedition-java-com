'use client';

import React, { useState, useEffect } from 'react';
import { Compass, ArrowRight, Globe, Map } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedSection from './AnimatedSection';
import Link from 'next/link';

interface WhoAmISectionProps {
  overrideContent?: any;
  whyOverrideContent?: any;
  disableAuto?: boolean;
}

const WhoAmISection: React.FC<WhoAmISectionProps> = ({ 
  overrideContent, 
  whyOverrideContent, 
  disableAuto = false 
}) => {
  const { currentLanguage, t } = useLanguage();
  const [fetchedContent, setFetchedContent] = useState<any>(null);

  useEffect(() => {
    if (overrideContent) return;
    const run = async () => {
      try {
        const res = await fetch(`/api/sections?section=whoAmI&language=${currentLanguage}`);
        const json = await res.json();
        if (json?.success && json?.data) {
          setFetchedContent(json.data);
        }
      } catch (e) {
        // silent fail
      }
    };
    run();
  }, [overrideContent, currentLanguage]);

  const content = overrideContent || fetchedContent || {
    subtitle: 'Discover',
    title: "Discover the World's Hidden Wonders",
    description: "Find the unique moments and hidden gems that ignite unforgettable experiences. From rare encounters to remarkable destinations, we help you uncover the spark that turns every trip into a cherished story.",
    buttonText: 'Plan your trip',
    ctaLink: '/packages',
    stats: [
      { value: '12+', label: 'Years Experience' },
      { value: '500+', label: 'Destinations' },
      { value: '50k+', label: 'Happy Travelers' }
    ],
    image: '/assets/bromo-sunrise.jpg'
  };

  // Ensure stats is an array
  const stats = Array.isArray(content.stats) && content.stats.length > 0 
    ? content.stats 
    : [
        { value: '12+', label: 'Years Experience' },
        { value: '500+', label: 'Destinations' },
        { value: '50k+', label: 'Happy Travelers' }
      ];

  return (
    <section id="about" className="relative py-16 md:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          
          {/* Left Column: Text Content */}
          <AnimatedSection animation="fadeInUp" duration={0.8} className="order-2 lg:order-1">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-[1px] bg-orange-600"></span>
                <span className="text-sm font-bold text-orange-600 uppercase tracking-widest">
                  {content.subtitle || 'Discover'}
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-[1.1] mb-6 tracking-tight">
                {content.title || "Discover the World's Hidden Wonders"}
              </h2>

              <div 
                className="text-base md:text-lg text-slate-600 leading-relaxed mb-8 font-light [&>p]:mb-4 last:[&>p]:mb-0"
                dangerouslySetInnerHTML={{ __html: content.description }}
              />

              <div className="flex flex-wrap gap-3">
                <Link 
                  href={content.ctaLink || '/packages'}
                  className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-full font-medium transition-all hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-600/20 group text-sm md:text-base"
                >
                  <span>{content.buttonText || 'Plan your trip'}</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link 
                  href="/about"
                  className="inline-flex items-center justify-center px-6 py-3 bg-slate-50 text-slate-900 rounded-full font-medium transition-all hover:bg-slate-100 text-sm md:text-base"
                >
                  Learn More
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 md:gap-8 mt-10 pt-8 border-t border-slate-100">
                {stats.map((stat: any, index: number) => (
                  <div key={index}>
                    <p className="text-2xl md:text-3xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs md:text-sm text-slate-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Right Column: Image Grid */}
          <AnimatedSection animation="fadeInLeft" delay={0.2} duration={0.8} className="order-1 lg:order-2">
            <div className="grid grid-cols-2 gap-3 md:gap-4 h-[400px] md:h-[500px]">
              {/* Large Vertical Image */}
              <div className="relative rounded-2xl overflow-hidden row-span-2 group">
                <img 
                  src={content.image || "/assets/bromo-sunrise.jpg"} 
                  alt="Main Feature"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=2071&auto=format&fit=crop' }}
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
              </div>

              {/* Top Small Image */}
              <div className="relative rounded-2xl overflow-hidden group">
                <img 
                  src="/assets/ijen-crater.jpg" 
                  alt="Secondary Feature"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80' }}
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
              </div>

              {/* Bottom Small Image with Decoration */}
              <div className="relative rounded-2xl overflow-hidden bg-orange-100 flex items-center justify-center group">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="text-center p-4 relative z-10">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm text-orange-600">
                    <Globe className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-slate-900 text-sm">Global Reach</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Connecting you to the world</p>
                </div>
              </div>
            </div>
          </AnimatedSection>

        </div>
      </div>
    </section>
  );
};

export default WhoAmISection;
