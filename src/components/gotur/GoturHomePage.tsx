'use client';

import HeroSection from '@/components/HeroSection';
import GoturHighlightsSection from './GoturHighlightsSection';
import GoturTourPackagesSection from './GoturTourPackagesSection';
import GoturTestimonialsSection from './GoturTestimonialsSection';
import GoturBlogSection from './GoturBlogSection';
import GoturGallerySection from './GoturGallerySection';

const GoturHomePage = () => {
  return (
    <>
      <div className="relative pt-20">
        <HeroSection />
      </div>
      <GoturHighlightsSection />
      <GoturTourPackagesSection />
      <GoturTestimonialsSection />
      <GoturBlogSection />
      <GoturGallerySection />
    </>
  );
};

export default GoturHomePage;
