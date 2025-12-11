import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getPackageTranslation } from '@/lib/auto-translate';
import { updatePackageLocalizedUrls } from '@/lib/localized-urls';

// Helper function to parse JSON fields safely
function safeParse(jsonString: string | null, fallback: any = []) {
  if (!jsonString) return fallback;
  try {
    // Normalize JSON string:
    // 1. Replace Chinese comma (、) with standard comma
    // 2. Replace Chinese period (。) at end with nothing
    // 3. Remove trailing period/comma before closing bracket
    let normalized = jsonString
      .replace(/、/g, ',')           // Chinese comma → standard comma
      .replace(/」/g, '"')           // Chinese closing quote → standard quote
      .replace(/「/g, '"')           // Chinese opening quote → standard quote  
      .replace(/]。$/g, ']')         // Remove Chinese period at end
      .replace(/]\s*\.\s*$/g, ']')  // Remove trailing period
      .replace(/,\s*]/g, ']')        // Remove trailing comma before ]
      .trim();
    
    return JSON.parse(normalized);
  } catch (error) {
    console.error(`❌ Failed to parse JSON:`, jsonString?.substring(0, 100), error);
    return fallback;
  }
}

// Helper function to format package for API response
function formatPackage(pkg: any) {
  const price = Number(pkg.price);
  const originalPrice = pkg.originalPrice ? Number(pkg.originalPrice) : null;

  return {
    id: pkg.id,
    slug: pkg.slug || pkg.id,
    title: pkg.title,
    name: pkg.title,
    duration: pkg.duration,
    price: isNaN(price) ? 'Rp 0' : `Rp ${price.toLocaleString('id-ID')}`,
    priceRaw: isNaN(price) ? 0 : price,
    originalPrice: originalPrice && !isNaN(originalPrice) ? `Rp ${originalPrice.toLocaleString('id-ID')}` : null,
    originalPriceRaw: originalPrice && !isNaN(originalPrice) ? originalPrice : null,
    discount: pkg.discount,
    rating: pkg.rating,
    reviews: pkg.reviewCount,
    reviewCount: pkg.reviewCount,
    category: pkg.category,
    description: pkg.description,
    longDescription: pkg.longDescription || null,
    destinations: safeParse(pkg.destinations, []),
    includes: safeParse(pkg.includes, []),
    excludes: safeParse(pkg.excludes, []),
    highlights: safeParse(pkg.highlights, []),
    itinerary: safeParse(pkg.itinerary, []),
    gallery: safeParse(pkg.gallery, []),
    faqs: safeParse(pkg.faqs, []),
    groupSize: pkg.groupSize,
    difficulty: pkg.difficulty,
    bestFor: pkg.bestFor,
    image: pkg.image,
    departure: pkg.departure || null,
    return: pkg.return || null,
    totalPeople: pkg.totalPeople || null,
    location: pkg.location || null,
    mapEmbedUrl: pkg.mapEmbedUrl || null,
    status: pkg.status,
    featured: pkg.featured,
    available: pkg.available,
    createdAt: pkg.createdAt.toISOString(),
    updatedAt: pkg.updatedAt.toISOString()
  };
}

// GET /api/packages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const includeAll = searchParams.get('includeAll') === 'true';
    const language = searchParams.get('language') || 'id';

    // console.log('API Packages called with params:', { category, status, includeAll, language });

    // Build where clause for database query
    const where: any = {};
    
    // Filter by status - default hanya tampilkan published untuk frontend
    if (!includeAll) {
      where.status = 'published';
    } else if (status && status !== 'all') {
      where.status = status;
    }
    
    if (category && category !== 'all') {
      where.category = category;
    }

    // console.log('Where clause:', where);

    // Fetch packages from database
    const packages = await prisma.package.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { rating: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // console.log('Found packages:', packages.length);

    // Format packages
    const formattedPackages = packages.map(pkg => formatPackage(pkg));
    
    // Get translations from database if language is not Indonesian
    let translatedPackages = formattedPackages;
    if (language !== 'id') {
      console.log(`\n🌍 Fetching translations for ${language.toUpperCase()}...`);
      translatedPackages = await Promise.all(
        formattedPackages.map(async (pkg) => {
          // Fetch translation from database
          const translation = await getPackageTranslation(pkg.id, language as any);
          
          if (!translation) {
            console.log(`⚠️  No translation found for package ${pkg.id} in ${language}`);
            return pkg;
          }
          
          console.log(`✅ Translation found for ${pkg.id}:`, {
            title: translation.title ? 'YES' : 'NO',
            highlights: translation.highlights ? 'YES' : 'NO',
            includes: translation.includes ? 'YES' : 'NO',
            excludes: translation.excludes ? 'YES' : 'NO'
          });
          
          // Merge original package with translated fields
          const merged = {
            ...pkg,
            title: translation.title || pkg.title,
            description: translation.description || pkg.description,
            longDescription: translation.longDescription || pkg.longDescription,
            destinations: translation.destinations ? safeParse(translation.destinations, []) : pkg.destinations,
            includes: translation.includes ? safeParse(translation.includes, []) : pkg.includes,
            excludes: translation.excludes ? safeParse(translation.excludes, []) : pkg.excludes,
            highlights: translation.highlights ? safeParse(translation.highlights, []) : pkg.highlights,
            itinerary: translation.itinerary ? safeParse(translation.itinerary, []) : pkg.itinerary,
            faqs: translation.faqs ? safeParse(translation.faqs, []) : pkg.faqs,
            groupSize: translation.groupSize || pkg.groupSize,
            difficulty: translation.difficulty || pkg.difficulty,
            bestFor: translation.bestFor || pkg.bestFor,
            departure: translation.departure || pkg.departure,
            return: translation.return || pkg.return,
            location: translation.location || pkg.location
          };
          
          console.log(`📊 Merged data for ${pkg.id}:`, {
            highlights: Array.isArray(merged.highlights) ? merged.highlights.length : 'NOT ARRAY',
            includes: Array.isArray(merged.includes) ? merged.includes.length : 'NOT ARRAY',
            excludes: Array.isArray(merged.excludes) ? merged.excludes.length : 'NOT ARRAY'
          });
          
          return merged;
        })
      );
    }
    
    return NextResponse.json({
      success: true,
      data: translatedPackages
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch packages', details: (error as Error).message },
      { status: 500 }
    );
  }
}