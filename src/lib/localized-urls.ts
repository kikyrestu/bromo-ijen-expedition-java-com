// src/lib/localized-urls.ts
import prisma from '@/lib/prisma';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bromoijen.com';

// Default fallback paths if database is not available
const DEFAULT_PATH_TRANSLATIONS: Record<string, Record<string, string>> = {
  packages: {
    id: 'packages',
    en: 'tours',
    de: 'reisen',
    nl: 'reizen',
    zh: '旅游',
  },
  blog: {
    id: 'blog',
    en: 'blog',
    de: 'blog',
    nl: 'blog',
    zh: '博客',
  },
  gallery: {
    id: 'gallery',
    en: 'gallery',
    de: 'galerie',
    nl: 'galerij',
    zh: '画廊',
  },
  cms: {
    id: 'cms',
    en: 'cms',
    de: 'cms',
    nl: 'cms',
    zh: '内容管理系统',
  },
};

// Get localized URL settings from database
async function getLocalizedUrlSettings(contentType: string) {
  try {
    const settings = await prisma.localizedUrlSettings.findUnique({
      where: { contentType }
    });
    
    if (settings) {
      return {
        id: settings.urlPathId || contentType,
        en: settings.urlPathEn || contentType,
        de: settings.urlPathDe || contentType,
        nl: settings.urlPathNl || contentType,
        zh: settings.urlPathZh || contentType,
      };
    }
  } catch (error) {
    console.error('Error fetching localized URL settings:', error);
  }
  
  // Fallback to default translations
  return DEFAULT_PATH_TRANSLATIONS[contentType] || { id: contentType, en: contentType, de: contentType, nl: contentType, zh: contentType };
}

// Get localized URL for a specific content type and language
export async function getLocalizedPageUrl(lang: string, pageType: string, slug?: string): Promise<string> {
  const pathTranslations = await getLocalizedUrlSettings(pageType);
  const basePath = pathTranslations[lang as keyof typeof pathTranslations] || pageType;
  const url = lang === 'id' ? SITE_URL : `${SITE_URL}/${lang}`;
  
  if (slug) {
    return `${url}/${basePath}/${slug}`;
  }
  return `${url}/${basePath}`;
}

// Generate localized URL for packages/blogs with database-stored paths
export async function generateLocalizedUrl(lang: string, pageType: string, slug: string): Promise<string> {
  const pathTranslations = await getLocalizedUrlSettings(pageType);
  const basePath = pathTranslations[lang as keyof typeof pathTranslations] || pageType;
  const urlPrefix = lang === 'id' ? SITE_URL : `${SITE_URL}/${lang}`;
  return `${urlPrefix}/${basePath}/${slug}`;
}

// Generate hreflang URLs for packages/blogs
export async function generateHreflangUrls(pageType: string, slug: string): Promise<{ lang: string; url: string }[]> {
  const languages = ['id', 'en', 'de', 'nl', 'zh']; // Supported languages
  const urls = await Promise.all(
    languages.map(async lang => ({
      lang,
      url: await generateLocalizedUrl(lang, pageType, slug),
    }))
  );
  return urls;
}

// Update localized URLs for a package
export async function updatePackageLocalizedUrls(packageId: string, slug: string) {
  try {
    const urls = await Promise.all([
      generateLocalizedUrl('id', 'packages', slug),
      generateLocalizedUrl('en', 'packages', slug),
      generateLocalizedUrl('de', 'packages', slug),
      generateLocalizedUrl('nl', 'packages', slug),
      generateLocalizedUrl('zh', 'packages', slug),
    ]);

    const localizedUrls = {
      id: urls[0],
      en: urls[1],
      de: urls[2],
      nl: urls[3],
      zh: urls[4],
    };

    const pathTranslations = await getLocalizedUrlSettings('packages');

    await prisma.package.update({
      where: { id: packageId },
      data: {
        localizedUrls: JSON.stringify(localizedUrls),
        urlPathEn: pathTranslations.en,
        urlPathDe: pathTranslations.de,
        urlPathNl: pathTranslations.nl,
        urlPathZh: pathTranslations.zh,
      },
    });

    return localizedUrls;
  } catch (error) {
    console.error('Error updating package localized URLs:', error);
    return null;
  }
}

// Update localized URLs for a blog
export async function updateBlogLocalizedUrls(blogId: string, slug: string) {
  try {
    const urls = await Promise.all([
      generateLocalizedUrl('id', 'blog', slug),
      generateLocalizedUrl('en', 'blog', slug),
      generateLocalizedUrl('de', 'blog', slug),
      generateLocalizedUrl('nl', 'blog', slug),
      generateLocalizedUrl('zh', 'blog', slug),
    ]);

    const localizedUrls = {
      id: urls[0],
      en: urls[1],
      de: urls[2],
      nl: urls[3],
      zh: urls[4],
    };

    const pathTranslations = await getLocalizedUrlSettings('blog');

    await prisma.blog.update({
      where: { id: blogId },
      data: {
        localizedUrls: JSON.stringify(localizedUrls),
        urlPathEn: pathTranslations.en,
        urlPathDe: pathTranslations.de,
        urlPathNl: pathTranslations.nl,
        urlPathZh: pathTranslations.zh,
      },
    });

    return localizedUrls;
  } catch (error) {
    console.error('Error updating blog localized URLs:', error);
    return null;
  }
}

// Get localized URL settings for CMS
export async function getLocalizedUrlSettingsForCMS() {
  try {
    const settings = await prisma.localizedUrlSettings.findMany({
      orderBy: { contentType: 'asc' }
    });
    
    return settings.map(setting => ({
      id: setting.id,
      contentType: setting.contentType,
      urlPaths: {
        id: setting.urlPathId,
        en: setting.urlPathEn,
        de: setting.urlPathDe,
        nl: setting.urlPathNl,
        zh: setting.urlPathZh,
      },
      autoGenerate: setting.autoGenerate,
      customPattern: setting.customPattern,
    }));
  } catch (error) {
    console.error('Error fetching localized URL settings for CMS:', error);
    return [];
  }
}

// Update localized URL settings from CMS
export async function updateLocalizedUrlSettings(contentType: string, urlPaths: Record<string, string>, autoGenerate: boolean, customPattern?: string) {
  try {
    await prisma.localizedUrlSettings.upsert({
      where: { contentType },
      update: {
        urlPathId: urlPaths.id,
        urlPathEn: urlPaths.en,
        urlPathDe: urlPaths.de,
        urlPathNl: urlPaths.nl,
        urlPathZh: urlPaths.zh,
        autoGenerate,
        customPattern,
      },
      create: {
        id: contentType,
        contentType,
        urlPathId: urlPaths.id,
        urlPathEn: urlPaths.en,
        urlPathDe: urlPaths.de,
        urlPathNl: urlPaths.nl,
        urlPathZh: urlPaths.zh,
        autoGenerate,
        customPattern,
      },
    });

    return true;
  } catch (error) {
    console.error('Error updating localized URL settings:', error);
    return false;
  }
}

// Helper function to detect language from URL
export function detectLanguageFromUrl(url: string): string {
  const pathSegments = url.split('/').filter(Boolean);
  
  if (pathSegments.length === 0) return 'id';
  
  const firstSegment = pathSegments[0];
  const supportedLanguages = ['en', 'de', 'nl', 'zh'];
  
  if (supportedLanguages.includes(firstSegment)) {
    return firstSegment;
  }
  
  return 'id';
}

// Helper function to get canonical URL
export async function getCanonicalUrl(
  language: string,
  contentType: 'packages' | 'blog' | 'gallery',
  slug: string
): Promise<string> {
  // Always use Indonesian as canonical for SEO
  return await generateLocalizedUrl('id', contentType, slug);
}

// Helper function to get alternate URLs for hreflang
export async function getAlternateUrls(
  contentType: 'packages' | 'blog' | 'gallery',
  slug: string
): Promise<Array<{ hreflang: string; href: string }>> {
  const languages = ['id', 'en', 'de', 'nl', 'zh'];
  
  const urls = await Promise.all(
    languages.map(async lang => ({
      hreflang: lang === 'id' ? 'id' : lang,
      href: await generateLocalizedUrl(lang, contentType, slug)
    }))
  );
  
  return urls;
}