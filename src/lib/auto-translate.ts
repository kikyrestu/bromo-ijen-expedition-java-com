/**
 * Auto-Translation Helper with Database Persistence
 * 
 * ⚠️ DISABLED: Auto-translation is now disabled for manual CMS control
 * This module export async function autoTranslatePackage(
  packageId: string,
  sourceData: PackageTranslationData,
  forceRetranslate: boolean = false
): Promise<void> {
  console.log(`\n🔄 Manual translation triggered for Package ${packageId}`);
  
  const targetLanguages = SUPPORTED_LANGUAGES.filter(lang => lang !== SOURCE_LANGUAGE);

  for (const targetLang of targetLanguages) {
    try {
      console.log(`\n📝 Translating package to ${targetLang.toUpperCase()} via DeepL...`);reference but auto-translation functions are disabled
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

async function translateHeaderNavigation(
  targetLang: SupportedLanguage
): Promise<void> {
  if (targetLang === SOURCE_LANGUAGE) {
    return;
  }

  try {
    const navigationItems = await prisma.navigationItem.findMany({
      where: {
        menu: {
          location: 'header'
        }
      },
      include: {
        translations: true
      },
      orderBy: {
        order: 'asc'
      }
    });

    for (const item of navigationItems) {
      const sourceTranslation =
        item.translations.find((translation) => translation.language === SOURCE_LANGUAGE) ||
        item.translations[0];

      if (!sourceTranslation || !sourceTranslation.title?.trim()) {
        continue;
      }

      const translatedTitle = await translateField(sourceTranslation.title, targetLang);
      const translatedUrl = sourceTranslation.url || '#';

      await prisma.navigationItemTranslation.upsert({
        where: {
          itemId_language: {
            itemId: item.id,
            language: targetLang
          }
        },
        update: {
          title: translatedTitle,
          url: translatedUrl
        },
        create: {
          itemId: item.id,
          language: targetLang,
          title: translatedTitle,
          url: translatedUrl
        }
      });
    }
  } catch (error) {
    console.error(`❌ Failed to translate header navigation for ${targetLang}:`, error);
  }
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
 * Detect if text is in Indonesian (source language)
 * Returns true if text appears to be Indonesian
 */
function isIndonesian(text: string): boolean {
  if (!text || text.trim() === '') return true;
  
  // Common Indonesian words that are unlikely in other languages
  const indonesianKeywords = [
    'yang', 'dan', 'dengan', 'untuk', 'dari', 'ini', 'itu', 'di', 'ke', 'pada',
    'adalah', 'akan', 'dapat', 'kami', 'kita', 'saya', 'mereka', 'anda',
    'tahun', 'hari', 'bulan', 'minggu', 'waktu', 'tempat', 'orang', 'baik',
    'besar', 'kecil', 'banyak', 'sedikit', 'lebih', 'kurang', 'sudah', 'belum'
  ];
  
  const lowerText = text.toLowerCase();
  const foundKeywords = indonesianKeywords.filter(keyword => 
    lowerText.includes(` ${keyword} `) || 
    lowerText.startsWith(`${keyword} `) || 
    lowerText.endsWith(` ${keyword}`)
  );
  
  // If we find 2+ Indonesian keywords, it's likely Indonesian
  return foundKeywords.length >= 2;
}

/**
 * Validate if translation result is in target language (not source)
 * Returns true if translation appears to be in target language
 */
function isValidTranslation(original: string, translated: string, targetLang: SupportedLanguage): boolean {
  // If translation is same as original, it might be untranslated
  if (original.toLowerCase().trim() === translated.toLowerCase().trim()) {
    console.warn(`⚠️  Translation result is identical to source: "${original.substring(0, 50)}..."`);
    return false;
  }
  
  // Check if translated text still contains Indonesian keywords
  if (isIndonesian(translated)) {
    console.warn(`⚠️  Translation result still contains Indonesian: "${translated.substring(0, 50)}..."`);
    return false;
  }

  return true;
}
/**
 * Translate a single text field to target language
 * PRODUCTION-READY: No HTML handling needed since source is plain text
 */
async function translateField(
  text: string,
  targetLang: SupportedLanguage
): Promise<string> {
  if (!text || text.trim() === '') {
    return text;
  }

  try {
    // Source data is now plain text (HTML stripped at save time)
    // No need for HTML handling anymore!
    console.log(`🌍 Translating to ${targetLang.toUpperCase()}: "${text.substring(0, 50)}..."`);

    const translated = await Promise.race([
      translationService.translateText(
        text,
        'id',  // FORCE Indonesian as source (not auto-detect)
        targetLang
      ),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Translation timeout')), 15000)
      )
    ]);

    console.log(`   ✅ DeepL result: "${translated.substring(0, 50)}..."`);

    // Validate translation result
    if (!isValidTranslation(text, translated, targetLang)) {
      console.error(`❌ Translation validation FAILED!`);
      console.error(`   Source: "${text.substring(0, 50)}..."`);
      console.error(`   Result: "${translated.substring(0, 50)}..."`);
      console.error(`   ⚠️  WARNING: Translation may still contain Indonesian text!`);

      // Still use the translation (might be better than nothing)
      // but log warning for monitoring
    }

    console.log(`✅ Translation complete for ${targetLang}: "${translated.substring(0, 50)}..."`);
    return translated;

  } catch (error) {
    console.error(`❌ Translation failed for ${targetLang}:`, error);
    throw error; // Throw instead of returning original, so caller knows it failed
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

function prepareTranslationForStorage(data: Record<string, unknown>): Record<string, string | null> {
  const prepared: Record<string, string | null> = {};

  console.log(`📦 Preparing translation data for storage...`);
  
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      console.log(`   ⏭️  Skipping field "${key}": undefined`);
      continue;
    }

    if (value === null) {
      prepared[key] = null;
      console.log(`   ⚠️  Field "${key}": NULL`);
      continue;
    }

    if (typeof value === 'string') {
      prepared[key] = value;
      const preview = value.length > 50 ? value.substring(0, 50) + '...' : value;
      console.log(`   ✅ Field "${key}": "${preview}" (${value.length} chars)`);
      continue;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      prepared[key] = String(value);
      console.log(`   ✅ Field "${key}": ${value} (${typeof value})`);
      continue;
    }

    try {
      prepared[key] = JSON.stringify(value);
      console.log(`   ✅ Field "${key}": JSON array/object (${prepared[key]?.length} chars)`);
    } catch (error) {
      console.warn(`   ❌ Failed to stringify translation field "${key}":`, error);
    }
  }

  const savedFields = Object.keys(prepared);
  console.log(`📦 Total fields prepared: ${savedFields.length}`);
  console.log(`📦 Fields: ${savedFields.join(', ')}`);

  return prepared;
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
  console.log(`\n🚀 Starting translation for Package ${packageId}`);
  
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
      const preparedData = prepareTranslationForStorage(translatedData);

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
          ...preparedData
        },
        update: {
          isAutoTranslated: true,
          ...preparedData,
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
  console.log(`
� Starting translation for Blog ${blogId}`);

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
      const preparedData = prepareTranslationForStorage(translatedData);

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
          ...preparedData
        },
        update: {
          isAutoTranslated: true,
          ...preparedData,
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
  console.log(`
� Starting translation for Testimonial ${testimonialId}`);

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
      const preparedData = prepareTranslationForStorage(translatedData);

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
          ...preparedData
        },
        update: {
          isAutoTranslated: true,
          ...preparedData,
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
  console.log(`
� Starting translation for Gallery ${galleryId}`);

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
      const preparedData = prepareTranslationForStorage(translatedData);

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
          ...preparedData
        },
        update: {
          isAutoTranslated: true,
          ...preparedData,
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
  phone?: string;
  email?: string;
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
  console.log(`\n🔄 ========================================`);
  console.log(`🔄 Starting translation for Section: "${sectionId}"`);
  console.log(`🔄 IMPORTANT: Only translating "${sectionId}" - NOT other sections!`);
  console.log(`🔄 ========================================`);
  
  const targetLanguages = SUPPORTED_LANGUAGES.filter(lang => lang !== SOURCE_LANGUAGE);
  console.log(`🎯 Target languages: ${targetLanguages.join(', ').toUpperCase()}`);

  for (const targetLang of targetLanguages) {
    try {
      console.log(`\n📝 Translating to ${targetLang.toUpperCase()}...`);

      // Check if translation already exists
      const existingTranslation = await prisma.sectionContentTranslation.findUnique({
        where: {
          sectionId_language: {
            sectionId,
            language: targetLang
          }
        }
      });

      if (existingTranslation && !forceRetranslate) {
        console.log(`ℹ️  Translation for ${targetLang} exists (created: ${existingTranslation.createdAt.toISOString()})`);
        console.log(`🔄 Updating with fresh translation from DeepL...`);
      } else if (existingTranslation) {
        console.log(`🔁 FORCE RE-TRANSLATE: Overwriting existing ${targetLang} translation`);
      } else {
        console.log(`🆕 Creating NEW ${targetLang} translation`);
      }

      // ✅ ALWAYS TRANSLATE (no skip!) - either create or update
      console.log(`🌍 Calling DeepL API for ${targetLang}...`);
      const translatedData = await translateAllFields(sourceData as Record<string, unknown>, targetLang);
      const preparedData = prepareTranslationForStorage(translatedData);

      // Save or update translation - CRITICAL: Only for THIS sectionId!
      console.log(`💾 Saving translation to database for sectionId="${sectionId}", language="${targetLang}"`);
      await prisma.sectionContentTranslation.upsert({
        where: {
          sectionId_language: {
            sectionId: sectionId,  // CRITICAL: Must match the input parameter exactly
            language: targetLang
          }
        },
        create: {
          sectionId: sectionId,  // CRITICAL: Create only for THIS section
          language: targetLang,
          isAutoTranslated: true,
          ...preparedData
        },
        update: {
          isAutoTranslated: true,
          ...preparedData,
          updatedAt: new Date()
        }
      });

      console.log(`✅ Successfully saved ${targetLang} translation for section "${sectionId}" to database`);

      if (sectionId === 'header') {
        console.log(`🧭 Translating header navigation items for ${targetLang}...`);
        await translateHeaderNavigation(targetLang);
        console.log(`✅ Header navigation items updated for ${targetLang}`);
      }
    } catch (error) {
      console.error(`❌ Failed to translate section to ${targetLang}:`, error);
    }
  }

  console.log(`\n🎉 Section ${sectionId} translated to all languages!`);
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
      phone: translation.phone || undefined,
      email: translation.email || undefined,
      destinations: translation.destinations || undefined,
      features: translation.features || undefined,
      stats: translation.stats || undefined,
      packages: translation.packages || undefined,
      testimonials: translation.testimonials || undefined,
      posts: translation.posts || undefined,
      items: translation.items || undefined,
      categories: translation.categories || undefined
    };
  } catch (error) {
    console.error(`Error fetching section translation for ${sectionId} (${language}):`, error);
    return null;
  }
}
