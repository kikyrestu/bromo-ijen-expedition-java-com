import { NextRequest, NextResponse } from 'next/server';
import prisma, { withRetry } from '@/lib/prisma';

// Safely parse JSON strings from DB fields
function safeParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value || typeof value !== 'string') return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (e) {
    return fallback;
  }
}

// Helper: map default section object to DB shape (all optionals)
function sectionToDb(sectionData: any) {
  return {
    sectionId: sectionData?.sectionId,
    title: sectionData?.title,
    subtitle: sectionData?.subtitle,
    description: sectionData?.description,
    ctaText: sectionData?.ctaText,
    ctaLink: sectionData?.ctaLink,
    backgroundVideo: sectionData?.backgroundVideo,
    image: sectionData?.image,
    logo: sectionData?.logo,
    phone: sectionData?.phone,
    email: sectionData?.email,
    destinations: sectionData?.destinations ? JSON.stringify(sectionData.destinations) : null,
    features: sectionData?.features ? JSON.stringify(sectionData.features) : null,
    stats: sectionData?.stats ? JSON.stringify(sectionData.stats) : null,
    packages: sectionData?.packages ? JSON.stringify(sectionData.packages) : null,
    testimonials: sectionData?.testimonials ? JSON.stringify(sectionData.testimonials) : null,
    posts: sectionData?.posts ? JSON.stringify(sectionData.posts) : null,
    items: sectionData?.items ? JSON.stringify(sectionData.items) : null,
    categories: sectionData?.categories ? JSON.stringify(sectionData.categories) : null,
    // Display settings (for Tour Packages & Blog sections)
    displayCount: sectionData?.displayCount,
    featuredOnly: sectionData?.featuredOnly,
    category: sectionData?.category,
    sortBy: sectionData?.sortBy,
    layoutStyle: sectionData?.layoutStyle,
  };
}

// Default content for initialization
const defaultSectionContent = {
  hero: {
    title: 'Wonderful Indonesia',
    subtitle: 'Discover the breathtaking beauty of Bromo Ijen',
    description: 'Experience the magic of sunrise over volcanic landscapes and explore the natural wonders of East Java',
    ctaText: 'Explore Now',
    ctaLink: '#packages',
    backgroundVideo: '/hero-video.mp4',
    destinations: [
      { name: 'Mount Bromo', id: 'bromo', position: { x: 30, y: 40 }, description: 'Active volcano with stunning sunrise views' },
      { name: 'Mount Ijen', id: 'ijen', position: { x: 70, y: 60 }, description: 'Blue fire crater and sulfur mining' },
      { name: 'Penanjakan', id: 'penanjakan', position: { x: 50, y: 30 }, description: 'Best viewpoint for Bromo sunrise' }
    ]
  },
  whoAmI: {
    sectionId: 'whoAmI',
    title: 'Tentang Nusantara Tour & Travel',
    subtitle: 'Your Trusted Partner in Bromo Ijen Adventures',
    description: 'Kami adalah perusahaan tour dan travel yang telah berpengalaman lebih dari 10 tahun dalam menyediakan paket wisata Bromo Ijen yang berkualitas tinggi. Dengan tim guide profesional dan armada transportasi yang nyaman, kami berkomitmen memberikan pengalaman wisata yang tak terlupakan.',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200&auto=format&fit=crop',
    features: [
      {
        icon: 'Award',
        title: 'Professional Guide',
        description: 'Tim guide berpengalaman dan bersertifikat'
      },
      {
        icon: 'Shield',
        title: 'Safety First',
        description: 'Prioritas keselamatan dalam setiap perjalanan'
      },
      {
        icon: 'Star',
        title: 'Quality Service',
        description: 'Pelayanan berkualitas dengan standar internasional'
      }
    ],
    stats: [
      { number: '500+', label: 'Happy Customers' },
      { number: '10+', label: 'Years Experience' },
      { number: '50+', label: 'Tour Packages' }
    ]
  },
  whyChooseUs: {
    sectionId: 'whyChooseUs',
    title: 'Why Choose Us',
    subtitle: 'Excellence in Every Journey',
    description: 'We provide exceptional tour experiences with attention to detail and customer satisfaction',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1200&auto=format&fit=crop',
    features: [
      {
        icon: 'MapPin',
        title: 'Expert Local Knowledge',
        description: 'Our guides know every hidden gem and best spots'
      },
      {
        icon: 'Clock',
        title: 'Flexible Scheduling',
        description: 'Customize your itinerary to match your preferences'
      },
      {
        icon: 'Heart',
        title: 'Personalized Service',
        description: 'We treat every guest like family'
      }
    ]
  },
  exclusiveDestinations: {
    title: 'Exclusive Destinations',
    subtitle: 'Discover Bromo Ijen Wonders',
    description: 'Explore our carefully curated destinations that showcase the best of East Java',
    destinations: [
      {
        name: 'Mount Bromo',
        location: 'East Java',
        image: 'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?q=80&w=1200&auto=format&fit=crop',
        description: 'Witness the spectacular sunrise over the active volcano',
        featured: true,
        tours: 3
      },
      {
        name: 'Mount Ijen',
        location: 'East Java',
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
        description: 'Experience the mesmerizing blue fire phenomenon',
        featured: true,
        tours: 4
      },
      {
        name: 'Penanjakan',
        location: 'East Java',
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop',
        description: 'Best viewpoint for Bromo sunrise photography',
        featured: false,
        tours: 3
      },
      {
        name: 'Western Europe',
        location: 'Europe',
        image: 'https://images.unsplash.com/photo-1528901166007-3784c7dd3653?q=80&w=1200&auto=format&fit=crop',
        description: 'Historic cities and breathtaking architecture',
        featured: false,
        tours: 3
      },
      {
        name: 'Scandinavia',
        location: 'Northern Europe',
        image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop',
        description: 'Dramatic fjords and pristine nature',
        featured: false,
        tours: 2
      }
    ]
  },
  tourPackages: {
    title: 'Our Adventure Packages',
    subtitle: 'Choose Your Perfect Bromo Ijen Experience',
    description: 'Handpicked experiences designed for every kind of explorer. Bromo Ijen Tour takes you to Indonesia\'s most awe inspiring volcanic destinations with unforgettable adventures.',
    displayCount: 4,
    featuredOnly: false,
    category: 'all',
    sortBy: 'rating'
  },
  testimonials: {
    title: 'What Our Travelers Say',
    subtitle: 'TESTIMONIALS',
    description: 'Real stories from travelers who turned dreams into unforgettable journeys',
    displayCount: 3,
    featuredOnly: false,
    sortBy: 'newest',
    testimonials: [] // Now managed via /api/testimonials
  },
  blog: {
    title: 'Latest Travel Insights & Expert Tips',
    subtitle: 'Stay Updated with Our Travel Blog',
    description: 'Get the latest tips, guides, and insights for your Bromo Ijen adventure',
    displayCount: 3,
    featuredOnly: false,
    sortBy: 'newest',
    layoutStyle: 'grid',
    posts: [
      {
        id: 'bromo-photography-guide',
        title: 'Complete Guide to Bromo Photography',
        excerpt: 'Master the art of capturing stunning sunrise photos at Mount Bromo with expert tips and techniques',
        content: '<p>Learn how to capture the perfect Bromo sunrise shot with these professional photography tips...</p>',
        author: 'Bromo Ijen Tour Team',
        category: 'Photography',
        tags: ['Bromo', 'Photography', 'Sunrise', 'Tips'],
        readTime: '5 min read',
        publishDate: '2025-01-15',
        image: '/api/placeholder/800/400',
        status: 'published',
        featured: true
      },
      {
        id: 'ijen-hiking-tips',
        title: 'Essential Hiking Tips for Mount Ijen',
        excerpt: 'Everything you need to know before hiking to the blue fire crater',
        content: '<p>Prepare for your Ijen adventure with these essential hiking tips and safety guidelines...</p>',
        author: 'Bromo Ijen Tour Team',
        category: 'Adventure',
        tags: ['Ijen', 'Hiking', 'Blue Fire', 'Adventure'],
        readTime: '7 min read',
        publishDate: '2025-01-10',
        image: '/api/placeholder/800/400',
        status: 'published',
        featured: false
      },
      {
        id: 'budget-travel-guide',
        title: 'Budget Travel Guide to Bromo Ijen',
        excerpt: 'Discover how to explore Bromo and Ijen on a budget without compromising the experience',
        content: '<p>Travel smart and save money with these budget-friendly tips for your Bromo Ijen adventure...</p>',
        author: 'Bromo Ijen Tour Team',
        category: 'Budget Travel',
        tags: ['Budget', 'Tips', 'Travel Guide'],
        readTime: '6 min read',
        publishDate: '2025-01-05',
        image: '/api/placeholder/800/400',
        status: 'published',
        featured: false
      }
    ]
  },
  gallery: {
    title: 'PHOTO GALLERY',
    subtitle: 'Capturing Bromo Ijen Moments',
    description: 'Browse through our collection of stunning photos from Bromo Ijen adventures',
    categories: ['Landscape', 'Adventure', 'Culture', 'Wildlife'],
    items: [
      {
        title: 'Bromo Sunrise',
        category: 'Landscape',
        image: '/api/placeholder/300/200',
        likes: 150,
        views: 1200
      },
      {
        title: 'Ijen Blue Fire',
        category: 'Adventure',
        image: '/api/placeholder/300/200',
        likes: 200,
        views: 1500
      }
    ]
  },
  header: {
    sectionId: 'header',
    logoText: 'Tour',
    logoText2: 'Travel',
    location: 'Jakarta, Indonesia',
    locationShort: 'Jakarta',
    phone: '+62 812-3456-7890',
    phoneShort: '+62 812-3456',
    email: 'info@tourntravel.com',
    emailShort: 'info@tour.com',
    welcomeMessage: 'Welcome to Tour & Travel Indonesia',
    ctaText: 'Book Now',
    navItems: {
      home: 'Home',
      about: 'About',
      whyUs: 'Why Us',
      destinations: 'Destinations',
      packages: 'Packages',
      contact: 'Contact'
    }
  }
};

// DISABLED: Auto translate realtime - now using manual CMS Translation only
// async function translateSectionContent(sectionData: any, language: string) {
//   try {
//     const translatedData = { ...sectionData };
//     
//     // Normalize media URLs to use the new API format
//     const normalizeMediaUrl = (url: string | null | undefined): string | null => {
//       if (!url || typeof url !== 'string') return null;
//       
//       // If it's already in the new API format, return as-is
//       if (url.startsWith('/api/media?file=')) return url;
//       
//       // If it's in the old uploads format, convert to new API format
//       if (url.startsWith('/uploads/')) {
//         const filename = url.replace('/uploads/', '');
//         return `/api/media?file=${encodeURIComponent(filename)}`;
//       }
//       
//       // For other URLs (http/https), return as-is
//       return url;
//     };
//     
//     // Normalize main media URLs
//     if (translatedData.backgroundVideo) {
//       translatedData.backgroundVideo = normalizeMediaUrl(translatedData.backgroundVideo);
//     }
//     if (translatedData.image) {
//       translatedData.image = normalizeMediaUrl(translatedData.image);
//     }
    
//     // Parse JSON string fields from database
//     if (typeof translatedData.features === 'string') {
//       translatedData.features = safeParse(translatedData.features, []);
//     }
//     // Convert features object to array if needed
//     if (translatedData.features && typeof translatedData.features === 'object' && !Array.isArray(translatedData.features)) {
//       translatedData.features = Object.values(translatedData.features);
//     }
//     if (typeof translatedData.stats === 'string') {
//       translatedData.stats = safeParse(translatedData.stats, []);
//     }
//     // Convert stats object to array if needed
//     if (translatedData.stats && typeof translatedData.stats === 'object' && !Array.isArray(translatedData.stats)) {
//       translatedData.stats = Object.values(translatedData.stats);
//     }
//     if (typeof translatedData.destinations === 'string') {
//       translatedData.destinations = safeParse(translatedData.destinations, []);
//     }
//     // Convert destinations object to array if needed
//     if (translatedData.destinations && typeof translatedData.destinations === 'object' && !Array.isArray(translatedData.destinations)) {
//       translatedData.destinations = Object.values(translatedData.destinations);
//     }
//     if (typeof translatedData.packages === 'string') {
//       translatedData.packages = safeParse(translatedData.packages, []);
//     }
//     if (typeof translatedData.testimonials === 'string') {
//       translatedData.testimonials = safeParse(translatedData.testimonials, []);
//     }
//     if (typeof translatedData.posts === 'string') {
//       translatedData.posts = safeParse(translatedData.posts, []);
//     }
//     if (typeof translatedData.items === 'string') {
//       translatedData.items = safeParse(translatedData.items, []);
//     }
//     if (typeof translatedData.categories === 'string') {
//       translatedData.categories = safeParse(translatedData.categories, []);
//     }

//     // Normalize media URLs in arrays
//     if (Array.isArray(translatedData.destinations)) {
//       translatedData.destinations = translatedData.destinations.map((dest: any) => ({
//         ...dest,
//         media: normalizeMediaUrl(dest.media)
//       }));
//     }
//     
//     if (Array.isArray(translatedData.packages)) {
//       translatedData.packages = translatedData.packages.map((pkg: any) => ({
//         ...pkg,
//         image: normalizeMediaUrl(pkg.image),
//         gallery: Array.isArray(pkg.gallery) ? pkg.gallery.map((img: any) => 
//           typeof img === 'string' ? normalizeMediaUrl(img) : img
//         ) : pkg.gallery
//       }));
//     }
//     
//     if (Array.isArray(translatedData.testimonials)) {
//       translatedData.testimonials = translatedData.testimonials.map((testimonial: any) => ({
//         ...testimonial,
//         image: normalizeMediaUrl(testimonial.image)
//       }));
//     }
//     
//     if (Array.isArray(translatedData.posts)) {
//       translatedData.posts = translatedData.posts.map((post: any) => ({
//         ...post,
//         image: normalizeMediaUrl(post.image)
//       }));
//     }
//     
//     if (Array.isArray(translatedData.items)) {
//       translatedData.items = translatedData.items.map((item: any) => ({
//         ...item,
//         image: normalizeMediaUrl(item.image)
//       }));
//     }

//     // If language is Indonesian, check if we need to translate from other languages
//     if (language === 'id') {
//       // Check if the current data is already in Indonesian (default language)
//       // If it's in English or other languages, translate to Indonesian
//       const isEnglishContent = translatedData.title && (
//         translatedData.title.includes('Who Am I') ||
//         translatedData.title.includes('Why Choose Us') ||
//         translatedData.title.includes('About') ||
//         translatedData.title.includes('Professional Guide') ||
//         translatedData.title.includes('Safety First') ||
//         translatedData.title.includes('Quality Service') ||
//         translatedData.title.includes('Expert Local Knowledge') ||
//         translatedData.title.includes('Flexible Scheduling') ||
//         translatedData.title.includes('Personalized Service')
//       );
//       
//       if (isEnglishContent) {
//         console.log(`🔄 Translating section ${sectionData.sectionId} to Indonesian...`);
//         
//         // Translate to Indonesian using DeepL
//         try {
//           if (translatedData.title) {
//             translatedData.title = await translationService.translateText(translatedData.title, 'en', 'id');
//           }
//           if (translatedData.subtitle) {
//             translatedData.subtitle = await translationService.translateText(translatedData.subtitle, 'en', 'id');
//           }
//           if (translatedData.description) {
//             translatedData.description = await translationService.translateText(translatedData.description, 'en', 'id');
//           }
//           if (translatedData.ctaText) {
//             translatedData.ctaText = await translationService.translateText(translatedData.ctaText, 'en', 'id');
//           }
//           if (translatedData.buttonText) {
//             translatedData.buttonText = await translationService.translateText(translatedData.buttonText, 'en', 'id');
//           }
//           
//           // Translate features array
//           if (Array.isArray(translatedData.features)) {
//             for (const feature of translatedData.features) {
//               if (feature.title) {
//                 feature.title = await translationService.translateText(feature.title, 'en', 'id');
//               }
//               if (feature.description) {
//                 feature.description = await translationService.translateText(feature.description, 'en', 'id');
//               }
//             }
//           }
//           
//           // Translate stats array
//           if (Array.isArray(translatedData.stats)) {
//             for (const stat of translatedData.stats) {
//               if (stat.label) {
//                 stat.label = await translationService.translateText(stat.label, 'en', 'id');
//               }
//             }
//           }
//           
//           console.log(`✅ Section translated to Indonesian successfully`);
//         } catch (error) {
//           console.error(`❌ Error translating to Indonesian:`, error);
//         }
//       } else {
//         console.log(`✅ Section data returned (Indonesian - no translation needed)`);
//       }
//       
//       // Final normalization pass to ensure all media URLs are consistent
//       if (translatedData.backgroundVideo) {
//         translatedData.backgroundVideo = normalizeMediaUrl(translatedData.backgroundVideo);
//       }
//       if (translatedData.image) {
//         translatedData.image = normalizeMediaUrl(translatedData.image);
//       }
//       if (Array.isArray(translatedData.destinations)) {
//         translatedData.destinations = translatedData.destinations.map((dest: any) => ({
//           ...dest,
//           media: normalizeMediaUrl(dest.media)
//         }));
//       }
//       
//       return translatedData;
//     }

//     // ⚡ FETCH FROM DATABASE: Get section translations from database
//     const sectionId = sectionData.sectionId || 'unknown';
//     console.log(`🔍 Fetching translation for section ${sectionId} in ${language}`);
//     
//     const translation = await getSectionTranslation(sectionId, language as 'en' | 'de' | 'nl' | 'zh');
//     
//     if (translation) {
//       // Merge translated fields with original data
//       if (translation.title) translatedData.title = translation.title;
//       if (translation.subtitle) translatedData.subtitle = translation.subtitle;
//       if (translation.description) translatedData.description = translation.description;
//       if (translation.ctaText) translatedData.ctaText = translation.ctaText;
//       if (translation.buttonText) translatedData.buttonText = translation.buttonText;
//       if (translation.destinations) {
//         translatedData.destinations = safeParse(translation.destinations, translatedData.destinations);
//         // Convert destinations object to array if needed
//         if (translatedData.destinations && typeof translatedData.destinations === 'object' && !Array.isArray(translatedData.destinations)) {
//           translatedData.destinations = Object.values(translatedData.destinations);
//         }
//       }
//       if (translation.features) {
//         translatedData.features = safeParse(translation.features, translatedData.features);
//         // Convert features object to array if needed
//         if (translatedData.features && typeof translatedData.features === 'object' && !Array.isArray(translatedData.features)) {
//           translatedData.features = Object.values(translatedData.features);
//         }
//       }
//       if (translation.stats) {
//         translatedData.stats = safeParse(translation.stats, translatedData.stats);
//         // Convert stats object to array if needed
//         if (translatedData.stats && typeof translatedData.stats === 'object' && !Array.isArray(translatedData.stats)) {
//           translatedData.stats = Object.values(translatedData.stats);
//         }
//       }
//       
//       console.log(`✅ Using database translation for section ${sectionId} (${language})`);
//       console.log(`   Title: ${translatedData.title}`);
//       console.log(`   Subtitle: ${translatedData.subtitle}`);
//     } else {
//       console.log(`⚠️  No translation found for section ${sectionId} in ${language}, using real-time translation`);
//       console.log(`   Original title: ${translatedData.title}`);
//       
//       // Real-time translation for missing fields
//       try {
//         // Translate basic fields
//         if (translatedData.title) {
//           translatedData.title = await translationService.translateText(translatedData.title, 'id', language);
//         }
//         if (translatedData.subtitle) {
//           translatedData.subtitle = await translationService.translateText(translatedData.subtitle, 'id', language);
//         }
//         if (translatedData.description) {
//           translatedData.description = await translationService.translateText(translatedData.description, 'id', language);
//         }
//         if (translatedData.ctaText) {
//           translatedData.ctaText = await translationService.translateText(translatedData.ctaText, 'id', language);
//         }
//         if (translatedData.buttonText) {
//           translatedData.buttonText = await translationService.translateText(translatedData.buttonText, 'id', language);
//         }
//         
//         // Translate features array
//         if (Array.isArray(translatedData.features)) {
//           for (const feature of translatedData.features) {
//             if (feature.title) {
//               feature.title = await translationService.translateText(feature.title, 'id', language);
//             }
//             if (feature.description) {
//               feature.description = await translationService.translateText(feature.description, 'id', language);
//             }
//           }
//         }
//         
//         // Translate stats array
//         if (Array.isArray(translatedData.stats)) {
//           for (const stat of translatedData.stats) {
//             if (stat.label) {
//               stat.label = await translationService.translateText(stat.label, 'id', language);
//             }
//           }
//         }
//         
//         // Translate destinations array
//         if (Array.isArray(translatedData.destinations)) {
//           for (const destination of translatedData.destinations) {
//             if (destination.name) {
//               destination.name = await translationService.translateText(destination.name, 'id', language);
//             }
//             if (destination.description) {
//               destination.description = await translationService.translateText(destination.description, 'id', language);
//             }
//             if (destination.location) {
//               destination.location = await translationService.translateText(destination.location, 'id', language);
//             }
//         }
//       }
//       
//       console.log(`✅ Real-time translation completed for section ${sectionId} (${language})`);
//     } catch (error) {
//       console.error(`❌ Real-time translation failed for section ${sectionId} (${language}):`, error);
//     }
//   }
//
//   // Final normalization pass to ensure all media URLs are consistent
//   if (translatedData.backgroundVideo) {
//     translatedData.backgroundVideo = normalizeMediaUrl(translatedData.backgroundVideo);
//   }
//   if (translatedData.image) {
//     translatedData.image = normalizeMediaUrl(translatedData.image);
//   }
//   if (Array.isArray(translatedData.destinations)) {
//     translatedData.destinations = translatedData.destinations.map((dest: any) => ({
//       ...dest,
//       media: normalizeMediaUrl(dest.media)
//     }));
//   }
//   if (Array.isArray(translatedData.packages)) {
//     translatedData.packages = translatedData.packages.map((pkg: any) => ({
//       ...pkg,
//       image: normalizeMediaUrl(pkg.image),
//       gallery: Array.isArray(pkg.gallery) ? pkg.gallery.map((img: any) => 
//         typeof img === 'string' ? normalizeMediaUrl(img) : img
//       ) : pkg.gallery
//     }));
//   }
//   if (Array.isArray(translatedData.testimonials)) {
//     translatedData.testimonials = translatedData.testimonials.map((testimonial: any) => ({
//       ...testimonial,
//       image: normalizeMediaUrl(testimonial.image)
//     }));
//   }
//   if (Array.isArray(translatedData.posts)) {
//     translatedData.posts = translatedData.posts.map((post: any) => ({
//       ...post,
//       image: normalizeMediaUrl(post.image)
//     }));
//   }
//   if (Array.isArray(translatedData.items)) {
//     translatedData.items = translatedData.items.map((item: any) => ({
//       ...item,
//       image: normalizeMediaUrl(item.image)
//     }));
//   }

//     return translatedData;
//   } catch (error) {
//     console.error('Error translating section content:', error);
//     return sectionData; // Return original on error
//   }
// }

// Initialize default content non-destructively: create missing sections only
async function initializeDefaultContent() {
  try {
    const existingContent = await prisma.sectionContent.findMany();
    const existingIds = new Set(existingContent.map(s => s.sectionId));

    const sectionKeys = Object.keys(defaultSectionContent) as Array<keyof typeof defaultSectionContent>;

    for (const sectionKey of sectionKeys) {
      if (existingIds.has(sectionKey)) continue;

      const sectionData = defaultSectionContent[sectionKey];

      await prisma.sectionContent.create({
        data: {
          ...sectionToDb(sectionData as any),
        },
      });
    }
  } catch (error) {
    console.error('Error initializing default content:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const language = searchParams.get('language') || 'id';

    if (section) {
      // Return specific section from database
      const sectionData = await withRetry(async () => {
        return await prisma.sectionContent.findUnique({
          where: { sectionId: section }
        });
      });
      
      if (!sectionData) {
        return NextResponse.json(
          { success: false, message: 'Section not found' },
          { status: 404 }
        );
      }

      // Check if translation exists in database
      const translation = await prisma.sectionContentTranslation.findFirst({
        where: {
          sectionId: sectionData.sectionId,
          language: language
        }
      });

      if (translation) {
        // Use database translation
        console.log(`✅ Found database translation for section ${sectionData.sectionId} in ${language}`);
        return NextResponse.json({
          success: true,
          data: {
            id: sectionData.id,
            sectionId: sectionData.sectionId,
            title: translation.title || sectionData.title,
            subtitle: translation.subtitle || sectionData.subtitle,
            description: translation.description || sectionData.description,
            ctaText: translation.ctaText || sectionData.ctaText,
            logo: sectionData.logo,
            phone: sectionData.phone,
            email: sectionData.email,
            ctaLink: sectionData.ctaLink,
            backgroundVideo: sectionData.backgroundVideo,
            image: sectionData.image,
            destinations: translation.destinations ? safeParse(translation.destinations, []) : safeParse(sectionData.destinations, []),
            features: translation.features ? safeParse(translation.features, []) : safeParse(sectionData.features, []),
            stats: translation.stats ? safeParse(translation.stats, []) : safeParse(sectionData.stats, []),
            // packages: translation.packages ? safeParse(translation.packages, []) : safeParse(sectionData.packages, []),
            // testimonials: translation.testimonials ? safeParse(translation.testimonials, []) : safeParse(sectionData.testimonials, []),
            // posts: translation.posts ? safeParse(translation.posts, []) : safeParse(sectionData.posts, []),
            // items: translation.items ? safeParse(translation.items, []) : safeParse(sectionData.items, []),
            // categories: translation.categories ? safeParse(translation.categories, []) : safeParse(sectionData.categories, []),
            // displayCount: translation.displayCount || sectionData.displayCount,
            // featuredOnly: translation.featuredOnly ?? sectionData.featuredOnly,
            // category: translation.category || sectionData.category,
            // sortBy: translation.sortBy || sectionData.sortBy,
            // layoutStyle: translation.layoutStyle || sectionData.layoutStyle,
            createdAt: sectionData.createdAt.toISOString(),
            updatedAt: sectionData.updatedAt.toISOString()
          },
          source: 'database-translation',
          language: language
        });
      } else {
        // No translation found, return original data (NO AUTO TRANSLATE)
        // console.log(`⚠️  No translation found for section ${sectionData.sectionId} in ${language}, returning original data`);
        return NextResponse.json({
          success: true,
          data: {
            id: sectionData.id,
            sectionId: sectionData.sectionId,
            title: sectionData.title,
            subtitle: sectionData.subtitle,
            description: sectionData.description,
            ctaText: sectionData.ctaText,
            logo: sectionData.logo,
            phone: sectionData.phone,
            email: sectionData.email,
            ctaLink: sectionData.ctaLink,
            backgroundVideo: sectionData.backgroundVideo,
            image: sectionData.image,
            destinations: safeParse(sectionData.destinations, []),
            features: safeParse(sectionData.features, []),
            stats: safeParse(sectionData.stats, []),
            packages: safeParse(sectionData.packages, []),
            testimonials: safeParse(sectionData.testimonials, []),
            posts: safeParse(sectionData.posts, []),
            items: safeParse(sectionData.items, []),
            categories: safeParse(sectionData.categories, []),
            displayCount: sectionData.displayCount,
            featuredOnly: sectionData.featuredOnly,
            category: sectionData.category,
            sortBy: sectionData.sortBy,
            layoutStyle: sectionData.layoutStyle,
            createdAt: sectionData.createdAt.toISOString(),
            updatedAt: sectionData.updatedAt.toISOString()
          },
          source: 'original-data',
          language: language,
          message: 'No translation found, using original data. Please translate manually via CMS Translation.'
        });
      }
    }

    // Return all sections from database
    const allSections = await prisma.sectionContent.findMany({
      orderBy: { createdAt: 'asc' }
    });

    const formattedSections = await Promise.all(
      allSections.map(async (sectionData) => {
        // Check if translation exists in database
        const translation = await prisma.sectionContentTranslation.findFirst({
          where: {
            sectionId: sectionData.sectionId,
            language: language
          }
        });

        if (translation) {
          // Use database translation
          return {
            id: sectionData.id,
            sectionId: sectionData.sectionId,
            title: translation.title || sectionData.title,
            subtitle: translation.subtitle || sectionData.subtitle,
            description: translation.description || sectionData.description,
            ctaText: translation.ctaText || sectionData.ctaText,
            // ctaLink: translation.ctaLink || sectionData.ctaLink,
            // backgroundVideo: translation.backgroundVideo || sectionData.backgroundVideo,
            // image: translation.image || sectionData.image,
            destinations: translation.destinations ? safeParse(translation.destinations, []) : safeParse(sectionData.destinations, []),
            features: translation.features ? safeParse(translation.features, []) : safeParse(sectionData.features, []),
            stats: translation.stats ? safeParse(translation.stats, []) : safeParse(sectionData.stats, []),
            // packages: translation.packages ? safeParse(translation.packages, []) : safeParse(sectionData.packages, []),
            // testimonials: translation.testimonials ? safeParse(translation.testimonials, []) : safeParse(sectionData.testimonials, []),
            // posts: translation.posts ? safeParse(translation.posts, []) : safeParse(sectionData.posts, []),
            // items: translation.items ? safeParse(translation.items, []) : safeParse(sectionData.items, []),
            // categories: translation.categories ? safeParse(translation.categories, []) : safeParse(sectionData.categories, []),
            // displayCount: translation.displayCount || sectionData.displayCount,
            // featuredOnly: translation.featuredOnly ?? sectionData.featuredOnly,
            // category: translation.category || sectionData.category,
            // sortBy: translation.sortBy || sectionData.sortBy,
            // layoutStyle: translation.layoutStyle || sectionData.layoutStyle,
            createdAt: sectionData.createdAt.toISOString(),
            updatedAt: sectionData.updatedAt.toISOString()
          };
        } else {
          // No translation found, return original data (NO AUTO TRANSLATE)
          return {
            id: sectionData.id,
            sectionId: sectionData.sectionId,
            title: sectionData.title,
            subtitle: sectionData.subtitle,
            description: sectionData.description,
            ctaText: sectionData.ctaText,
            // ctaLink: sectionData.ctaLink,
            // backgroundVideo: sectionData.backgroundVideo,
            // image: sectionData.image,
            destinations: safeParse(sectionData.destinations, []),
            features: safeParse(sectionData.features, []),
            stats: safeParse(sectionData.stats, []),
            // packages: safeParse(sectionData.packages, []),
            // testimonials: safeParse(sectionData.testimonials, []),
            // posts: safeParse(sectionData.posts, []),
            // items: safeParse(sectionData.items, []),
            // categories: safeParse(sectionData.categories, []),
            // displayCount: sectionData.displayCount,
            // featuredOnly: sectionData.featuredOnly,
            // category: sectionData.category,
            // sortBy: sectionData.sortBy,
            // layoutStyle: sectionData.layoutStyle,
            createdAt: sectionData.createdAt.toISOString(),
            updatedAt: sectionData.updatedAt.toISOString()
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: formattedSections
    });
  } catch (error) {
    console.error('Error fetching section content:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json(
        { success: false, message: 'Section and data are required' },
        { status: 400 }
      );
    }

    // Update section content in database
    const updatedSection = await prisma.sectionContent.upsert({
      where: { sectionId: section },
      update: {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        ctaText: data.ctaText,
        ctaLink: data.ctaLink,
        backgroundVideo: data.backgroundVideo,
        image: data.image,
        destinations: data.destinations ? JSON.stringify(data.destinations) : null,
        features: data.features ? JSON.stringify(data.features) : null,
        stats: data.stats ? JSON.stringify(data.stats) : null,
        packages: data.packages ? JSON.stringify(data.packages) : null,
        testimonials: data.testimonials ? JSON.stringify(data.testimonials) : null,
        posts: data.posts ? JSON.stringify(data.posts) : null,
        items: data.items ? JSON.stringify(data.items) : null,
        categories: data.categories ? JSON.stringify(data.categories) : null,
        // Tour packages settings
        displayCount: data.displayCount,
        featuredOnly: data.featuredOnly,
        category: data.category,
        sortBy: data.sortBy,
      },
      create: {
        sectionId: section,
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        ctaText: data.ctaText,
        ctaLink: data.ctaLink,
        backgroundVideo: data.backgroundVideo,
        image: data.image,
        destinations: data.destinations ? JSON.stringify(data.destinations) : null,
        features: data.features ? JSON.stringify(data.features) : null,
        stats: data.stats ? JSON.stringify(data.stats) : null,
        packages: data.packages ? JSON.stringify(data.packages) : null,
        testimonials: data.testimonials ? JSON.stringify(data.testimonials) : null,
        posts: data.posts ? JSON.stringify(data.posts) : null,
        items: data.items ? JSON.stringify(data.items) : null,
        categories: data.categories ? JSON.stringify(data.categories) : null,
        // Tour packages settings
        displayCount: data.displayCount,
        featuredOnly: data.featuredOnly,
        category: data.category,
        sortBy: data.sortBy,
      },
    });

    // Parse JSON fields for response - field from database are already strings
    const parsedData = {
      ...updatedSection,
      destinations: safeParse(updatedSection.destinations, null as any),
      features: safeParse(updatedSection.features, null as any),
      stats: safeParse(updatedSection.stats, null as any),
      packages: safeParse(updatedSection.packages, null as any),
      testimonials: safeParse(updatedSection.testimonials, null as any),
      posts: safeParse(updatedSection.posts, null as any),
      items: safeParse(updatedSection.items, null as any),
      categories: safeParse(updatedSection.categories, [] as any),
    };

    return NextResponse.json({
      success: true,
      message: 'Section content updated successfully',
      data: parsedData
    });
  } catch (error) {
    console.error('Error updating section content:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json(
        { success: false, message: 'Section and data are required' },
        { status: 400 }
      );
    }

    // Replace entire section content in database
    const replacedSection = await prisma.sectionContent.upsert({
      where: { sectionId: section },
      update: {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        ctaText: data.ctaText,
        ctaLink: data.ctaLink,
        backgroundVideo: data.backgroundVideo,
        image: data.image,
        destinations: data.destinations ? JSON.stringify(data.destinations) : null,
        features: data.features ? JSON.stringify(data.features) : null,
        stats: data.stats ? JSON.stringify(data.stats) : null,
        packages: data.packages ? JSON.stringify(data.packages) : null,
        testimonials: data.testimonials ? JSON.stringify(data.testimonials) : null,
        posts: data.posts ? JSON.stringify(data.posts) : null,
        items: data.items ? JSON.stringify(data.items) : null,
        categories: data.categories ? JSON.stringify(data.categories) : null,
        // Tour packages settings
        displayCount: data.displayCount,
        featuredOnly: data.featuredOnly,
        category: data.category,
        sortBy: data.sortBy,
      },
      create: {
        sectionId: section,
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        ctaText: data.ctaText,
        ctaLink: data.ctaLink,
        backgroundVideo: data.backgroundVideo,
        image: data.image,
        destinations: data.destinations ? JSON.stringify(data.destinations) : null,
        features: data.features ? JSON.stringify(data.features) : null,
        stats: data.stats ? JSON.stringify(data.stats) : null,
        packages: data.packages ? JSON.stringify(data.packages) : null,
        testimonials: data.testimonials ? JSON.stringify(data.testimonials) : null,
        posts: data.posts ? JSON.stringify(data.posts) : null,
        items: data.items ? JSON.stringify(data.items) : null,
        categories: data.categories ? JSON.stringify(data.categories) : null,
        // Tour packages settings
        displayCount: data.displayCount,
        featuredOnly: data.featuredOnly,
        category: data.category,
        sortBy: data.sortBy,
      },
    });

    // Parse JSON fields for response
    const parsedData = {
      ...replacedSection,
      destinations: safeParse(replacedSection.destinations, null as any),
      features: safeParse(replacedSection.features, null as any),
      stats: safeParse(replacedSection.stats, null as any),
      packages: safeParse(replacedSection.packages, null as any),
      testimonials: safeParse(replacedSection.testimonials, null as any),
      posts: safeParse(replacedSection.posts, null as any),
      items: safeParse(replacedSection.items, null as any),
      categories: safeParse(replacedSection.categories, [] as any),
    };

    return NextResponse.json({
      success: true,
      message: 'Section content replaced successfully',
      data: parsedData
    });
  } catch (error) {
    console.error('Error replacing section content:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
