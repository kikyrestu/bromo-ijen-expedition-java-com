// src/lib/seo-utils.ts - Enhanced with multi-language support
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// Enhanced SEO utilities with multi-language support
export interface MultiLanguageSeoData {
  id: string;
  en: SeoData;
  de: SeoData;
  nl: SeoData;
  zh: SeoData;
}

export interface SeoData {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
}

// Generate SEO data for different languages
export async function generateMultiLanguageSeo(
  pageType: string,
  pageSlug: string,
  baseContent: any,
  language: string = 'id'
): Promise<SeoData> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bromoijen.com';
  
  // Get translated content based on language
  const translatedContent = await getTranslatedContent(pageType, pageSlug, language);
  
  // Generate language-specific URLs
  const canonicalUrl = language === 'id' 
    ? `${siteUrl}/${pageType}/${pageSlug}`
    : `${siteUrl}/${language}/${pageType}/${pageSlug}`;

  return {
    title: translatedContent.title || baseContent.title,
    description: translatedContent.description || baseContent.description,
    keywords: generateKeywords(translatedContent, language),
    canonicalUrl,
    ogImage: translatedContent.ogImage || baseContent.image,
    ogType: 'website',
    noIndex: false
  };
}

// Get translated content from database
async function getTranslatedContent(pageType: string, pageSlug: string, language: string) {
  try {
    // For sections
    if (pageType === 'section') {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/sections?section=${pageSlug}&language=${language}`);
      const data = await response.json();
      return data.success ? data.data : null;
    }
    
    // For packages
    if (pageType === 'package') {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/packages?slug=${pageSlug}&language=${language}`);
      const data = await response.json();
      return data.success ? data.data : null;
    }
    
    // For blogs
    if (pageType === 'blog') {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/blogs/${pageSlug}?language=${language}`);
      const data = await response.json();
      return data.success ? data.data : null;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching translated content:', error);
    return null;
  }
}

// Generate language-specific keywords
function generateKeywords(content: any, language: string): string {
  const baseKeywords = {
    id: 'bromo tour, ijen tour, wisata bromo, wisata ijen, paket wisata jawa timur',
    en: 'bromo tour, ijen tour, east java travel, mount bromo, ijen crater, indonesia adventure',
    de: 'bromo tour, ijen tour, ostjava reisen, mount bromo, ijen krater, indonesien abenteuer',
    nl: 'bromo tour, ijen tour, oost-java reizen, mount bromo, ijen krater, indonesië avontuur',
    zh: '布罗莫旅游, 伊真旅游, 东爪哇旅游, 布罗莫山, 伊真火山口, 印度尼西亚冒险'
  };
  
  const languageKeywords = baseKeywords[language as keyof typeof baseKeywords] || baseKeywords.en;
  
  // Add content-specific keywords
  if (content?.title) {
    const titleKeywords = content.title.toLowerCase().split(' ').slice(0, 3).join(', ');
    return `${languageKeywords}, ${titleKeywords}`;
  }
  
  return languageKeywords;
}

// Generate structured data for tour packages
export function generateTourPackageSchema(packageData: any, language: string = 'id') {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bromoijen.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": packageData.title,
    "description": packageData.description,
    "url": `${siteUrl}/packages/${packageData.slug}`,
    "image": packageData.images?.map((img: string) => `${siteUrl}${img}`) || [],
    "offers": {
      "@type": "Offer",
      "price": packageData.price,
      "priceCurrency": "IDR",
      "availability": packageData.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    "itinerary": packageData.itinerary?.map((day: any) => ({
      "@type": "TouristTrip",
      "name": day.title,
      "description": day.description
    })) || [],
    "provider": {
      "@type": "Organization",
      "name": "Bromo Ijen Tour & Travel",
      "url": siteUrl
    },
    "inLanguage": language
  };
}

// Generate structured data for blog posts
export function generateBlogPostSchema(blogData: any, language: string = 'id') {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bromoijen.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blogData.title,
    "description": blogData.excerpt,
    "url": `${siteUrl}/blog/${blogData.slug}`,
    "image": blogData.image ? `${siteUrl}${blogData.image}` : undefined,
    "author": {
      "@type": "Person",
      "name": blogData.author || "Bromo Ijen Tour Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Bromo Ijen Tour & Travel",
      "url": siteUrl
    },
    "datePublished": blogData.publishDate || blogData.createdAt,
    "dateModified": blogData.updatedAt,
    "inLanguage": language
  };
}

// Generate breadcrumb schema
export function generateBreadcrumbSchema(breadcrumbs: any[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

// Generate website schema
export function generateWebsiteSchema(siteName: string, siteUrl: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteName,
    "url": siteUrl,
    "description": description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

// Generate organization schema
export function generateOrganizationSchema(siteName: string, siteUrl: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteName,
    "url": siteUrl,
    "description": description,
    "logo": `${siteUrl}/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+62-XXX-XXX-XXXX",
      "contactType": "customer service",
      "availableLanguage": ["Indonesian", "English", "German", "Dutch", "Chinese"]
    },
    "sameAs": [
      "https://www.facebook.com/bromoijentour",
      "https://www.instagram.com/bromoijentour",
      "https://www.youtube.com/bromoijentour"
    ]
  };
}

// Generate sitemap with multi-language support
export async function generateMultiLanguageSitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bromoijen.com';
  const languages = ['id', 'en', 'de', 'nl', 'zh'];
  
  const [packages, blogs, settings] = await Promise.all([
    prisma.package.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true }
    }),
    prisma.blog.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true }
    }),
    prisma.settings.findUnique({
      where: { id: 'default' }
    })
  ]);

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

  // Home page for all languages
  languages.forEach(lang => {
    const url = lang === 'id' ? siteUrl : `${siteUrl}/${lang}`;
    sitemap += `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>`;
    
    // Add alternate language links
    languages.forEach(altLang => {
      const altUrl = altLang === 'id' ? siteUrl : `${siteUrl}/${altLang}`;
      sitemap += `
    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altUrl}" />`;
    });
    
    sitemap += `
  </url>`;
  });

  // Tour packages for all languages
  packages.forEach(pkg => {
    languages.forEach(lang => {
      const url = lang === 'id' 
        ? `${siteUrl}/packages/${pkg.slug}`
        : `${siteUrl}/${lang}/packages/${pkg.slug}`;
        
      sitemap += `
  <url>
    <loc>${url}</loc>
    <lastmod>${pkg.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;
    
      // Add alternate language links
      languages.forEach(altLang => {
        const altUrl = altLang === 'id' 
          ? `${siteUrl}/packages/${pkg.slug}`
          : `${siteUrl}/${altLang}/packages/${pkg.slug}`;
        sitemap += `
    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altUrl}" />`;
      });
      
      sitemap += `
  </url>`;
    });
  });

  // Blog posts for all languages
  blogs.forEach(blog => {
    languages.forEach(lang => {
      const url = lang === 'id' 
        ? `${siteUrl}/blog/${blog.slug}`
        : `${siteUrl}/${lang}/blog/${blog.slug}`;
        
      sitemap += `
  <url>
    <loc>${url}</loc>
    <lastmod>${blog.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>`;
    
      // Add alternate language links
      languages.forEach(altLang => {
        const altUrl = altLang === 'id' 
          ? `${siteUrl}/blog/${blog.slug}`
          : `${siteUrl}/${altLang}/blog/${blog.slug}`;
        sitemap += `
    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altUrl}" />`;
      });
      
      sitemap += `
  </url>`;
    });
  });

  sitemap += `
</urlset>`;

  return sitemap;
}

// Auto-generate SEO data when content is created/updated
export async function autoGenerateSeoData(
  pageType: string,
  pageSlug: string,
  content: any,
  language: string = 'id'
) {
  try {
    const seoData = await generateMultiLanguageSeo(pageType, pageSlug, content, language);
    
    // Save to database
    await prisma.seoData.upsert({
      where: {
        pageType_pageSlug: {
          pageType,
          pageSlug
        }
      },
      update: seoData,
      create: {
        pageType,
        pageSlug,
        ...seoData
      }
    });
    
    return seoData;
  } catch (error) {
    console.error('Error auto-generating SEO data:', error);
    return null;
  }
}