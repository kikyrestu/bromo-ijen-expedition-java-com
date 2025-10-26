/**
 * Auto-Translation Helper with Database Persistence
 * 
 * ⚠️ DISABLED: Auto-translation is now disabled for manual CMS control
 * This module is kept for reference but auto-translation functions are disabled
 * 
 * Supported Languages: ID, EN, DE, NL, ZH
 */

import prisma from '@/lib/prisma';
import { translationService } from '@/lib/translation-service';

const SUPPORTED_LANGUAGES = ['id', 'en', 'de', 'nl', 'zh'] as const;
const SOURCE_LANGUAGE = 'id'; // Default source language (Indonesian)

type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Remove unused TranslationField interface

interface PackageTranslationData {
  title?: string;
  description?: string;
  longDescription?: string;
  destinations?: string;
  includes?: string;
  excludes?: string;
  highlights?: string;
  itinerary?: string;
  faqs?: string;
  groupSize?: string;
  difficulty?: string;
  bestFor?: string;
  departure?: string;
  return?: string;
  location?: string;
}

interface BlogTranslationData {
  title?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  tags?: string;
}

interface TestimonialTranslationData {
  name?: string;
  role?: string;
  content?: string;
  packageName?: string;
  location?: string;
}

interface GalleryTranslationData {
  title?: string;
  description?: string;
  tags?: string;
}

/**
 * Translate a single text field to target language
 */
async function translateField(
  text: string,
  targetLang: SupportedLanguage
): Promise<string> {
  if (!text || text.trim() === '') {
    return text;
  }

  try {
    // Add timeout protection
    const translated = await Promise.race([
      translationService.translateText(
        text,
        SOURCE_LANGUAGE,
        targetLang
      ),
      new Promise<string>((_, reject) => 
        setTimeout(() => reject(new Error('Translation timeout')), 15000)
      )
    ]);
    console.log(`✅ Translated to ${targetLang}: "${text.substring(0, 50)}..." → "${translated.substring(0, 50)}..."`);
    return translated;
  } catch (error) {
    console.error(`❌ Translation failed for ${targetLang}:`, error);
    return text; // Return original on error
  }
}

/**
 * Translate all fields in a data object
 */
async function translateAllFields(
  data: Record<string, unknown>,
  targetLang: SupportedLanguage,
  depth: number = 0,
  maxDepth: number = 5
): Promise<Record<string, unknown>> {
  // Prevent infinite recursion
  if (depth > maxDepth) {
    console.warn(`⚠️  Max depth ${maxDepth} reached, skipping deep translation`);
    return data;
  }

  const translated: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && value.trim() !== '') {
      // Translate simple string fields
      translated[key] = await translateField(value, targetLang);
    } else if (Array.isArray(value)) {
      // Handle arrays (features, stats, destinations, etc.)
      translated[key] = await Promise.all(
        value.map(async (item) => {
          if (typeof item === 'string') {
            return await translateField(item, targetLang);
          } else if (typeof item === 'object' && item !== null) {
            // Handle objects in arrays (like features with title, description)
            const translatedItem: Record<string, unknown> = {};
            for (const [itemKey, itemValue] of Object.entries(item)) {
              if (typeof itemValue === 'string' && itemValue.trim() !== '') {
                translatedItem[itemKey] = await translateField(itemValue, targetLang);
              } else {
                translatedItem[itemKey] = itemValue;
              }
            }
            return translatedItem;
          } else {
            return item;
          }
        })
      );
    } else if (typeof value === 'object' && value !== null) {
      // Handle nested objects with depth limit
      translated[key] = await translateAllFields(value as Record<string, unknown>, targetLang, depth + 1, maxDepth);
    } else {
      translated[key] = value;
    }
  }

  return translated;
}

/**
 * AUTO-TRANSLATE PACKAGES
 * Translates package content and saves to PackageTranslation table
 */
export async function autoTranslatePackage(
  packageId: string,
  sourceData: PackageTranslationData,
  forceRetranslate: boolean = false
): Promise<void> {
  // ⚠️ AUTO-TRANSLATE DISABLED: Use manual CMS translation instead
  console.log(`🚫 Auto-translate disabled for Package ${packageId}. Use CMS for manual translation.`);
  return;

  const targetLanguages = SUPPORTED_LANGUAGES.filter(lang => lang !== SOURCE_LANGUAGE);

  for (const targetLang of targetLanguages) {
    try {
      console.log(`\n📝 Translating to ${targetLang.toUpperCase()}...`);

      // Check if translation already exists
      const existingTranslation = await prisma.packageTranslation.findUnique({
        where: {
          packageId_language: {
            packageId,
            language: targetLang
          }
        }
      });

      // Skip if exists and not forcing retranslation
      if (existingTranslation && !forceRetranslate) {
        console.log(`⏭️  Translation for ${targetLang} already exists, skipping...`);
        continue;
      }

      // Translate all fields
      const translatedData = await translateAllFields(sourceData as Record<string, unknown>, targetLang);

      // Save or update translation
      await prisma.packageTranslation.upsert({
        where: {
          packageId_language: {
            packageId,
            language: targetLang
          }
        },
        create: {
          packageId,
          language: targetLang,
          isAutoTranslated: true,
          ...translatedData
        },
        update: {
          isAutoTranslated: true,
          ...translatedData,
          updatedAt: new Date()
        }
      });

      console.log(`✅ Saved ${targetLang} translation to database`);
    } catch (error) {
      console.error(`❌ Failed to translate package to ${targetLang}:`, error);
    }
  }

  console.log(`\n🎉 Package ${packageId} translated to all languages!`);
}

/**
 * AUTO-TRANSLATE BLOG
 * Translates blog content and saves to BlogTranslation table
 */
export async function autoTranslateBlog(
  blogId: string,
  sourceData: BlogTranslationData,
  forceRetranslate: boolean = false
): Promise<void> {
  // ⚠️ AUTO-TRANSLATE DISABLED: Use manual CMS translation instead
  console.log(`🚫 Auto-translate disabled for Blog ${blogId}. Use CMS for manual translation.`);
  return;

  const targetLanguages = SUPPORTED_LANGUAGES.filter(lang => lang !== SOURCE_LANGUAGE);

  for (const targetLang of targetLanguages) {
    try {
      console.log(`\n📝 Translating to ${targetLang.toUpperCase()}...`);

      // Check if translation already exists
      const existingTranslation = await prisma.blogTranslation.findUnique({
        where: {
          blogId_language: {
            blogId,
            language: targetLang
          }
        }
      });

      // Skip if exists and not forcing retranslation
      if (existingTranslation && !forceRetranslate) {
        console.log(`⏭️  Translation for ${targetLang} already exists, skipping...`);
        continue;
      }

      // Translate all fields
      const translatedData = await translateAllFields(sourceData as Record<string, unknown>, targetLang);

      // Save or update translation
      await prisma.blogTranslation.upsert({
        where: {
          blogId_language: {
            blogId,
            language: targetLang
          }
        },
        create: {
          blogId,
          language: targetLang,
          isAutoTranslated: true,
          ...translatedData
        },
        update: {
          isAutoTranslated: true,
          ...translatedData,
          updatedAt: new Date()
        }
      });

      console.log(`✅ Saved ${targetLang} translation to database`);
    } catch (error) {
      console.error(`❌ Failed to translate blog to ${targetLang}:`, error);
    }
  }

  console.log(`\n🎉 Blog ${blogId} translated to all languages!`);
}

/**
 * AUTO-TRANSLATE TESTIMONIAL
 * Translates testimonial content and saves to TestimonialTranslation table
 */
export async function autoTranslateTestimonial(
  testimonialId: string,
  sourceData: TestimonialTranslationData,
  forceRetranslate: boolean = false
): Promise<void> {
  // ⚠️ AUTO-TRANSLATE DISABLED: Use manual CMS translation instead
  console.log(`🚫 Auto-translate disabled for Testimonial ${testimonialId}. Use CMS for manual translation.`);
  return;

  const targetLanguages = SUPPORTED_LANGUAGES.filter(lang => lang !== SOURCE_LANGUAGE);

  for (const targetLang of targetLanguages) {
    try {
      console.log(`\n📝 Translating to ${targetLang.toUpperCase()}...`);

      // Check if translation already exists
      const existingTranslation = await prisma.testimonialTranslation.findUnique({
        where: {
          testimonialId_language: {
            testimonialId,
            language: targetLang
          }
        }
      });

      // Skip if exists and not forcing retranslation
      if (existingTranslation && !forceRetranslate) {
        console.log(`⏭️  Translation for ${targetLang} already exists, skipping...`);
        continue;
      }

      // Translate all fields
      const translatedData = await translateAllFields(sourceData as Record<string, unknown>, targetLang);

      // Save or update translation
      await prisma.testimonialTranslation.upsert({
        where: {
          testimonialId_language: {
            testimonialId,
            language: targetLang
          }
        },
        create: {
          testimonialId,
          language: targetLang,
          isAutoTranslated: true,
          ...translatedData
        },
        update: {
          isAutoTranslated: true,
          ...translatedData,
          updatedAt: new Date()
        }
      });

      console.log(`✅ Saved ${targetLang} translation to database`);
    } catch (error) {
      console.error(`❌ Failed to translate testimonial to ${targetLang}:`, error);
    }
  }

  console.log(`\n🎉 Testimonial ${testimonialId} translated to all languages!`);
}

/**
 * AUTO-TRANSLATE GALLERY
 * Translates gallery content and saves to GalleryTranslation table
 */
export async function autoTranslateGallery(
  galleryId: string,
  sourceData: GalleryTranslationData,
  forceRetranslate: boolean = false
): Promise<void> {
  // ⚠️ AUTO-TRANSLATE DISABLED: Use manual CMS translation instead
  console.log(`🚫 Auto-translate disabled for Gallery ${galleryId}. Use CMS for manual translation.`);
  return;

  const targetLanguages = SUPPORTED_LANGUAGES.filter(lang => lang !== SOURCE_LANGUAGE);

  for (const targetLang of targetLanguages) {
    try {
      console.log(`\n📝 Translating to ${targetLang.toUpperCase()}...`);

      // Check if translation already exists
      const existingTranslation = await prisma.galleryTranslation.findUnique({
        where: {
          galleryId_language: {
            galleryId,
            language: targetLang
          }
        }
      });

      // Skip if exists and not forcing retranslation
      if (existingTranslation && !forceRetranslate) {
        console.log(`⏭️  Translation for ${targetLang} already exists, skipping...`);
        continue;
      }

      // Translate all fields
      const translatedData = await translateAllFields(sourceData as Record<string, unknown>, targetLang);

      // Save or update translation
      await prisma.galleryTranslation.upsert({
        where: {
          galleryId_language: {
            galleryId,
            language: targetLang
          }
        },
        create: {
          galleryId,
          language: targetLang,
          isAutoTranslated: true,
          ...translatedData
        },
        update: {
          isAutoTranslated: true,
          ...translatedData,
          updatedAt: new Date()
        }
      });

      console.log(`✅ Saved ${targetLang} translation to database`);
    } catch (error) {
      console.error(`❌ Failed to translate gallery to ${targetLang}:`, error);
    }
  }

  console.log(`\n🎉 Gallery ${galleryId} translated to all languages!`);
}

/**
 * GET TRANSLATED DATA FROM DATABASE
 * Retrieves translated content from database for specific language
 */
export async function getPackageTranslation(
  packageId: string,
  language: SupportedLanguage
): Promise<PackageTranslationData | null> {
  // If source language, return null (will use original data)
  if (language === SOURCE_LANGUAGE) {
    return null;
  }

  try {
    const translation = await prisma.packageTranslation.findUnique({
      where: {
        packageId_language: {
          packageId,
          language
        }
      }
    });

    if (!translation) return null;

    // Convert null to undefined for TypeScript compatibility
    return {
      title: translation.title || undefined,
      description: translation.description || undefined,
      longDescription: translation.longDescription || undefined,
      destinations: translation.destinations || undefined,
      includes: translation.includes || undefined,
      excludes: translation.excludes || undefined,
      highlights: translation.highlights || undefined,
      itinerary: translation.itinerary || undefined,
      faqs: translation.faqs || undefined,
      groupSize: translation.groupSize || undefined,
      difficulty: translation.difficulty || undefined,
      bestFor: translation.bestFor || undefined,
      departure: translation.departure || undefined,
      return: translation.return || undefined,
      location: translation.location || undefined
    };
  } catch (error) {
    console.error(`Failed to get package translation for ${language}:`, error);
    return null;
  }
}

export async function getBlogTranslation(
  blogId: string,
  language: SupportedLanguage
): Promise<BlogTranslationData | null> {
  if (language === SOURCE_LANGUAGE) {
    return null;
  }

  try {
    const translation = await prisma.blogTranslation.findUnique({
      where: {
        blogId_language: {
          blogId,
          language
        }
      }
    });

    if (!translation) return null;

    return {
      title: translation.title || undefined,
      excerpt: translation.excerpt || undefined,
      content: translation.content || undefined,
      category: translation.category || undefined,
      tags: translation.tags || undefined
    };
  } catch (error) {
    console.error(`Failed to get blog translation for ${language}:`, error);
    return null;
  }
}

export async function getTestimonialTranslation(
  testimonialId: string,
  language: SupportedLanguage
): Promise<TestimonialTranslationData | null> {
  if (language === SOURCE_LANGUAGE) {
    return null;
  }

  try {
    const translation = await prisma.testimonialTranslation.findUnique({
      where: {
        testimonialId_language: {
          testimonialId,
          language
        }
      }
    });

    if (!translation) return null;

    return {
      name: translation.name || undefined,
      role: translation.role || undefined,
      content: translation.content || undefined,
      packageName: translation.packageName || undefined,
      location: translation.location || undefined
    };
  } catch (error) {
    console.error(`Failed to get testimonial translation for ${language}:`, error);
    return null;
  }
}

export async function getGalleryTranslation(
  galleryId: string,
  language: SupportedLanguage
): Promise<GalleryTranslationData | null> {
  if (language === SOURCE_LANGUAGE) {
    return null;
  }

  try {
    const translation = await prisma.galleryTranslation.findUnique({
      where: {
        galleryId_language: {
          galleryId,
          language
        }
      }
    });

    if (!translation) return null;

    return {
      title: translation.title || undefined,
      description: translation.description || undefined,
      tags: translation.tags || undefined
    };
  } catch (error) {
    console.error(`Failed to get gallery translation for ${language}:`, error);
    return null;
  }
}

/**
 * BATCH TRANSLATE ALL CONTENT
 * For initial setup or bulk re-translation
 */
export async function batchTranslateAllPackages(forceRetranslate: boolean = false): Promise<void> {
  console.log('🔄 Starting batch translation for all packages...');
  
  const packages = await prisma.package.findMany({
    where: { status: 'published' }
  });

  for (const pkg of packages) {
    await autoTranslatePackage(
      pkg.id,
      {
        title: pkg.title,
        description: pkg.description,
        longDescription: pkg.longDescription || undefined,
        destinations: pkg.destinations,
        includes: pkg.includes,
        excludes: pkg.excludes || undefined,
        highlights: pkg.highlights,
        itinerary: pkg.itinerary || undefined,
        faqs: pkg.faqs || undefined,
        groupSize: pkg.groupSize,
        difficulty: pkg.difficulty,
        bestFor: pkg.bestFor,
        departure: pkg.departure || undefined,
        return: pkg.return || undefined,
        location: pkg.location || undefined
      },
      forceRetranslate
    );
  }

  console.log('✅ Batch translation completed!');
}

/**
 * Auto-translate Section Content
 */
export interface SectionTranslationData {
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  buttonText?: string;
  backgroundVideo?: string;
  image?: string;
  destinations?: string;
  features?: string;
  stats?: string;
  packages?: string;
  testimonials?: string;
  posts?: string;
  items?: string;
  categories?: string;
  displayCount?: number;
  featuredOnly?: boolean;
  category?: string;
  sortBy?: string;
  layoutStyle?: string;
}

export async function autoTranslateSection(
  sectionId: string,
  sourceData: SectionTranslationData,
  forceRetranslate: boolean = false
): Promise<void> {
  // ⚠️ AUTO-TRANSLATE DISABLED: Use manual CMS translation instead
  console.log(`🚫 Auto-translate disabled for Section ${sectionId}. Use CMS for manual translation.`);
  return;

  /* 
  // DISABLED: Auto-translate functionality removed for manual CMS control
  // Target languages (exclude Indonesian)
  const targetLanguages = SUPPORTED_LANGUAGES.filter(lang => lang !== 'id');
  console.log(`🌍 Target languages:`, targetLanguages);

  for (const language of targetLanguages) {
    console.log(`🌍 Processing language: ${language}`);
    try {
      // Check if translation already exists with timeout protection
      const existing = await Promise.race([
        prisma.sectionContentTranslation.findUnique({
          where: {
            sectionId_language: {
              sectionId,
              language
            }
          }
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout')), 10000)
        )
      ]);

      if (existing && !forceRetranslate) {
        console.log(`⏭️  Translation for section ${sectionId} in ${language} already exists, skipping...`);
        continue;
      }

      console.log(`🔄 Translating section ${sectionId} to ${language}...`);

      const translatedData: Record<string, unknown> = {
        sectionId,
        language,
        isAutoTranslated: true
      };

      // Translate simple text fields using translateField
      if (sourceData.title) {
        translatedData.title = await translateField(sourceData.title, language);
      }

      if (sourceData.subtitle) {
        translatedData.subtitle = await translateField(sourceData.subtitle, language);
      }

      if (sourceData.description) {
        translatedData.description = await translateField(sourceData.description, language);
      }

      // DISABLED: Auto-translate functionality removed for manual CMS control
      // All translation logic commented out since auto-translate is disabled
      /*
      if (sourceData.ctaText) {
        translatedData.ctaText = await translateField(sourceData.ctaText, language);
      }

      if (sourceData.buttonText) {
        translatedData.buttonText = await translateField(sourceData.buttonText, language);
      }

      if (sourceData.ctaLink) {
        translatedData.ctaLink = sourceData.ctaLink; // Links don't need translation
      }

      if (sourceData.backgroundVideo) {
        translatedData.backgroundVideo = sourceData.backgroundVideo; // URLs don't need translation
      }

      if (sourceData.image) {
        translatedData.image = sourceData.image; // URLs don't need translation
      }

      // Translate JSON fields (features, stats, destinations, packages, testimonials, posts, items, categories)
      if (sourceData.destinations) {
        try {
          const destinations = JSON.parse(sourceData.destinations);
          const translatedDestinations = await translateAllFields(destinations, language);
          translatedData.destinations = JSON.stringify(translatedDestinations);
        } catch (e) {
          console.log(`⚠️  Error parsing destinations for ${sectionId}:`, e);
          translatedData.destinations = sourceData.destinations;
        }
      }

      if (sourceData.features) {
        try {
          const features = JSON.parse(sourceData.features);
          const translatedFeatures = await translateAllFields(features, language);
          translatedData.features = JSON.stringify(translatedFeatures);
        } catch (e) {
          console.log(`⚠️  Error parsing features for ${sectionId}:`, e);
          translatedData.features = sourceData.features;
        }
      }

      if (sourceData.stats) {
        try {
          const stats = JSON.parse(sourceData.stats);
          const translatedStats = await translateAllFields(stats, language);
          translatedData.stats = JSON.stringify(translatedStats);
        } catch (e) {
          console.log(`⚠️  Error parsing stats for ${sectionId}:`, e);
          translatedData.stats = sourceData.stats;
        }
      }
      */

      // DISABLED: Auto-translate functionality removed for manual CMS control
      /*
      if (sourceData.packages) {
        try {
          const packages = JSON.parse(sourceData.packages);
          const translatedPackages = await translateAllFields(packages, language);
          translatedData.packages = JSON.stringify(translatedPackages);
        } catch (e) {
          console.log(`⚠️  Error parsing packages for ${sectionId}:`, e);
          translatedData.packages = sourceData.packages;
        }
      }

      if (sourceData.testimonials) {
        try {
          const testimonials = JSON.parse(sourceData.testimonials);
          const translatedTestimonials = await translateAllFields(testimonials, language);
          translatedData.testimonials = JSON.stringify(translatedTestimonials);
        } catch (e) {
          console.log(`⚠️  Error parsing testimonials for ${sectionId}:`, e);
          translatedData.testimonials = sourceData.testimonials;
        }
      }

      if (sourceData.posts) {
        try {
          const posts = JSON.parse(sourceData.posts);
          const translatedPosts = await translateAllFields(posts, language);
          translatedData.posts = JSON.stringify(translatedPosts);
        } catch (e) {
          console.log(`⚠️  Error parsing posts for ${sectionId}:`, e);
          translatedData.posts = sourceData.posts;
        }
      }

      if (sourceData.items) {
        try {
          const items = JSON.parse(sourceData.items);
          const translatedItems = await translateAllFields(items, language);
          translatedData.items = JSON.stringify(translatedItems);
        } catch (e) {
          console.log(`⚠️  Error parsing items for ${sectionId}:`, e);
          translatedData.items = sourceData.items;
        }
      }
      */

      // DISABLED: Auto-translate functionality removed for manual CMS control
      /*
      if (sourceData.categories) {
        try {
          const categories = JSON.parse(sourceData.categories);
          const translatedCategories = await translateAllFields(categories, language);
          translatedData.categories = JSON.stringify(translatedCategories);
        } catch (e) {
          console.log(`⚠️  Error parsing categories for ${sectionId}:`, e);
          translatedData.categories = sourceData.categories;
        }
      }

      // Copy non-translatable fields
      if (sourceData.displayCount !== undefined) {
        translatedData.displayCount = sourceData.displayCount;
      }
      if (sourceData.featuredOnly !== undefined) {
        translatedData.featuredOnly = sourceData.featuredOnly;
      }
      if (sourceData.category) {
        translatedData.category = await translateField(sourceData.category, language);
      }
      if (sourceData.sortBy) {
        translatedData.sortBy = sourceData.sortBy; // Technical field, no translation needed
      }
      if (sourceData.layoutStyle) {
        translatedData.layoutStyle = sourceData.layoutStyle; // Technical field, no translation needed
      }
      */

      // DISABLED: Auto-translate functionality removed for manual CMS control
      /*
      // Upsert translation with timeout protection
      await Promise.race([
        prisma.sectionContentTranslation.upsert({
          where: {
            sectionId_language: {
              sectionId,
              language
            }
          },
          update: translatedData as any,
          create: translatedData as any
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Database upsert timeout')), 15000)
        )
      ]);

      console.log(`✅ Section ${sectionId} translated to ${language}`);

    } catch (error) {
      console.error(`❌ Error translating section ${sectionId} to ${language}:`, error);
    }
  }

  console.log(`🎉 Section ${sectionId} translation completed!`);
  */
}

/**
 * Get Section Translation from database
 */
export async function getSectionTranslation(
  sectionId: string,
  language: 'en' | 'de' | 'nl' | 'zh'
): Promise<SectionTranslationData | null> {
  try {
    const translation = await prisma.sectionContentTranslation.findUnique({
      where: {
        sectionId_language: {
          sectionId,
          language
        }
      }
    });

    if (!translation) {
      return null;
    }

    return {
      title: translation.title || undefined,
      subtitle: translation.subtitle || undefined,
      description: translation.description || undefined,
      ctaText: translation.ctaText || undefined,
      buttonText: translation.buttonText || undefined,
      destinations: translation.destinations || undefined,
      features: translation.features || undefined,
      stats: translation.stats || undefined
    };
  } catch (error) {
    console.error(`Error fetching section translation for ${sectionId} (${language}):`, error);
    return null;
  }
}
