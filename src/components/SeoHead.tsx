'use client';

import Head from 'next/head';
import { useEffect, useState } from 'react';

interface SeoHeadProps {
  pageType: string;
  pageSlug: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  customSchema?: any;
}

const SeoHead = ({ 
  pageType, 
  pageSlug, 
  fallbackTitle, 
  fallbackDescription,
  customSchema 
}: SeoHeadProps) => {
  const [seoData, setSeoData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSeoData = async () => {
      try {
        // Fetch SEO data for this page
        const seoRes = await fetch(`/api/seo?pageType=${pageType}&pageSlug=${pageSlug}`);
        const seoJson = await seoRes.json();
        if (seoJson.success) {
          setSeoData(seoJson.data);
        }

        // Fetch site settings
        const settingsRes = await fetch('/api/settings');
        const settingsJson = await settingsRes.json();
        if (settingsJson.success) {
          setSettings(settingsJson.data);
        }
      } catch (error) {
        console.error('Error fetching SEO data:', error);
      }
    };

    fetchSeoData();
  }, [pageType, pageSlug]);

  if (!seoData && !fallbackTitle) return null;

  const title = seoData?.title || fallbackTitle || settings?.siteName || 'Bromo Ijen Tour';
  const description = seoData?.description || fallbackDescription || settings?.siteDescription || '';
  const keywords = seoData?.keywords || 'bromo tour, ijen tour, indonesia travel';
  const canonicalUrl = seoData?.canonicalUrl || `${settings?.siteUrl}/${pageType}/${pageSlug}`;
  const ogImage = seoData?.ogImage || settings?.defaultOgImage || '/og-default.jpg';
  const ogType = seoData?.ogType || 'website';
  const noIndex = seoData?.noIndex || false;
  const siteName = settings?.siteName || 'Bromo Ijen Tour & Travel';

  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Robots */}
        <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content={ogType} />
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

      {/* JSON-LD Schema */}
      {customSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(customSchema) }}
        />
      )}
    </>
  );
};

export default SeoHead;

