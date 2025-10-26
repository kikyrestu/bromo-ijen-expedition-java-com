import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { generateLocalizedUrl, generateHreflangUrls } from '@/lib/localized-urls';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Fetch all active pages
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

    const siteUrl = settings?.siteUrl || 'https://bromoijen.com';
    const languages = ['id', 'en', 'de', 'nl', 'zh'];

    // Generate packages URLs with database-stored localized paths
    const packageUrls = await Promise.all(
      packages.filter(pkg => pkg.slug).map(async pkg => {
        const hreflangUrls = await generateHreflangUrls('packages', pkg.slug!);
        return languages.map(async lang => {
          const url = await generateLocalizedUrl(lang, 'packages', pkg.slug!);
          return `  <url>
    <loc>${url}</loc>
    <lastmod>${pkg.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
${hreflangUrls.map(href => `    <xhtml:link rel="alternate" hreflang="${href.lang}" href="${href.url}" />`).join('\n')}
  </url>`;
        });
      })
    );

    // Generate blog URLs with database-stored localized paths
    const blogUrls = await Promise.all(
      blogs.filter(blog => blog.slug).map(async blog => {
        const hreflangUrls = await generateHreflangUrls('blog', blog.slug!);
        return languages.map(async lang => {
          const url = await generateLocalizedUrl(lang, 'blog', blog.slug!);
          return `  <url>
    <loc>${url}</loc>
    <lastmod>${blog.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
${hreflangUrls.map(href => `    <xhtml:link rel="alternate" hreflang="${href.lang}" href="${href.url}" />`).join('\n')}
  </url>`;
        });
      })
    );

    // Flatten the arrays
    const flatPackageUrls = (await Promise.all(packageUrls.flat())).join('\n');
    const flatBlogUrls = (await Promise.all(blogUrls.flat())).join('\n');

    // Build sitemap XML with multi-language support
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  
  <!-- Home Page for all languages -->
${languages.map(lang => {
  const url = lang === 'id' ? siteUrl : `${siteUrl}/${lang}`;
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
${languages.map(altLang => {
  const altUrl = altLang === 'id' ? siteUrl : `${siteUrl}/${altLang}`;
  return `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altUrl}" />`;
}).join('\n')}
  </url>`;
}).join('\n')}

  <!-- Tour Packages for all languages -->
${flatPackageUrls}

  <!-- Blog Posts for all languages -->
${flatBlogUrls}

  <!-- Gallery Page for all languages -->
${languages.map(lang => {
  const url = lang === 'id' 
    ? `${siteUrl}/gallery`
    : `${siteUrl}/${lang}/gallery`;
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
${languages.map(altLang => {
  const altUrl = altLang === 'id' 
    ? `${siteUrl}/gallery`
    : `${siteUrl}/${altLang}/gallery`;
  return `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altUrl}" />`;
}).join('\n')}
  </url>`;
}).join('\n')}

  <!-- CMS Page for all languages -->
${languages.map(lang => {
  const url = lang === 'id' 
    ? `${siteUrl}/cms`
    : `${siteUrl}/${lang}/cms`;
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
${languages.map(altLang => {
  const altUrl = altLang === 'id' 
    ? `${siteUrl}/cms`
    : `${siteUrl}/${altLang}/cms`;
  return `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altUrl}" />`;
}).join('\n')}
  </url>`;
}).join('\n')}

</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}