'use client';

import { useEffect, useState } from 'react';
import Head from 'next/head';
import DynamicHeader from '@/components/DynamicHeader';
import NotificationBar from '@/components/NotificationBar';
import HeroSection from '@/components/HeroSection';
import WhoAmISection from '@/components/WhoAmISection';
import DestinasiEksklusifSection from '@/components/DestinasiEksklusifSection';
import TourPackagesSection from '@/components/TourPackagesSection';
import TestimonialSection from '@/components/TestimonialSection';
import BlogSection from '@/components/BlogSection';
import GallerySection from '@/components/GallerySection';
import Footer from '@/components/Footer';
import TranslationDebugPanel from '@/components/TranslationDebugPanel';
import GoturHomePage from '@/components/gotur/GoturHomePage';
import { generateWebsiteSchema, generateOrganizationSchema } from '@/lib/seo-utils';
import BannerSlot from '@/components/banners/BannerSlot';

interface HomePageClientProps {
  lang: string;
}

export default function HomePageClient({ lang }: HomePageClientProps) {
  const [seoData, setSeoData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [activeTemplate, setActiveTemplate] = useState<string>('default');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSeoData = async () => {
      try {
        // Fetch SEO data for homepage
        const seoRes = await fetch('/api/seo?pageType=home&pageSlug=home');
        const seoJson = await seoRes.json();
        if (seoJson.success) {
          setSeoData(seoJson.data);
        }

        // Fetch site settings
        const settingsRes = await fetch('/api/settings');
        const settingsJson = await settingsRes.json();
        if (settingsJson.success) {
          setSettings(settingsJson.data);
          const template = (settingsJson.data.activeTemplate || 'default').toString().trim().toLowerCase();
          setActiveTemplate(template);
        }
      } catch (error) {
        console.error('Error fetching SEO data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeoData();
  }, []);

  const title = seoData?.title || settings?.siteName || 'Bromo Ijen Tour & Travel | Best Volcano Tours Indonesia';
  const description = seoData?.description || settings?.siteDescription || 'Experience breathtaking volcanic adventures with professional guides. Book your Mount Bromo and Ijen Crater tour today!';
  const keywords = seoData?.keywords || 'bromo tour, ijen tour, volcano tour, indonesia travel, mount bromo, ijen crater, sunrise tour';
  const canonicalUrl = seoData?.canonicalUrl || settings?.siteUrl || 'https://bromoijen.com';
  const ogImage = seoData?.ogImage || settings?.defaultOgImage || '/og-default.jpg';
  const siteName = settings?.siteName || 'Bromo Ijen Tour & Travel';
  const siteUrl = settings?.siteUrl || 'https://bromoijen.com';

  const websiteSchema = generateWebsiteSchema(siteName, siteUrl, description);
  const organizationSchema = generateOrganizationSchema(siteName, siteUrl, description);
  // Don't render content until we know which template to use
  if (isLoading) {
    return null;
  }

  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Search Engine Verification */}
        {settings?.googleSiteVerification && (
          <meta name="google-site-verification" content={settings.googleSiteVerification} />
        )}
        {settings?.bingSiteVerification && (
          <meta name="msvalidate.01" content={settings.bingSiteVerification} />
        )}
        
        {/* Robots */}
        <meta name="robots" content="index,follow" />
        <meta name="googlebot" content="index,follow" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content={siteName} />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={ogImage} />
        
        {/* Additional Meta */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="language" content="English" />
        <meta name="author" content={siteName} />
      </Head>

      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <div className="min-h-screen flex flex-col">
        <DynamicHeader />
        <main className="flex-grow">
          <NotificationBar />
          {activeTemplate === 'gotur' ? (
            <GoturHomePage />
          ) : (
            <>
              <div className="relative pt-20">
                <HeroSection />
              </div>

              <BannerSlot location="landing.hero" variant="hero" />

              <WhoAmISection />

              <BannerSlot location="landing.abovePackages" variant="section" />

              <DestinasiEksklusifSection />

              <BannerSlot location="landing.belowPackages" variant="section" className="px-6" />

              <TourPackagesSection />

              <BannerSlot location="landing.belowTestimonials" variant="compact" className="px-6" />

              <TestimonialSection />

              <BannerSlot location="landing.footerPromo" variant="section" className="px-6" />

              <BlogSection />
              <GallerySection />
            </>
          )}
        </main>
        <Footer />
        
        {/* Translation Debug Panel - Shows section data & translation status */}
        <TranslationDebugPanel />
      </div>
    </>
  );
}
