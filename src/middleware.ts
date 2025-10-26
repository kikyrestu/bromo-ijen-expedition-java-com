import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Supported languages (matching Inlang config)
const languages = ['id', 'en', 'de', 'nl', 'zh'];
const defaultLanguage = 'id';

// Public paths that don't need language prefix
const publicPaths = [
  '/api',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/og-default.jpg',
  '/uploads',
  '/tinymce',
  '/cms',
  '/admin',
  '/api-docs',
  '/api-testing',
  '/sections'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Debug logging for language switching
  // if (pathname.includes('/en') || pathname.includes('/de') || pathname.includes('/zh') || pathname.includes('/nl')) {
  //   console.log('🌍 Middleware processing language path:', pathname);
  // }

  // Check if pathname already has a language prefix
  const pathnameHasLanguage = languages.some(
    (lang) => pathname.startsWith(`/${lang}/`) || pathname === `/${lang}`
  );

  // If pathname already has a language prefix, continue
  if (pathnameHasLanguage) {
    return NextResponse.next();
  }

  // Get language from Accept-Language header or default to Indonesian
  const acceptLanguage = request.headers.get('accept-language');
  let detectedLanguage = defaultLanguage;
  
  if (acceptLanguage) {
    // Parse Accept-Language header
    const languages = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase())
      .map(lang => lang.split('-')[0]); // Extract primary language code
    
    // Find first supported language
    detectedLanguage = languages.find(lang => 
      ['id', 'en', 'de', 'nl', 'zh'].includes(lang)
    ) || defaultLanguage;
  }

  // Redirect to language-prefixed URL
  const newUrl = new URL(`/${detectedLanguage}${pathname}`, request.url);
  
  // Preserve query parameters
  newUrl.search = request.nextUrl.search;
  
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (robots file)
     * - sitemap.xml (sitemap file)
     * - og-default.jpg (default OG image)
     * - uploads (uploaded files)
     * - tinymce (TinyMCE assets)
     * - cms (CMS pages)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|og-default.jpg|uploads|tinymce|cms).*)',
  ],
};
