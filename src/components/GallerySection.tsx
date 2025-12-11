'use client';

import { Camera, Heart, Eye, Share2, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import AnimatedSection from './AnimatedSection';

const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description?: string;
  tags?: string[];
  likes: number;
  views: number;
  createdAt: string;
}

interface GallerySectionProps {
  overrideContent?: {
    title?: string;
    subtitle?: string;
    description?: string;
    ctaText?: string;
    ctaLink?: string;
    layoutStyle?: string;
    displayCount?: number;
    category?: string;
    sortBy?: string;
    showFilters?: boolean;
    enableLightbox?: boolean;
    enableAutoSlide?: boolean;
    autoSlideInterval?: number;
    transitionEffect?: string;
    animationSpeed?: string;
  };
}

const GallerySection = ({ overrideContent }: GallerySectionProps = {}) => {
  const { t, currentLanguage } = useLanguage();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [sectionContent, setSectionContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!overrideContent) {
          const sectionResponse = await fetch(`/api/sections?language=${currentLanguage}`);
          const sectionData = await sectionResponse.json();
          
          if (sectionData.success) {
            const gallerySection = sectionData.data.find((section: any) => section.sectionId === 'gallery');
            if (gallerySection) {
              setSectionContent(gallerySection);
            }
          }
        } else {
          setSectionContent(overrideContent);
        }

        const queryParams = new URLSearchParams();
        if (currentLanguage !== 'id') queryParams.append('language', currentLanguage);
        
        const response = await fetch(`/api/gallery?${queryParams.toString()}`);
        const data = await response.json();
        
        if (data.success) {
          setGalleryItems(data.data);
        }
      } catch (error) {
        console.error('Error fetching gallery data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentLanguage, overrideContent]);

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
  };

  const nextImage = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % galleryItems.length);
    }
  };

  const prevImage = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + galleryItems.length) % galleryItems.length);
    }
  };

  useEffect(() => {
    if (selectedImageIndex === null) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImageIndex, galleryItems.length]);

  if (loading) return null;

  return (
    <>
      <section className="py-16 md:py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <AnimatedSection animation="fadeInUp">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-900 text-xs font-bold tracking-wider uppercase mb-4 shadow-sm">
                <Camera className="w-3.5 h-3.5" />
                {sectionContent?.subtitle || t('gallery.subtitle')}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight leading-tight">
                {sectionContent?.title || t('gallery.title')}
              </h2>
              <div 
                className="text-base md:text-lg text-slate-600 leading-relaxed [&>p]:mb-2 last:[&>p]:mb-0"
                dangerouslySetInnerHTML={{ __html: sectionContent?.description || 'Explore our stunning photo collection' }}
              />
            </AnimatedSection>
          </div>

          {/* Masonry Grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {galleryItems.map((item, index) => (
              <AnimatedSection
                key={item.id}
                animation="fadeInUp"
                delay={index * 0.05}
                className="break-inside-avoid"
              >
                <div 
                  className="group relative rounded-2xl overflow-hidden cursor-pointer bg-slate-100"
                  onClick={() => openLightbox(index)}
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={600}
                      height={800}
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-64 bg-slate-200 flex items-center justify-center">
                      <Camera className="w-12 h-12 text-slate-400" />
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <span className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold rounded-full mb-2 uppercase tracking-wider">
                        {item.category}
                      </span>
                      <h3 className="text-white font-bold text-lg mb-1.5">{item.title}</h3>
                      <div className="flex items-center gap-3 text-white/90 text-xs font-medium">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5" /> {item.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> {item.views}
                        </span>
                      </div>
                    </div>
                    
                    <div className="absolute top-4 right-4">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                        <ZoomIn className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 z-50 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 md:left-8 z-50 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 md:right-8 z-50 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>

            <motion.div
              key={selectedImageIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-5xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <Image
                  src={galleryItems[selectedImageIndex].image}
                  alt={galleryItems[selectedImageIndex].title}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="mt-6 text-center text-white">
                <h3 className="text-2xl font-bold mb-2">{galleryItems[selectedImageIndex].title}</h3>
                <p className="text-white/70 max-w-2xl mx-auto text-lg">
                  {galleryItems[selectedImageIndex].description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GallerySection;
