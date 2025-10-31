# GitHub Copilot Instructions - Tour & Travel Web

## 🎯 Project Overview

**Next.js 15 tourism website** with **multi-language support (5 languages)**, **database-backed translations**, and **Prisma ORM** on MySQL. The site features tour packages, blogs, testimonials, and gallery management through a custom CMS.

**Tech Stack:**
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Database**: MySQL dengan Prisma ORM
- **Editor**: TinyMCE untuk rich text
- **Animations**: Framer Motion
- **Auth**: Custom session-based dengan bcrypt
- **i18n**: Manual database-backed translation system (ID, EN, DE, NL, ZH)

---

## 🏗️ Architecture & Key Patterns

### 1. **Multi-Language Strategy (CRITICAL)**

**Routing Pattern:**
```
bromoijen.com/       → Indonesian (default, no prefix)
bromoijen.com/en/    → English
bromoijen.com/de/    → German
bromoijen.com/nl/    → Dutch
bromoijen.com/zh/    → Chinese
```

**Translation Flow (Manual System):**
1. Content dibuat dalam bahasa Indonesia (base language)
2. Admin trigger translation via button di CMS
3. Translations saved ke database tables (`*_translations`)
4. Frontend fetch dari database (NOT real-time translation)

**DO:**
- ✅ Always fetch translations from database tables (`package_translations`, `blog_translations`, etc)
- ✅ Use `getPackageTranslation()`, `getBlogTranslation()` helpers in `/lib/auto-translate.ts`
- ✅ Call `/api/translations/trigger` untuk manual translation (never auto-translate on CRUD)
- ✅ Check `language` query parameter untuk determine which translation to return

**DON'T:**
- ❌ NEVER call `translationService.translateText()` directly di API routes (slow!)
- ❌ NEVER auto-translate on POST/PUT operations (manual control only)
- ❌ NEVER return untranslated content tanpa fallback ke Indonesian

**Example API Response Pattern:**
```typescript
// GET /api/packages?id=pkg_123&language=en
const pkg = await prisma.package.findUnique({ where: { id } });
const translation = await getPackageTranslation(id, 'en');

return {
  ...pkg,
  ...translation, // Overwrite dengan translated fields
  _isTranslated: !!translation
};
```

### 2. **Database Schema Patterns**

**Custom Prisma Output:**
```typescript
// Import from custom generated path
import { PrismaClient } from '@/generated/prisma';
```

**Key Models:**
- `Package` - Tour packages dengan translations
- `Blog` - Blog posts dengan translations
- `Testimonial` - Customer reviews dengan translations
- `GalleryItem` - Photo gallery dengan translations
- `SectionContent` - Landing page sections (hero, about, etc)
- `NavigationMenu` + `NavigationItem` - Dynamic menu system
- `User` + `Session` - Custom auth (NO NextAuth for admin)

**Translation Tables Pattern:**
```typescript
// Each content type has corresponding translation table
PackageTranslation      → translates Package
BlogTranslation         → translates Blog
TestimonialTranslation  → translates Testimonial
GalleryTranslation      → translates GalleryItem
SectionContentTranslation → translates SectionContent

// All have same structure:
{
  id: string (cuid)
  [contentType]Id: string (foreign key)
  language: string (en, de, nl, zh)
  [translatable fields...]
  isAutoTranslated: boolean
  createdAt, updatedAt: DateTime
  
  @@unique([contentTypeId, language])
}
```

**Connection Retry Pattern:**
```typescript
import { withRetry } from '@/lib/prisma';

// Wrap database operations dengan retry logic
const data = await withRetry(() => 
  prisma.package.findMany()
);
```

### 3. **File Structure & Conventions**

**App Router Structure:**
```
src/app/
├── [lang]/                    # Dynamic language routes
│   ├── layout.tsx            # Language-specific layout
│   ├── page.tsx              # Landing page
│   ├── packages/[slug]/      # Package detail pages
│   └── blog/[slug]/          # Blog detail pages
├── api/                       # API routes
│   ├── cms/                  # CMS endpoints (CRUD, no auto-translate)
│   ├── translations/         # Translation management
│   │   ├── check/           # Coverage checker
│   │   └── trigger/         # Manual translation trigger
│   ├── packages/             # Public package API (with translations)
│   ├── blogs/                # Public blog API (with translations)
│   └── sections/             # Section content API
├── admin/                     # Admin area (legacy, being migrated)
├── cms/                       # New CMS area
└── maheswaradev/             # Admin auth & dashboard
```

**Component Patterns:**
```
src/components/
├── *Client.tsx               # Client components dengan 'use client'
├── *Section.tsx              # Landing page sections
├── TranslationControls.tsx   # Translation trigger UI (for dynamic content)
├── SectionLanguagePreview.tsx # Language preview UI (for static sections)
├── DynamicHeader.tsx         # Fetches navigation from database
└── gotur/                    # Template components (reference only)
```

**Library Utilities:**
```
src/lib/
├── prisma.ts                 # Prisma client dengan retry logic
├── auto-translate.ts         # Translation helpers (get*, auto*, translate*)
├── translation-service.ts    # DeepL API wrapper
├── seo-utils.ts              # Multi-language SEO generation
├── localized-urls.ts         # URL generation per language
└── auth.ts                   # Session management
```

### 4. **API Endpoint Patterns**

**CMS Endpoints (Admin Only, No Auto-Translate):**
```typescript
// POST /api/cms/packages - Create package (Indonesian only)
export async function POST(request: NextRequest) {
  const data = await request.json();
  const pkg = await prisma.package.create({ data });
  
  // ❌ NO auto-translate here!
  return Response.json({ 
    success: true, 
    data: pkg,
    message: "Package created. Use translation button to translate."
  });
}

// PUT /api/cms/packages - Update package
export async function PUT(request: NextRequest) {
  const { id, ...data } = await request.json();
  const pkg = await prisma.package.update({ where: { id }, data });
  
  // ❌ NO auto-translate here either!
  return Response.json({ success: true, data: pkg });
}
```

**Public Endpoints (With Translations):**
```typescript
// GET /api/packages?language=en
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get('language') || 'id';
  
  const packages = await prisma.package.findMany();
  
  // ✅ Fetch translations from database
  const translated = await Promise.all(
    packages.map(async (pkg) => {
      const translation = await getPackageTranslation(pkg.id, language);
      return { ...pkg, ...translation };
    })
  );
  
  return Response.json({ success: true, data: translated });
}
```

**Translation Trigger (Manual):**
```typescript
// POST /api/translations/trigger
// Body: { contentType: 'package' | 'blog' | 'testimonial' | 'gallery' | 'section', contentId: string }
export async function POST(request: NextRequest) {
  const { contentType, contentId, forceRetranslate } = await request.json();
  
  // Trigger background translation for all languages
  await autoTranslate(contentType, contentId, forceRetranslate);
  
  return Response.json({ 
    success: true, 
    message: "Translation triggered. Check database in 30 seconds." 
  });
}
```

### 5. **Authentication & Authorization**

**Custom Session-Based (NO NextAuth for admin):**
```typescript
// Admin login flow
import { hashPassword, comparePassword, generateToken } from '@/lib/auth';

// Login: POST /api/auth/login
const user = await prisma.user.findUnique({ where: { username } });
const valid = await comparePassword(password, user.password);

const session = await prisma.session.create({
  data: {
    userId: user.id,
    token: generateToken(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  }
});

// Set HTTP-only cookie
response.cookies.set('session_token', session.token, { httpOnly: true });
```

**Middleware Protection:**
```typescript
// src/middleware.ts handles:
// 1. Language routing (redirect to /[lang]/ if missing)
// 2. Authentication check for protected routes (/cms, /maheswaradev/admin)
// 3. Session validation via cookie
```

**Protected Routes:**
- `/cms/*` - CMS area (requires session_token)
- `/maheswaradev/admin/*` - Admin area (requires session_token)

**Public Routes:**
- `/maheswaradev/admin/login` - Login page
- All other routes - No auth required

---

## 🔧 Developer Workflows

### **Starting Development**
```bash
npm run dev                          # Start Next.js dev server (port 3000)
npm run db:seed                      # Seed database dengan sample data
npm run db:seed-navigation           # Seed navigation menus
```

### **Database Operations**
```bash
npx prisma generate                  # Generate Prisma client ke src/generated/prisma
npx prisma db push                   # Push schema changes ke database
npx prisma studio                    # Open Prisma Studio (database GUI)
npx prisma migrate dev --name xxx    # Create migration (production)
```

### **Testing Translation Flow**
```bash
# 1. Create content via CMS UI atau API
curl -X POST http://localhost:3000/api/cms/packages \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Package","description":"Test","price":500000}'

# 2. Trigger translation (manual)
curl -X POST http://localhost:3000/api/translations/trigger \
  -H "Content-Type: application/json" \
  -d '{"contentType":"package","contentId":"pkg_xxx","forceRetranslate":false}'

# 3. Wait 30 seconds, then check
curl http://localhost:3000/api/packages?id=pkg_xxx&language=en
curl http://localhost:3000/api/packages?id=pkg_xxx&language=de

# 4. Check translation coverage
curl http://localhost:3000/api/translations/check?section=all
```

### **Debugging Tools**
- **Translation Coverage Dashboard**: `/admin/translations` (visual monitoring)
- **Translation Debug Panel**: Floating button di landing page (check section status)
- **Prisma Studio**: `npx prisma studio` (inspect database records)
- **API Testing UI**: `/api-testing` (manual API testing interface)
- **API Documentation**: `/api-docs` (auto-generated API docs)

---

## 🎨 Component Development Guidelines

### **Creating Translation-Aware Components**

**For Dynamic Content (Packages, Blogs, etc):**
```tsx
// Use TranslationControls component
import TranslationControls from '@/components/TranslationControls';

<TranslationControls
  contentType="package"  // 'package' | 'blog' | 'testimonial' | 'gallery'
  contentId={packageId}
  onTranslationComplete={() => {
    toast.success('Translations saved!');
    refreshData();
  }}
/>
```

**For Static Content (Sections like Hero, About):**
```tsx
// Use SectionLanguagePreview component
import SectionLanguagePreview from '@/components/SectionLanguagePreview';

<SectionLanguagePreview
  sectionType="hero"  // 'hero' | 'about' | 'whyChooseUs' | etc.
  currentContent={{
    title: formData.title,
    subtitle: formData.subtitle,
    description: formData.description,
  }}
/>
```

### **Client vs Server Components**

**When to use 'use client':**
- Interactive forms dengan state management
- Components dengan onClick, onChange handlers
- Components using hooks (useState, useEffect, etc)
- Animation components (Framer Motion)
- TinyMCE editor wrappers

**When to use Server Components:**
- Data fetching components
- Static rendering components
- SEO-critical content rendering
- Layout components tanpa interactivity

**Example Pattern:**
```tsx
// page.tsx (Server Component)
export default async function PackagePage({ params }: { params: { slug: string } }) {
  const pkg = await getPackage(params.slug);
  return <PackageClient packageData={pkg} />; // Pass data to client
}

// PackageClient.tsx (Client Component)
'use client';
export default function PackageClient({ packageData }: { packageData: Package }) {
  const [qty, setQty] = useState(1);
  // Interactive logic here
}
```

---

## 📊 SEO & Performance

### **Multi-Language SEO Implementation**

**Hreflang Tags (Required):**
```tsx
// Automatically generated in metadata
<link rel="alternate" hreflang="id" href="https://bromoijen.com/packages/xxx" />
<link rel="alternate" hreflang="en" href="https://bromoijen.com/en/packages/xxx" />
<link rel="alternate" hreflang="de" href="https://bromoijen.com/de/packages/xxx" />
<link rel="alternate" hreflang="nl" href="https://bromoijen.com/nl/packages/xxx" />
<link rel="alternate" hreflang="zh" href="https://bromoijen.com/zh/packages/xxx" />
```

**Canonical URLs:**
```typescript
// Indonesian version ALWAYS canonical
const canonicalUrl = `https://bromoijen.com/packages/${slug}`;
```

**Sitemap Generation:**
```typescript
// Multi-language sitemap automatically includes all translations
// Generated at /sitemap.xml
// Includes xhtml:link for alternate languages
```

### **Performance Best Practices**

**Database Query Optimization:**
```typescript
// ✅ GOOD: Single query dengan relations
const pkg = await prisma.package.findUnique({
  where: { id },
  include: { translations: true }
});

// ❌ BAD: Multiple queries in loop
for (const pkg of packages) {
  const translation = await prisma.packageTranslation.findFirst(...);
}

// ✅ BETTER: Batch fetch translations
const translations = await prisma.packageTranslation.findMany({
  where: { packageId: { in: packageIds } }
});
```

**Image Optimization:**
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image 
  src={pkg.image}
  alt={pkg.title}
  width={800}
  height={600}
  priority={isFeatured}
  loading={isFeatured ? "eager" : "lazy"}
/>
```

---

## 🚨 Common Pitfalls & Solutions

### **1. Translation Not Showing**
**Problem:** User changes language tapi content masih bahasa Indonesia

**Debug Steps:**
1. Check database: `SELECT * FROM package_translations WHERE packageId = 'xxx' AND language = 'en'`
2. Check API response: `/api/packages?id=xxx&language=en` → should return translated fields
3. Check browser console: Any fetch errors?
4. Trigger translation: POST to `/api/translations/trigger` dengan correct payload

**Solution:** Translation belum di-trigger. Admin harus klik "Translate" button di CMS.

### **2. Slow Page Load**
**Problem:** Landing page load > 5 seconds

**Common Causes:**
- ❌ Real-time translation (fixed: use database translations)
- ❌ N+1 queries (use `include` or batch fetch)
- ❌ Missing indexes (check Prisma schema `@@index`)

**Solution:**
```typescript
// Check terminal logs
// Should see: ✅ Using database translation (50ms)
// NOT: ❌ Translating text via DeepL... (5000ms)
```

### **3. Prisma Connection Pool Errors**
**Problem:** `Error: connection pool timeout` di production

**Solution:** Use `withRetry()` wrapper
```typescript
import { withRetry } from '@/lib/prisma';

const data = await withRetry(() => 
  prisma.package.findMany(),
  3,  // maxRetries
  1000 // delay in ms
);
```

### **4. Build Errors (TypeScript)**
**Problem:** Build fails dengan type errors

**Common Issues:**
- Missing `'use client'` directive on interactive components
- Incorrect Prisma import path (should be `@/generated/prisma`)
- Missing await on async functions

**Solution:**
```typescript
// Always import from generated path
import { PrismaClient } from '@/generated/prisma'; // ✅
import { PrismaClient } from '@prisma/client';     // ❌
```

### **5. Language Switcher Stuck on One Language**
**Problem:** URL stuck di `/en` atau bahasa lain padahal udah switch language

**Cause:** `setLanguage` dari `LanguageContext` hanya update state tanpa redirect URL

**Solution:** Context udah diupdate dengan auto-redirect URL:
```typescript
// LanguageContext.tsx handles URL redirect automatically
const setLanguage = (language: Language) => {
  // ... validation ...
  
  // Extract base path and rebuild URL with new language
  window.location.href = targetUrl; // Force redirect
  
  setCurrentLanguage(language); // Update state
};

// Header components just need to call setLanguage
<select onChange={(e) => setLanguage(e.target.value as Language)}>
```

**Result:**
- ✅ Language switch triggers immediate URL redirect
- ✅ Consistent behavior across all components
- ✅ No need for custom wrapper functions

---

## 🔐 Environment Variables (Required)

```bash
# Database
DATABASE_URL="mysql://user:pass@host:3306/db_name"

# DeepL Translation API
DEEPL_API_KEY="your-deepl-api-key"

# Site Configuration
NEXT_PUBLIC_SITE_URL="https://bromoijen.com"

# Auth (optional, generated if not provided)
JWT_SECRET="your-secret-key"
SESSION_SECRET="your-session-secret"
```

---

## 📚 Key Files Reference

### **Critical Configuration Files:**
- `prisma/schema.prisma` - Database schema dengan custom output path
- `src/middleware.ts` - Language routing + auth protection
- `next.config.ts` - Disables ESLint during builds
- `tsconfig.json` - Path alias `@/*` maps to `src/*`

### **Must-Read for New Features:**
- `dokumentasi.md` - Complete project documentation (BAHASA INDONESIA)
- `MULTI-LANGUAGE-SEO-STRATEGY.md` - SEO implementation guide
- `src/lib/auto-translate.ts` - Translation system core logic
- `src/lib/prisma.ts` - Database connection dengan retry logic

### **Example Implementations:**
- `src/app/api/cms/packages/route.ts` - Full CRUD pattern
- `src/components/TranslationControls.tsx` - Translation UI pattern
- `src/app/[lang]/packages/[slug]/page.tsx` - Dynamic page with translations

---

## 🎯 Quick Decision Tree

**Adding a new content type?**
1. Add model di `prisma/schema.prisma` (with `*Translation` model)
2. Generate Prisma client: `npx prisma generate`
3. Create API routes di `/api/cms/[contentType]/` (POST/PUT/DELETE)
4. Add translation helpers di `/lib/auto-translate.ts`
5. Create UI component dengan `TranslationControls`
6. Add to translation coverage checker

**Adding a new language?**
1. Add to `SUPPORTED_LANGUAGES` di `middleware.ts`
2. Add to `languages` array di translation utilities
3. Update Prisma schema translation tables (no change needed, dynamic)
4. Test with `/api/translations/trigger`

**Adding a new page/route?**
1. Create under `src/app/[lang]/` untuk multi-language support
2. Use async Server Component untuk data fetching
3. Add metadata export untuk SEO
4. Test all language variants

---

## ✅ Code Review Checklist

Before submitting code, verify:

- [ ] Prisma imports use `@/generated/prisma` (not `@prisma/client`)
- [ ] API routes handle `language` query parameter
- [ ] Translations fetched from database (no real-time translation)
- [ ] Client components have `'use client'` directive
- [ ] Database queries use `withRetry()` wrapper
- [ ] No hardcoded strings (use translation system)
- [ ] SEO metadata includes all languages (hreflang tags)
- [ ] Images use Next.js `<Image>` component
- [ ] Error handling with try/catch and proper error messages
- [ ] TypeScript types properly defined (no `any` unless necessary)

---

**Last Updated:** October 26, 2025  
**Maintained By:** kikyrestu  
**Project Status:** Active Development
