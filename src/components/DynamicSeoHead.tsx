// src/components/DynamicSeoHead.tsx - Enhanced SEO component
'use client';

import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DynamicSeoHeadProps {
  pageType: string;
  pageSlug: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  customSchema?: any;
  sectionData?: any; // For dynamic section content
}

const DynamicSeoHead = ({ 
  pageType, 
  pageSlug, 
  fallbackTitle, 
  fallbackDescription,
  customSchema,
  sectionData
}: DynamicSeoHeadProps) => {
  const { currentLanguage } = useLanguage();
  const [seoData, setSeoData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSeoData = async () => {
      try {
        // Fetch SEO data for this page
        const seoRes = await fetch(`/api/seo?pageType=${pageType}&pageSlug=${pageSlug}&language=${currentLanguage}`);
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
  }, [pageType, pageSlug, currentLanguage]);

  // Generate dynamic content for sections
  const generateDynamicContent = () => {
    if (sectionData && pageType === 'section') {
      return {
        title: sectionData.title || fallbackTitle,
        description: sectionData.description || fallbackDescription,
        keywords: generateSectionKeywords(sectionData, currentLanguage)
      };
    }
    return {
      title: seoData?.title || fallbackTitle || settings?.siteName || 'Bromo Ijen Tour',
      description: seoData?.description || fallbackDescription || settings?.siteDescription || 'Experience the best volcanic adventures',
      keywords: seoData?.keywords || 'bromo tour, ijen tour, indonesia travel'
    };
  };

  const generateSectionKeywords = (sectionData: any, language: string) => {
    const baseKeywords = {
      id: 'bromo tour, ijen tour, wisata bromo, wisata ijen, paket wisata jawa timur',
      en: 'bromo tour, ijen tour, east java travel, mount bromo, ijen crater, indonesia adventure',
      de: 'bromo tour, ijen tour, ostjava reisen, mount bromo, ijen krater, indonesien abenteuer',
      nl: 'bromo tour, ijen tour, oost-java reizen, mount bromo, ijen krater, indonesië avontuur',
      zh: '布罗莫旅游, 伊真旅游, 东爪哇旅游, 布罗莫山, 伊真火山口, 印度尼西亚冒险'
    };
    
    const languageKeywords = baseKeywords[language as keyof typeof baseKeywords] || baseKeywords.en;
    
    if (sectionData?.title) {
      const titleKeywords = sectionData.title.toLowerCase().split(' ').slice(0, 3).join(', ');
      return `${languageKeywords}, ${titleKeywords}`;
    }
    
    return languageKeywords;
  };

  const content = generateDynamicContent();
  const siteUrl = settings?.siteUrl || 'https://bromoijen.com';
  const canonicalUrl = currentLanguage === 'id' 
    ? `${siteUrl}/${pageType}/${pageSlug}`
    : `${siteUrl}/${currentLanguage}/${pageType}/${pageSlug}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{content.title}</title>
      <meta name="description" content={content.description} />
      <meta name="keywords" content={content.keywords} />
      <meta name="author" content="Bromo Ijen Tour & Travel" />
      <meta name="robots" content={seoData?.noIndex ? "noindex,nofollow" : "index,follow"} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={content.title} />
      <meta property="og:description" content={content.description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={seoData?.ogType || 'website'} />
      <meta property="og:image" content={seoData?.ogImage ? `${siteUrl}${seoData.ogImage}` : `${siteUrl}/og-default.jpg`} />
      <meta property="og:site_name" content={settings?.siteName || 'Bromo Ijen Tour'} />
      <meta property="og:locale" content={getLocaleFromLanguage(currentLanguage)} />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={content.title} />
      <meta name="twitter:description" content={content.description} />
      <meta name="twitter:image" content={seoData?.ogImage ? `${siteUrl}${seoData.ogImage}` : `${siteUrl}/og-default.jpg`} />
      
      {/* Language Alternates */}
      <link rel="alternate" hrefLang="id" href={`${siteUrl}/${pageType}/${pageSlug}`} />
      <link rel="alternate" hrefLang="en" href={`${siteUrl}/en/${pageType}/${pageSlug}`} />
      <link rel="alternate" hrefLang="de" href={`${siteUrl}/de/${pageType}/${pageSlug}`} />
      <link rel="alternate" hrefLang="nl" href={`${siteUrl}/nl/${pageType}/${pageSlug}`} />
      <link rel="alternate" hrefLang="zh" href={`${siteUrl}/zh/${pageType}/${pageSlug}`} />
      <link rel="alternate" hrefLang="x-default" href={`${siteUrl}/${pageType}/${pageSlug}`} />
      
      {/* Structured Data */}
      {customSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(customSchema)
          }}
        />
      )}
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#f97316" />
      <meta name="msapplication-TileColor" content="#f97316" />
    </Head>
  );
};

const getLocaleFromLanguage = (language: string) => {
  const locales = {
    id: 'id_ID',
    en: 'en_US',
    de: 'de_DE',
    nl: 'nl_NL',
    zh: 'zh_CN'
  };
  return locales[language as keyof typeof locales] || 'id_ID';
};

export default DynamicSeoHead;
