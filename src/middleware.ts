import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import routingConfig from './config/routing.json';

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
    '/backups', // Allow access to backup files
    '/assets', // Static assets (images, icons, etc.)
    '/tinymce',
    '/admin',
    '/api-docs',
    '/api-testing',
    '/sections',
    '/maheswaradev', // Admin area
    '/cms', // CMS area
    '/google' // Google verification files
  ];

// Protected routes that require authentication
const protectedRoutes = ['/cms', '/maheswaradev/admin'];

// Public routes that don't require authentication
const publicRoutes = ['/maheswaradev/admin/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ===== AUTHENTICATION CHECK =====
  // Check if path requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute && !isPublicRoute) {
    // Check for session token
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      // No session, redirect to login
      const loginUrl = new URL('/maheswaradev/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Verify session token (lightweight check)
    // Full verification happens in API routes, here we just check if token exists
    // and is not obviously expired
    try {
      // We could add a lightweight token validation here if needed
      // For now, we trust the cookie presence and let API routes do full validation
    } catch (error) {
      // Invalid token, redirect to login
      const loginUrl = new URL('/maheswaradev/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('session_token');
      return response;
    }
  }
  
  // ===== LANGUAGE ROUTING =====
  
  // Skip middleware for public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check routing settings (Single Language Mode)
  // @ts-ignore
  const enableMultiLanguage = routingConfig.enableMultiLanguage !== false;

  // If Multi-language is DISABLED:
  // 1. If path has language prefix (e.g. /en/...), redirect to root (strip prefix)
  // 2. If path has NO prefix, rewrite to default language (internal /id/...)
  if (!enableMultiLanguage) {
    const pathnameHasLanguage = languages.some(
      (lang) => pathname.startsWith(`/${lang}/`) || pathname === `/${lang}`
    );

    if (pathnameHasLanguage) {
      // Strip language prefix
      const newPath = pathname.replace(new RegExp(`^/(${languages.join('|')})`), '') || '/';
      return NextResponse.redirect(new URL(newPath, request.url));
    }

    // Rewrite to default language (internal)
    return NextResponse.rewrite(new URL(`/${defaultLanguage}${pathname}`, request.url));
  }

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
     * - assets (static assets)
     * - tinymce (TinyMCE assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|og-default.jpg|uploads|assets|tinymce|google).*)',
  ],
};
