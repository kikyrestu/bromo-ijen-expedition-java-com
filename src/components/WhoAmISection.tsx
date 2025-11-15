'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Compass, Star, Users, Shield, Award, Phone, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedSection from './AnimatedSection';

interface WhoAmISectionProps {
  overrideContent?: any;
  whyOverrideContent?: any;
  disableAuto?: boolean;
}

// Utility function to strip HTML tags
const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

const WhoAmISection: React.FC<WhoAmISectionProps> = ({ 
  overrideContent, 
  whyOverrideContent, 
  disableAuto = false 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fetchedContent, setFetchedContent] = useState<any>(null);
  const [fetchedWhy, setFetchedWhy] = useState<any>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isLoadingWhy, setIsLoadingWhy] = useState(false);
  const { currentLanguage, t } = useLanguage();

  // Icon mapping
  const iconMap: { [key: string]: React.ReactNode } = {
    compass: <Compass className="w-6 h-6 text-orange-600" />,
    star: <Star className="w-6 h-6 text-orange-600" />,
    users: <Users className="w-6 h-6 text-orange-600" />,
    shield: <Shield className="w-6 h-6 text-orange-600" />,
    award: <Award className="w-6 h-6 text-orange-600" />,
  };

  // Build slides for both preview and live
  const contentSource = overrideContent || fetchedContent || null;
  const whySource = whyOverrideContent || fetchedWhy || null;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % mergedSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + mergedSlides.length) % mergedSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Fetch content from API when no override provided (for live site)
  useEffect(() => {
    if (overrideContent) return;

    let cancelled = false;
    const run = async () => {
      setIsLoadingContent(true);
      try {
        const res = await fetch(`/api/sections?section=whoAmI&language=${currentLanguage}`);
        const json = await res.json();
        if (json?.success && json?.data && !cancelled) {
          const d = json.data as any;
          setFetchedContent({
            header: d.subtitle || 'About',
            mainTitle: d.title || 'Section Title',
            description: d.description || '',
            image: d.image || '',
            buttonText: d.buttonText || '',
            ctaText: d.ctaText || '',
            ctaLink: d.ctaLink || '',
            features: Array.isArray(d.features) ? d.features.map((f: any) => ({
              icon: String(f.icon || ''),
              title: f.title || '',
              description: f.description || ''
            })) : [],
            stats: Array.isArray(d.stats) ? d.stats.map((s: any) => ({
              number: s.number || '',
              label: s.label || ''
            })) : []
          });
        }
      } catch (e) {
        // silent fail: fallback ke default slides
      } finally {
        if (!cancelled) {
          setIsLoadingContent(false);
        }
      }
    };
    run();
    return () => { cancelled = true; };
  }, [overrideContent, currentLanguage]);

  // Fetch why-choose-us when no override provided
  useEffect(() => {
    if (whyOverrideContent) return;

    let cancelled = false;
    const run = async () => {
      setIsLoadingWhy(true);
      try {
        const url = `/api/sections?section=whyChooseUs&language=${currentLanguage}`;
        const res = await fetch(url);
        const json = await res.json();
        
        if (json?.success && json?.data && !cancelled) {
          const d = json.data as any;
          const content = {
            header: d.subtitle || 'Why Choose Us',
            mainTitle: d.title || 'Why Choose Our Services',
            description: d.description || '',
            image: d.image || '',
            buttonText: d.buttonText || '',
            ctaText: d.ctaText || '',
            ctaLink: d.ctaLink || '',
            features: Array.isArray(d.features) ? d.features.map((f: any) => ({
              icon: String(f.icon || ''),
              title: f.title || '',
              description: f.description || ''
            })) : []
          };
          setFetchedWhy(content);
        }
      } catch (e) {
        console.error('WhyChooseUs fetch error:', e);
      } finally {
        if (!cancelled) {
          setIsLoadingWhy(false);
        }
      }
    };
    run();
    return () => { cancelled = true; };
  }, [whyOverrideContent, currentLanguage]);

  // Auto-slide functionality (disabled when override/content provided or disableAuto true)
  useEffect(() => {
    if (overrideContent || fetchedContent || disableAuto) return;
    const interval = setInterval(nextSlide, 8000);
    return () => clearInterval(interval);
  }, [overrideContent, fetchedContent, disableAuto]);

  const mergedSlides = [
    {
      id: 'who-am-i',
      title: 'Who Am I?',
      content: {
        header: contentSource?.header || 'About',
        mainTitle: contentSource?.mainTitle || 'About Our Company',
        description: stripHtmlTags(contentSource?.description || 'We are a professional tour and travel company with years of experience'),
        features: Array.isArray(contentSource?.features) && contentSource.features.length > 0
          ? contentSource.features.map((f: any) => ({
              icon: iconMap[(f.icon || '').toLowerCase()] || <Users className="w-6 h-6 text-gray-600" />,
              title: f.title, // Already translated by API
              description: f.description // Already translated by API
            }))
          : []
      }
    },
    {
      id: 'why-choose-us',
      title: 'Why Choose Us?',
      content: {
        header: whySource?.header || 'Why Choose Us',
        mainTitle: whySource?.mainTitle || 'Why Choose Our Services',
        description: stripHtmlTags(whySource?.description || 'We provide exceptional tour experiences with attention to detail'),
        features: Array.isArray(whySource?.features) && whySource.features.length > 0
          ? whySource.features.map((f: any) => ({
              icon: iconMap[(f.icon || '').toLowerCase()] || <Users className="w-6 h-6 text-gray-600" />,
              title: f.title, // Already translated by API
              description: f.description // Already translated by API
            }))
          : []
      }
    }
  ];

  // Stats data
  const stats = contentSource?.stats || whySource?.stats || [];

  const currentSlideData = mergedSlides[currentSlide];

  const hotlineLabel = currentLanguage === 'id' ? 'Butuh info cepat?' : 'Need quick info?';
  const hotlineValue =
    (currentSlide === 0 ? contentSource?.contactPhone : whySource?.contactPhone) ||
    contentSource?.contactPhone ||
    whySource?.contactPhone ||
    '+62 • WhatsApp';

  const popularLabel = currentLanguage === 'id' ? 'Paket Populer' : 'Popular package';
  const popularTitle = (currentSlide === 0 ? contentSource?.mainTitle : whySource?.mainTitle) || 'Midnight Bromo Tour';

  const fallbackStats = [
    {
      number: '5,000+',
      label: currentLanguage === 'id' ? 'Destinasi Unggulan' : 'Top Destinations',
    },
    {
      number: '3,000+',
      label: currentLanguage === 'id' ? 'Booking Selesai' : 'Bookings Completed',
    },
    {
      number: '11,000+',
      label: currentLanguage === 'id' ? 'Klien Puas' : 'Satisfied Clients',
    },
  ];

  const statsToDisplay = (Array.isArray(stats) && stats.length > 0 ? stats : fallbackStats).slice(0, 3);
  const statIcons = [Star, Users, Shield];

  const fallbackFeatures = [
    {
      icon: <Compass className="w-6 h-6 text-orange-600" />,
      title: currentLanguage === 'id' ? 'Rute fleksibel' : 'Flexible routes',
      description: currentLanguage === 'id'
        ? 'Sesuaikan itinerary dengan preferensimu tanpa ribet.'
        : 'Adjust the itinerary easily to fit your mood and schedule.',
    },
    {
      icon: <Shield className="w-6 h-6 text-orange-600" />,
      title: currentLanguage === 'id' ? 'Prioritas keamanan' : 'Safety first',
      description: currentLanguage === 'id'
        ? 'Briefing lengkap dan guide bersertifikat di setiap perjalanan.'
        : 'Certified guides and thorough safety briefing every trip.',
    },
    {
      icon: <Users className="w-6 h-6 text-orange-600" />,
      title: currentLanguage === 'id' ? 'Tim lokal ahli' : 'Expert local team',
      description: currentLanguage === 'id'
        ? 'Ditemani guide lokal yang tahu spot terbaik.'
        : 'Local experts who know every hidden gem.',
    },
  ];

  const featuresToDisplay = (currentSlideData.content.features?.length
    ? currentSlideData.content.features
    : fallbackFeatures
  ).slice(0, 3);

  const currentImage = currentSlide === 0 ? contentSource?.image : whySource?.image;
  const imageAlt = (currentSlide === 0 ? contentSource?.mainTitle : whySource?.mainTitle) || 'Tour and travel illustration';
  const fallbackImage = currentSlide === 0 ? '/assets/fun-1.png' : '/assets/fun-2.png';
  const heroImage = currentImage || fallbackImage;

  const ctaLabel =
    (currentSlide === 0 ? contentSource?.ctaText : whySource?.ctaText) ||
    (currentLanguage === 'id' ? 'Selengkapnya' : 'More about us');
  const ctaHref = (currentSlide === 0 ? contentSource?.ctaLink : whySource?.ctaLink) || '#';

  return (
    <section id="about" className="py-20 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <AnimatedSection animation="fadeInLeft" delay={0.2} duration={0.8}>
            <div className="space-y-6 max-w-xl lg:max-w-none">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-50 rounded-full border border-orange-100">
                <Compass className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-semibold text-orange-600 uppercase tracking-[0.3em]">
                  {currentSlideData.content.header}
                </span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
                {currentSlideData.content.mainTitle}
              </h2>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                {currentSlideData.content.description}
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={() => goToSlide(0)}
                  className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                    currentSlide === 0
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {contentSource?.buttonText || contentSource?.header || 'About Us'}
                </button>
                <button
                  onClick={() => goToSlide(1)}
                  className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                    currentSlide === 1
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {whySource?.buttonText || whySource?.header || 'Why Us'}
                </button>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 pt-6">
                {statsToDisplay.map((stat: any, index: number) => {
                  const Icon = statIcons[index % statIcons.length];
                  return (
                    <div
                      key={`${stat.label}-${index}`}
                      className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-white px-4 py-4 shadow-sm"
                    >
                      <div className="h-11 w-11 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-slate-900">{stat.number}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 pt-4">
                {featuresToDisplay.map((feature: any, index: number) => (
                  <div
                    key={`${feature.title}-${index}`}
                    className="flex items-start gap-4 rounded-3xl bg-slate-50 px-5 py-4"
                  >
                    <div className="h-11 w-11 rounded-2xl bg-white shadow-sm flex items-center justify-center text-orange-600">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{feature.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center">
                <a
                  href={ctaHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-500"
                >
                  <span>{ctaLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <div className="flex items-center gap-3 rounded-3xl border border-orange-100 bg-white px-5 py-3 shadow-sm">
                  <div className="h-12 w-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{hotlineValue}</p>
                    <p className="text-xs text-slate-500">{popularTitle}</p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fadeInRight" delay={0.4} duration={0.8}>
            <div className="relative mx-auto w-full max-w-[500px] sm:max-w-[520px] lg:max-w-[560px]">
              <div className="absolute -top-10 -left-6 hidden sm:block">
                <img src="/assets/shape.png" alt="shape accent" className="h-20 w-20 object-contain" loading="lazy" />
              </div>
              <div className="absolute -bottom-12 -right-8 hidden sm:block">
                <img src="/assets/right-shape.png" alt="travel accent" className="h-24 w-24 object-contain" loading="lazy" />
              </div>
              <div className="absolute top-4 right-6 hidden sm:block">
                <img src="/assets/fun-3.png" alt="icon" className="h-14 w-14 object-contain" loading="lazy" />
              </div>
              <div className="relative aspect-[4/3] sm:aspect-[4/3] lg:aspect-[4/3] rounded-3xl bg-gradient-to-br from-orange-100 via-white to-purple-50 overflow-hidden shadow-2xl">
                <img
                  src={heroImage}
                  alt={imageAlt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = fallbackImage;
                  }}
                />
              </div>
            </div>
          </AnimatedSection>
        </div>

        <div className="flex justify-center items-center mt-12 space-x-4">
          <button 
            onClick={prevSlide}
            className="p-2 bg-white hover:bg-gray-50 rounded-full shadow-md border border-gray-200 transition-all duration-300"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex space-x-2">
            {mergedSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-orange-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <button 
            onClick={nextSlide}
            className="p-2 bg-white hover:bg-gray-50 rounded-full shadow-md border border-gray-200 transition-all duration-300"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default WhoAmISection;