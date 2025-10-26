'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Compass, Star, Users, Shield, Award } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedSection from './AnimatedSection';

interface WhoAmISectionProps {
  overrideContent?: any;
  whyOverrideContent?: any;
  disableAuto?: boolean;
}

const stripHtmlTags = (html: string): string => html?.replace(/<[^>]*>/g, '') || '';

const WhoAmISection: React.FC<WhoAmISectionProps> = ({ overrideContent, whyOverrideContent, disableAuto = false }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fetchedContent, setFetchedContent] = useState<any>(null);
  const [fetchedWhy, setFetchedWhy] = useState<any>(null);
  const { currentLanguage } = useLanguage();

  const iconMap: { [key: string]: React.ReactNode } = {
    compass: <Compass className="w-6 h-6 text-orange-600" />,
    star: <Star className="w-6 h-6 text-orange-600" />,
    users: <Users className="w-6 h-6 text-orange-600" />,
    shield: <Shield className="w-6 h-6 text-orange-600" />,
    award: <Award className="w-6 h-6 text-orange-600" />,
  };

  const contentSource = overrideContent || fetchedContent || null;
  const whySource = whyOverrideContent || fetchedWhy || null;

  const mergedSlides = [
    {
      id: 'who-am-i',
      title: 'Who Am I?',
      content: {
        header: contentSource?.header || 'About',
        mainTitle: contentSource?.mainTitle || 'About Our Company',
        description: stripHtmlTags(contentSource?.description || 'We are a professional tour and travel company with years of experience'),
        features: contentSource?.features?.map((f: any) => ({
          icon: iconMap[f.icon?.toLowerCase()] || <Users className="w-6 h-6 text-orange-600" />,
          title: f.title,
          description: f.description,
        })) || [],
      },
    },
    {
      id: 'why-choose-us',
      title: 'Why Choose Us?',
      content: {
        header: whySource?.header || 'Why Choose Us',
        mainTitle: whySource?.mainTitle || 'Why Choose Our Services',
        description: stripHtmlTags(whySource?.description || 'We provide exceptional tour experiences with attention to detail'),
        features: whySource?.features?.map((f: any) => ({
          icon: iconMap[f.icon?.toLowerCase()] || <Users className="w-6 h-6 text-orange-600" />,
          title: f.title,
          description: f.description,
        })) || [],
      },
    },
  ];

  const currentSlideData = mergedSlides[currentSlide];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % mergedSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + mergedSlides.length) % mergedSlides.length);

  return (
    <section id="about" className="relative py-24 bg-gradient-to-br from-orange-50 via-white to-blue-50 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/patterns/dots.svg')] opacity-10 bg-repeat"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <AnimatedSection animation="fadeInLeft" delay={0.2}>
            <div className="space-y-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center shadow-md">
                  <Compass className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-sm font-bold text-orange-600 uppercase tracking-widest">
                  {currentSlideData.content.header}
                </span>
              </div>

              <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight drop-shadow-sm">
                {currentSlideData.content.mainTitle}
              </h2>

              <p className="text-lg text-gray-700 leading-relaxed">
                {currentSlideData.content.description}
              </p>

              <div className="flex gap-4 flex-wrap">
                {mergedSlides.map((slide, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`px-8 py-3 font-semibold rounded-lg transition duration-300 border ${
                      currentSlide === i
                        ? 'bg-orange-600 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-800 hover:bg-orange-100 border-gray-200'
                    }`}
                  >
                    {slide.content.header}
                  </button>
                ))}
              </div>

              <div className="space-y-5 pt-8">
                {currentSlideData.content.features.map((feature: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-start space-x-4 p-5 bg-white/60 backdrop-blur-md rounded-2xl border border-gray-100 hover:shadow-md transition-all"
                  >
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-orange-200">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fadeInRight" delay={0.4}>
            <div className="space-y-8 relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-orange-200 to-blue-200 rounded-3xl overflow-hidden shadow-xl relative group">
                {(() => {
                  const currentImage = currentSlide === 0 ? contentSource?.image : whySource?.image;
                  const currentTitle = currentSlide === 0 ? contentSource?.mainTitle : whySource?.mainTitle;

                  return currentImage ? (
                    <img
                      src={currentImage}
                      alt={currentTitle || 'About Image'}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-center text-gray-600">
                      <div>
                        <Users className="w-10 h-10 mx-auto text-orange-500 mb-3" />
                        <p className="font-semibold">Image Placeholder</p>
                        <p className="text-sm text-gray-400">Tour & Travel Illustration</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </AnimatedSection>
        </div>

        <div className="flex justify-center mt-16 space-x-4">
          <button onClick={prevSlide} className="p-3 bg-white border rounded-full shadow hover:bg-orange-50">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          {mergedSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-3 h-3 rounded-full transition-all ${i === currentSlide ? 'bg-orange-600 scale-125' : 'bg-gray-300'}`}
            />
          ))}
          <button onClick={nextSlide} className="p-3 bg-white border rounded-full shadow hover:bg-orange-50">
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default WhoAmISection;
