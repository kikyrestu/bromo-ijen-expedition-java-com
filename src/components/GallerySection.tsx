'use client';

import { Camera, Heart, Eye, Share2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedSection from './AnimatedSection';

// Utility function to strip HTML tags
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

// Preset grid positions untuk 6x9 grid
const GRID_PRESETS = [
  // Large items (2x3 atau 3x2)
  { span: 'col-span-2 row-span-3', class: '' },
  { span: 'col-span-2 row-span-3', class: '' },
  { span: 'col-span-2 row-span-2', class: '' },
  { span: 'col-span-3 row-span-2', class: '' },
  { span: 'col-span-2 row-span-2', class: '' },
  
  // Vertical items (1x4)
  { span: 'row-span-4', class: '' },
  { span: 'row-span-4', class: '' },
  
  // Medium items (2x2)
  { span: 'col-span-2 row-span-2', class: '' },
  { span: 'col-span-2 row-span-2', class: '' },
  { span: 'row-span-6', class: '' },
  { span: 'row-span-4', class: '' },
  
  // Small items (1x2)
  { span: 'row-span-2', class: '' },
  { span: 'col-span-2 row-span-3', class: '' },
  { span: 'col-span-2', class: '' },
];

const GallerySection = () => {
  const { t, currentLanguage } = useLanguage();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [sectionContent, setSectionContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch section content
        const sectionResponse = await fetch(`/api/sections?language=${currentLanguage}`);
        const sectionData = await sectionResponse.json();
        
        if (sectionData.success) {
          const gallerySection = sectionData.data.find((section: any) => section.sectionId === 'gallery');
          if (gallerySection) {
            setSectionContent(gallerySection);
          }
        }

        // Fetch gallery items
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
  }, [currentLanguage]);

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
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

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [lightboxOpen, selectedImageIndex, galleryItems.length]);

  const getGridPreset = (index: number) => {
    return GRID_PRESETS[index % GRID_PRESETS.length];
  };

  if (loading) {
    return (
      <section id="gallery" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="mb-4">
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                {sectionContent?.subtitle || t('gallery.subtitle')}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {sectionContent?.title || t('gallery.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {stripHtmlTags(sectionContent?.description) || t('gallery.loading')}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="gallery" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <AnimatedSection animation="fadeInUp" delay={0.2} duration={0.8}>
            <div className="text-center mb-16">
              <div className="mb-4">
                <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  {sectionContent?.subtitle || t('gallery.subtitle')}
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {sectionContent?.title || t('gallery.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {stripHtmlTags(sectionContent?.description) || 'Explore our stunning collection of photos showcasing the breathtaking landscapes, cultural experiences, and unforgettable moments from Bromo Ijen adventures.'}
              </p>
            </div>
          </AnimatedSection>

          {/* Masonry Gallery Grid */}
          <AnimatedSection animation="scaleIn" delay={0.4} duration={1.0}>
            {galleryItems.length === 0 ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center text-gray-500">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No gallery items available. Please add content from the CMS.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-6 grid-rows-9 gap-2 auto-rows-auto">
                {galleryItems.map((item, index) => {
                  const preset = getGridPreset(index);
                  return (
                    <div
                      key={item.id}
                      className={`${preset.span} group cursor-pointer overflow-hidden rounded-lg hover:scale-[1.02] transition-transform duration-300`}
                      onClick={() => openLightbox(index)}
                    >
                      <div className="relative w-full h-full">
                        {/* Image */}
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                            <div className="text-center text-white">
                              <div className="w-12 h-12 bg-gray-600 rounded-lg mb-2 mx-auto flex items-center justify-center">
                                <Camera className="w-6 h-6 text-gray-300" />
                              </div>
                              <p className="text-xs sm:text-sm font-medium">{item.title}</p>
                              <p className="text-xs text-gray-300 mt-1">{item.category}</p>
                            </div>
                          </div>
                        )}

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex flex-col justify-between p-4">
                          {/* Top Content */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-white bg-orange-600 px-2 py-1 rounded-full">
                                {item.category}
                              </span>
                              <button className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200">
                                <Share2 className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          </div>

                          {/* Bottom Content */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <h3 className="text-white font-bold text-sm mb-2 leading-tight">
                              {item.title}
                            </h3>
                            
                            {/* Stats */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-1">
                                  <Heart className="w-3 h-3 text-white" />
                                  <span className="text-xs text-white/90">{item.likes}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Eye className="w-3 h-3 text-white" />
                                  <span className="text-xs text-white/90">{item.views}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </AnimatedSection>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxOpen && selectedImageIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md" onClick={closeLightbox}>
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Image */}
            <div className="relative max-w-7xl mx-auto px-4" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 text-center">
                <img
                  src={galleryItems[selectedImageIndex].image}
                  alt={galleryItems[selectedImageIndex].title}
                  className="max-h-[80vh] w-auto mx-auto rounded-lg shadow-2xl"
                />
                
                <div className="mt-4 text-white">
                  <h3 className="text-2xl font-bold mb-2">{galleryItems[selectedImageIndex].title}</h3>
                  <p className="text-sm text-white/70 mb-2">
                    {selectedImageIndex + 1} of {galleryItems.length}
                  </p>
                  {galleryItems[selectedImageIndex].description && (
                    <p className="text-gray-300 max-w-2xl mx-auto">
                      {galleryItems[selectedImageIndex].description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GallerySection;
