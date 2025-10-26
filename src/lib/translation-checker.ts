/**
 * Translation Coverage Checker System
 * 
 * Checks apakah semua text dalam section sudah tertranslate dengan lengkap
 * untuk semua bahasa yang supported (ID, EN, DE, NL, ZH)
 */

import prisma from '@/lib/prisma';

// Remove unused constants and types

interface TranslationStatus {
  section: string;
  contentId: string;
  contentTitle: string;
  languages: {
    id: LanguageStatus;
    en: LanguageStatus;
    de: LanguageStatus;
    nl: LanguageStatus;
    zh: LanguageStatus;
  };
  overallCoverage: number; // percentage 0-100
  missingLanguages: string[];
  status: 'complete' | 'partial' | 'missing';
}

interface LanguageStatus {
  exists: boolean;
  isAutoTranslated: boolean;
  completeness: number; // percentage of fields filled
  missingFields: string[];
}

interface SectionCoverage {
  section: string;
  totalItems: number;
  translatedItems: number;
  coveragePercentage: number;
  items: TranslationStatus[];
}

/**
 * Check translation coverage untuk Packages
 */
export async function checkPackageTranslations(): Promise<SectionCoverage> {
  const packages = await prisma.package.findMany({
    where: { status: 'published' },
    select: { id: true, title: true }
  });

  const items: TranslationStatus[] = [];

  for (const pkg of packages) {
    const translations = await prisma.packageTranslation.findMany({
      where: { packageId: pkg.id }
    });

    const languageStatuses: Record<string, LanguageStatus> = {
      id: { exists: true, isAutoTranslated: false, completeness: 100, missingFields: [] } // Source language
    };

    // Check each target language
    for (const lang of ['en', 'de', 'nl', 'zh'] as const) {
      const translation = translations.find(t => t.language === lang);
      
      if (translation) {
        // Check completeness - count how many fields are filled
        const fields = [
          'title', 'description', 'longDescription', 'destinations',
          'includes', 'excludes', 'highlights', 'itinerary', 'faqs',
          'groupSize', 'difficulty', 'bestFor', 'departure', 'return', 'location'
        ];
        
        const filledFields = fields.filter(field => {
          const value = translation[field as keyof typeof translation];
          return value !== null && value !== undefined && value !== '';
        });

        const missingFields = fields.filter(field => {
          const value = translation[field as keyof typeof translation];
          return value === null || value === undefined || value === '';
        });

        languageStatuses[lang] = {
          exists: true,
          isAutoTranslated: translation.isAutoTranslated,
          completeness: (filledFields.length / fields.length) * 100,
          missingFields
        };
      } else {
        languageStatuses[lang] = {
          exists: false,
          isAutoTranslated: false,
          completeness: 0,
          missingFields: ['all']
        };
      }
    }

    // Calculate overall coverage
    const targetLanguages = ['en', 'de', 'nl', 'zh'];
    const totalCoverage = targetLanguages.reduce((sum, lang) => {
      return sum + languageStatuses[lang].completeness;
    }, 0);
    const overallCoverage = totalCoverage / targetLanguages.length;

    // Find missing languages
    const missingLanguages = targetLanguages.filter(
      lang => !languageStatuses[lang].exists
    );

    // Determine status
    let status: 'complete' | 'partial' | 'missing';
    if (overallCoverage === 100) {
      status = 'complete';
    } else if (overallCoverage > 0) {
      status = 'partial';
    } else {
      status = 'missing';
    }

    items.push({
      section: 'packages',
      contentId: pkg.id,
      contentTitle: pkg.title,
      languages: languageStatuses as any,
      overallCoverage,
      missingLanguages,
      status
    });
  }

  const translatedItems = items.filter(item => item.status === 'complete').length;
  
  return {
    section: 'packages',
    totalItems: packages.length,
    translatedItems,
    coveragePercentage: packages.length > 0 ? (translatedItems / packages.length) * 100 : 0,
    items
  };
}

/**
 * Check translation coverage untuk Blogs
 */
export async function checkBlogTranslations(): Promise<SectionCoverage> {
  const blogs = await prisma.blog.findMany({
    where: { status: 'published' },
    select: { id: true, title: true }
  });

  const items: TranslationStatus[] = [];

  for (const blog of blogs) {
    const translations = await prisma.blogTranslation.findMany({
      where: { blogId: blog.id }
    });

    const languageStatuses: Record<string, LanguageStatus> = {
      id: { exists: true, isAutoTranslated: false, completeness: 100, missingFields: [] }
    };

    for (const lang of ['en', 'de', 'nl', 'zh'] as const) {
      const translation = translations.find(t => t.language === lang);
      
      if (translation) {
        const fields = ['title', 'excerpt', 'content', 'category', 'tags'];
        const filledFields = fields.filter(field => {
          const value = translation[field as keyof typeof translation];
          return value !== null && value !== undefined && value !== '';
        });

        const missingFields = fields.filter(field => {
          const value = translation[field as keyof typeof translation];
          return value === null || value === undefined || value === '';
        });

        languageStatuses[lang] = {
          exists: true,
          isAutoTranslated: translation.isAutoTranslated,
          completeness: (filledFields.length / fields.length) * 100,
          missingFields
        };
      } else {
        languageStatuses[lang] = {
          exists: false,
          isAutoTranslated: false,
          completeness: 0,
          missingFields: ['all']
        };
      }
    }

    const targetLanguages = ['en', 'de', 'nl', 'zh'];
    const totalCoverage = targetLanguages.reduce((sum, lang) => {
      return sum + languageStatuses[lang].completeness;
    }, 0);
    const overallCoverage = totalCoverage / targetLanguages.length;

    const missingLanguages = targetLanguages.filter(
      lang => !languageStatuses[lang].exists
    );

    let status: 'complete' | 'partial' | 'missing';
    if (overallCoverage === 100) {
      status = 'complete';
    } else if (overallCoverage > 0) {
      status = 'partial';
    } else {
      status = 'missing';
    }

    items.push({
      section: 'blogs',
      contentId: blog.id,
      contentTitle: blog.title,
      languages: languageStatuses as any,
      overallCoverage,
      missingLanguages,
      status
    });
  }

  const translatedItems = items.filter(item => item.status === 'complete').length;
  
  return {
    section: 'blogs',
    totalItems: blogs.length,
    translatedItems,
    coveragePercentage: blogs.length > 0 ? (translatedItems / blogs.length) * 100 : 0,
    items
  };
}

/**
 * Check translation coverage untuk Testimonials
 */
export async function checkTestimonialTranslations(): Promise<SectionCoverage> {
  const testimonials = await prisma.testimonial.findMany({
    where: { status: 'approved' },
    select: { id: true, name: true }
  });

  const items: TranslationStatus[] = [];

  for (const testimonial of testimonials) {
    const translations = await prisma.testimonialTranslation.findMany({
      where: { testimonialId: testimonial.id }
    });

    const languageStatuses: Record<string, LanguageStatus> = {
      id: { exists: true, isAutoTranslated: false, completeness: 100, missingFields: [] }
    };

    for (const lang of ['en', 'de', 'nl', 'zh'] as const) {
      const translation = translations.find(t => t.language === lang);
      
      if (translation) {
        const fields = ['name', 'role', 'content', 'packageName', 'location'];
        const filledFields = fields.filter(field => {
          const value = translation[field as keyof typeof translation];
          return value !== null && value !== undefined && value !== '';
        });

        const missingFields = fields.filter(field => {
          const value = translation[field as keyof typeof translation];
          return value === null || value === undefined || value === '';
        });

        languageStatuses[lang] = {
          exists: true,
          isAutoTranslated: translation.isAutoTranslated,
          completeness: (filledFields.length / fields.length) * 100,
          missingFields
        };
      } else {
        languageStatuses[lang] = {
          exists: false,
          isAutoTranslated: false,
          completeness: 0,
          missingFields: ['all']
        };
      }
    }

    const targetLanguages = ['en', 'de', 'nl', 'zh'];
    const totalCoverage = targetLanguages.reduce((sum, lang) => {
      return sum + languageStatuses[lang].completeness;
    }, 0);
    const overallCoverage = totalCoverage / targetLanguages.length;

    const missingLanguages = targetLanguages.filter(
      lang => !languageStatuses[lang].exists
    );

    let status: 'complete' | 'partial' | 'missing';
    if (overallCoverage === 100) {
      status = 'complete';
    } else if (overallCoverage > 0) {
      status = 'partial';
    } else {
      status = 'missing';
    }

    items.push({
      section: 'testimonials',
      contentId: testimonial.id,
      contentTitle: testimonial.name,
      languages: languageStatuses as any,
      overallCoverage,
      missingLanguages,
      status
    });
  }

  const translatedItems = items.filter(item => item.status === 'complete').length;
  
  return {
    section: 'testimonials',
    totalItems: testimonials.length,
    translatedItems,
    coveragePercentage: testimonials.length > 0 ? (translatedItems / testimonials.length) * 100 : 0,
    items
  };
}

/**
 * Check translation coverage untuk Gallery
 */
export async function checkGalleryTranslations(): Promise<SectionCoverage> {
  const galleryItems = await prisma.galleryItem.findMany({
    select: { id: true, title: true }
  });

  const items: TranslationStatus[] = [];

  for (const item of galleryItems) {
    const translations = await prisma.galleryTranslation.findMany({
      where: { galleryId: item.id }
    });

    const languageStatuses: Record<string, LanguageStatus> = {
      id: { exists: true, isAutoTranslated: false, completeness: 100, missingFields: [] }
    };

    for (const lang of ['en', 'de', 'nl', 'zh'] as const) {
      const translation = translations.find(t => t.language === lang);
      
      if (translation) {
        const fields = ['title', 'description', 'tags'];
        const filledFields = fields.filter(field => {
          const value = translation[field as keyof typeof translation];
          return value !== null && value !== undefined && value !== '';
        });

        const missingFields = fields.filter(field => {
          const value = translation[field as keyof typeof translation];
          return value === null || value === undefined || value === '';
        });

        languageStatuses[lang] = {
          exists: true,
          isAutoTranslated: translation.isAutoTranslated,
          completeness: (filledFields.length / fields.length) * 100,
          missingFields
        };
      } else {
        languageStatuses[lang] = {
          exists: false,
          isAutoTranslated: false,
          completeness: 0,
          missingFields: ['all']
        };
      }
    }

    const targetLanguages = ['en', 'de', 'nl', 'zh'];
    const totalCoverage = targetLanguages.reduce((sum, lang) => {
      return sum + languageStatuses[lang].completeness;
    }, 0);
    const overallCoverage = totalCoverage / targetLanguages.length;

    const missingLanguages = targetLanguages.filter(
      lang => !languageStatuses[lang].exists
    );

    let status: 'complete' | 'partial' | 'missing';
    if (overallCoverage === 100) {
      status = 'complete';
    } else if (overallCoverage > 0) {
      status = 'partial';
    } else {
      status = 'missing';
    }

    items.push({
      section: 'gallery',
      contentId: item.id,
      contentTitle: item.title,
      languages: languageStatuses as any,
      overallCoverage,
      missingLanguages,
      status
    });
  }

  const translatedItems = items.filter(item => item.status === 'complete').length;
  
  return {
    section: 'gallery',
    totalItems: galleryItems.length,
    translatedItems,
    coveragePercentage: galleryItems.length > 0 ? (translatedItems / galleryItems.length) * 100 : 0,
    items
  };
}

/**
 * Check ALL sections
 */
export async function checkAllTranslations() {
  const [packages, blogs, testimonials, gallery] = await Promise.all([
    checkPackageTranslations(),
    checkBlogTranslations(),
    checkTestimonialTranslations(),
    checkGalleryTranslations()
  ]);

  const totalItems = packages.totalItems + blogs.totalItems + testimonials.totalItems + gallery.totalItems;
  const translatedItems = packages.translatedItems + blogs.translatedItems + testimonials.translatedItems + gallery.translatedItems;

  return {
    summary: {
      totalItems,
      translatedItems,
      overallCoverage: totalItems > 0 ? (translatedItems / totalItems) * 100 : 0
    },
    sections: {
      packages,
      blogs,
      testimonials,
      gallery
    }
  };
}

/**
 * Get items that need translation (missing or incomplete)
 */
export async function getItemsNeedingTranslation() {
  const allTranslations = await checkAllTranslations();
  
  const needsTranslation = {
    packages: allTranslations.sections.packages.items.filter(item => item.status !== 'complete'),
    blogs: allTranslations.sections.blogs.items.filter(item => item.status !== 'complete'),
    testimonials: allTranslations.sections.testimonials.items.filter(item => item.status !== 'complete'),
    gallery: allTranslations.sections.gallery.items.filter(item => item.status !== 'complete')
  };

  return needsTranslation;
}
