// src/lib/auto-seo-generator.ts - Auto-generate SEO when content is created/updated
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

interface ContentData {
  title: string;
  description?: string;
  excerpt?: string;
  content?: string;
  image?: string;
  slug: string;
  language?: string;
}

// Auto-generate SEO data when package is created/updated
export async function autoGeneratePackageSeo(packageData: ContentData) {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bromoijen.com';
    
    const seoData = {
      pageType: 'package',
      pageSlug: packageData.slug,
      title: `${packageData.title} - Bromo Ijen Tour Package`,
      description: packageData.description || packageData.excerpt || `Experience ${packageData.title} with our professional tour package.`,
      keywords: generatePackageKeywords(packageData),
      canonicalUrl: `${siteUrl}/packages/${packageData.slug}`,
      ogImage: packageData.image || '/og-package-default.jpg',
      ogType: 'product',
      noIndex: false
    };

    await prisma.seoData.upsert({
      where: {
        pageType_pageSlug: {
          pageType: 'package',
          pageSlug: packageData.slug
        }
      },
      update: seoData,
      create: seoData
    });

    console.log(`✅ Auto-generated SEO for package: ${packageData.slug}`);
    return seoData;
  } catch (error) {
    console.error('Error auto-generating package SEO:', error);
    return null;
  }
}

// Auto-generate SEO data when blog is created/updated
export async function autoGenerateBlogSeo(blogData: ContentData) {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bromoijen.com';
    
    const seoData = {
      pageType: 'blog',
      pageSlug: blogData.slug,
      title: `${blogData.title} - Bromo Ijen Travel Blog`,
      description: blogData.excerpt || blogData.description || `Read about ${blogData.title} in our travel blog.`,
      keywords: generateBlogKeywords(blogData),
      canonicalUrl: `${siteUrl}/blog/${blogData.slug}`,
      ogImage: blogData.image || '/og-blog-default.jpg',
      ogType: 'article',
      noIndex: false
    };

    await prisma.seoData.upsert({
      where: {
        pageType_pageSlug: {
          pageType: 'blog',
          pageSlug: blogData.slug
        }
      },
      update: seoData,
      create: seoData
    });

    console.log(`✅ Auto-generated SEO for blog: ${blogData.slug}`);
    return seoData;
  } catch (error) {
    console.error('Error auto-generating blog SEO:', error);
    return null;
  }
}

// Auto-generate SEO data when section is updated
export async function autoGenerateSectionSeo(sectionId: string, sectionData: any) {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bromoijen.com';
    
    const seoData = {
      pageType: 'section',
      pageSlug: sectionId,
      title: `${sectionData.title || sectionId} - Bromo Ijen Tour`,
      description: sectionData.description || `Learn about ${sectionData.title || sectionId} at Bromo Ijen Tour.`,
      keywords: generateSectionKeywords(sectionData),
      canonicalUrl: `${siteUrl}/#${sectionId}`,
      ogImage: sectionData.image || '/og-section-default.jpg',
      ogType: 'website',
      noIndex: false
    };

    await prisma.seoData.upsert({
      where: {
        pageType_pageSlug: {
          pageType: 'section',
          pageSlug: sectionId
        }
      },
      update: seoData,
      create: seoData
    });

    console.log(`✅ Auto-generated SEO for section: ${sectionId}`);
    return seoData;
  } catch (error) {
    console.error('Error auto-generating section SEO:', error);
    return null;
  }
}

// Generate keywords for packages
function generatePackageKeywords(packageData: ContentData): string {
  const baseKeywords = 'bromo tour, ijen tour, east java travel, mount bromo, ijen crater, indonesia adventure';
  
  if (packageData.title) {
    const titleKeywords = packageData.title.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter((word: string) => word.length > 3)
      .slice(0, 3)
      .join(', ');
    
    return `${baseKeywords}, ${titleKeywords}`;
  }
  
  return baseKeywords;
}

// Generate keywords for blogs
function generateBlogKeywords(blogData: ContentData): string {
  const baseKeywords = 'bromo travel guide, ijen travel tips, east java tourism, indonesia travel blog';
  
  if (blogData.title) {
    const titleKeywords = blogData.title.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter((word: string) => word.length > 3)
      .slice(0, 3)
      .join(', ');
    
    return `${baseKeywords}, ${titleKeywords}`;
  }
  
  return baseKeywords;
}

// Generate keywords for sections
function generateSectionKeywords(sectionData: any): string {
  const baseKeywords = 'bromo ijen tour, east java travel, indonesia adventure, volcanic tours';
  
  if (sectionData.title) {
    const titleKeywords = sectionData.title.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter((word: string) => word.length > 3)
      .slice(0, 2)
      .join(', ');
    
    return `${baseKeywords}, ${titleKeywords}`;
  }
  
  return baseKeywords;
}

// Bulk generate SEO for existing content
export async function bulkGenerateSeo() {
  try {
    console.log('🚀 Starting bulk SEO generation...');
    
    // Generate SEO for all packages
    const packages = await prisma.package.findMany({
      where: { status: 'published' },
      select: { slug: true, title: true, description: true, image: true }
    });
    
    for (const pkg of packages) {
      await autoGeneratePackageSeo({
        title: pkg.title,
        description: pkg.description,
        slug: pkg.slug || '',
        image: pkg.image
      });
    }
    
    // Generate SEO for all blogs
    const blogs = await prisma.blog.findMany({
      where: { status: 'published' },
      select: { slug: true, title: true, excerpt: true, image: true }
    });
    
    for (const blog of blogs) {
      await autoGenerateBlogSeo({
        title: blog.title,
        excerpt: blog.excerpt,
        slug: blog.slug || '',
        image: blog.image
      });
    }
    
    // Generate SEO for main sections
    const sections = ['hero', 'whoAmI', 'whyChooseUs', 'exclusiveDestinations', 'tourPackages', 'testimonials', 'blog', 'gallery'];
    
    for (const sectionId of sections) {
      await autoGenerateSectionSeo(sectionId, { title: sectionId });
    }
    
    console.log('✅ Bulk SEO generation completed!');
    return { success: true, message: 'SEO data generated for all content' };
  } catch (error) {
    console.error('Error in bulk SEO generation:', error);
    return { success: false, error: 'Failed to generate SEO data' };
  }
}

// Update SEO when content is translated
export async function updateSeoForTranslation(
  pageType: string,
  pageSlug: string,
  translatedContent: any,
  language: string
) {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bromoijen.com';
    
    // Generate language-specific keywords
    const languageKeywords = {
      id: 'bromo tour, ijen tour, wisata bromo, wisata ijen, paket wisata jawa timur',
      en: 'bromo tour, ijen tour, east java travel, mount bromo, ijen crater, indonesia adventure',
      de: 'bromo tour, ijen tour, ostjava reisen, mount bromo, ijen krater, indonesien abenteuer',
      nl: 'bromo tour, ijen tour, oost-java reizen, mount bromo, ijen krater, indonesië avontuur',
      zh: '布罗莫旅游, 伊真旅游, 东爪哇旅游, 布罗莫山, 伊真火山口, 印度尼西亚冒险'
    };
    
    const keywords = languageKeywords[language as keyof typeof languageKeywords] || languageKeywords.en;
    
    const seoData = {
      pageType,
      pageSlug,
      title: translatedContent.title || `${pageType} - Bromo Ijen Tour`,
      description: translatedContent.description || translatedContent.excerpt || 'Experience the best volcanic adventures',
      keywords,
      canonicalUrl: language === 'id' 
        ? `${siteUrl}/${pageType}/${pageSlug}`
        : `${siteUrl}/${language}/${pageType}/${pageSlug}`,
      ogImage: translatedContent.image || '/og-default.jpg',
      ogType: pageType === 'blog' ? 'article' : 'website',
      noIndex: false
    };

    await prisma.seoData.upsert({
      where: {
        pageType_pageSlug: {
          pageType,
          pageSlug
        }
      },
      update: seoData,
      create: seoData
    });

    console.log(`✅ Updated SEO for ${pageType}/${pageSlug} in ${language}`);
    return seoData;
  } catch (error) {
    console.error('Error updating SEO for translation:', error);
    return null;
  }
}
