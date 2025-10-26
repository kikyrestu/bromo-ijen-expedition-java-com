// Workaround translation trigger dengan direct database connection + DeepL API
import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// DeepL API configuration
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

// Language mapping
const languageMapping: { [key: string]: string } = {
  'id': 'ID',
  'en': 'EN',
  'de': 'DE',
  'nl': 'NL',
  'zh': 'ZH'
};

// DeepL translation function
async function translateWithDeepL(text: string, from: string, to: string): Promise<string> {
  if (!DEEPL_API_KEY) {
    throw new Error('DeepL API key not configured');
  }

  try {
    const sourceLang = languageMapping[from] || from.toUpperCase();
    const targetLang = languageMapping[to] || to.toUpperCase();

    console.log(`🔄 DeepL: Translating "${text.substring(0, 50)}..." from ${from} to ${to}`);

           const response = await fetch(DEEPL_API_URL, {
             method: 'POST',
             headers: {
               'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
               'Content-Type': 'application/x-www-form-urlencoded',
             },
             body: new URLSearchParams({
               text: text,
               source_lang: sourceLang,
               target_lang: targetLang,
             }).toString(),
             signal: AbortSignal.timeout(15000), // Increased timeout
           });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('DeepL API error:', errorBody);
      throw new Error(`DeepL API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
           if (data.translations && data.translations.length > 0) {
             const translated = data.translations[0].text;
             console.log(`✅ DeepL: "${text.substring(0, 50)}..." → "${translated.substring(0, 50)}..."`);
             
             // Add small delay between translations to avoid rate limiting
             await new Promise(resolve => setTimeout(resolve, 1000));
             
             return translated;
           }
    
    throw new Error('DeepL translation failed');
  } catch (error) {
    console.error('DeepL translation error:', error);
    
    // Handle rate limiting with retry
    if (error instanceof Error && error.message.includes('429')) {
      console.log(`⏳ Rate limit hit, waiting 10 seconds before retry...`);
      await new Promise(resolve => setTimeout(resolve, 10000));
      console.log(`🔄 Retrying translation...`);
      return await translateWithDeepL(text, from, to);
    }
    
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Workaround translation triggered');
    
    const body = await request.json();
    const { contentType, contentId, forceRetranslate = false } = body;

    if (!contentType || !contentId) {
      return NextResponse.json(
        { success: false, error: 'contentType and contentId are required' },
        { status: 400 }
      );
    }

    console.log(`🔵 Workaround translation triggered for ${contentType} ${contentId}`);

    // Direct database connection using DATABASE_URL
    const connection = await mysql.createConnection(process.env.DATABASE_URL || '');

    let result;

    switch (contentType) {
      case 'section': {
        // Get section data with direct query
        const [rows] = await connection.execute(
          'SELECT * FROM section_contents WHERE sectionId = ?',
          [contentId]
        );

        if (!rows || (rows as any[]).length === 0) {
          await connection.end();
          return NextResponse.json(
            { success: false, error: 'Section not found' },
            { status: 404 }
          );
        }

        const section = (rows as any[])[0];
        console.log(`🔵 Section found: ${section.title}`);

        // Simple translation data
        const translationData = {
          title: section.title || undefined,
          subtitle: section.subtitle || undefined,
          description: section.description || undefined,
          ctaText: section.ctaText || undefined,
          destinations: section.destinations || undefined,
          features: section.features || undefined,
          stats: section.stats || undefined
        };

        // Simple translation function
        async function simpleTranslateSection(sectionId: string, sourceData: any) {
          console.log(`🌍 Simple translating section: ${sectionId}`);
          
          const targetLanguages = ['en', 'de', 'nl', 'zh'];
          console.log(`🌍 Target languages:`, targetLanguages);
          
          for (let i = 0; i < targetLanguages.length; i++) {
            const language = targetLanguages[i];
            console.log(`🌍 Processing language: ${language} (${i + 1}/${targetLanguages.length})`);
            
            // Add delay between languages to avoid rate limiting
            if (i > 0) {
              console.log(`⏳ Waiting 5 seconds before next language...`);
              await new Promise(resolve => setTimeout(resolve, 5000));
            }
            
            // Check if translation already exists
            const [existingRows] = await connection.execute(
              'SELECT * FROM section_content_translations WHERE sectionId = ? AND language = ?',
              [sectionId, language]
            );
            
            if ((existingRows as any[]).length > 0 && !forceRetranslate) {
              console.log(`⏭️  Translation for section ${sectionId} in ${language} already exists, but checking if content changed...`);
              
              // Check if content has changed by comparing with source data
              const existingTranslation = (existingRows as any[])[0];
              const contentChanged = 
                existingTranslation.title !== sourceData.title ||
                existingTranslation.subtitle !== sourceData.subtitle ||
                existingTranslation.description !== sourceData.description ||
                existingTranslation.ctaText !== sourceData.ctaText;
              
              if (!contentChanged) {
                console.log(`✅ Content unchanged for section ${sectionId} in ${language}, skipping...`);
                continue;
              } else {
                console.log(`🔄 Content changed for section ${sectionId} in ${language}, retranslating...`);
              }
            }
            
            console.log(`🔄 Translating section ${sectionId} to ${language}...`);
            
            // Real DeepL translation with full content
            console.log(`🌍 DeepL: Starting translation for section ${sectionId} to ${language}...`);
            
            // Translate basic fields
            const translatedData: any = {
              sectionId,
              language,
              title: sourceData.title ? await translateWithDeepL(sourceData.title, 'id', language) : undefined,
              subtitle: sourceData.subtitle ? await translateWithDeepL(sourceData.subtitle, 'id', language) : undefined,
              description: sourceData.description ? await translateWithDeepL(sourceData.description, 'id', language) : undefined,
              ctaText: sourceData.ctaText ? await translateWithDeepL(sourceData.ctaText, 'id', language) : undefined,
              isAutoTranslated: true
            };

            // Translate complex content (features, stats, destinations, etc.)
            console.log(`🌍 DeepL: Translating complex content for section ${sectionId} to ${language}...`);
            
            // Translate features array
            if (sourceData.features) {
              try {
                const features = JSON.parse(sourceData.features);
                if (Array.isArray(features)) {
                  const translatedFeatures = await Promise.all(
                    features.map(async (feature: any) => {
                      const translatedFeature = { ...feature };
                      if (feature.title) {
                        translatedFeature.title = await translateWithDeepL(feature.title, 'id', language);
                      }
                      if (feature.description) {
                        translatedFeature.description = await translateWithDeepL(feature.description, 'id', language);
                      }
                      return translatedFeature;
                    })
                  );
                  translatedData.features = JSON.stringify(translatedFeatures);
                  console.log(`✅ Translated ${translatedFeatures.length} features`);
                }
              } catch (error) {
                console.error('Error translating features:', error);
                translatedData.features = sourceData.features;
              }
            }

            // Translate stats array
            if (sourceData.stats) {
              try {
                const stats = JSON.parse(sourceData.stats);
                if (Array.isArray(stats)) {
                  const translatedStats = await Promise.all(
                    stats.map(async (stat: any) => {
                      const translatedStat = { ...stat };
                      if (stat.label) {
                        translatedStat.label = await translateWithDeepL(stat.label, 'id', language);
                      }
                      if (stat.number) {
                        translatedStat.number = await translateWithDeepL(stat.number, 'id', language);
                      }
                      return translatedStat;
                    })
                  );
                  translatedData.stats = JSON.stringify(translatedStats);
                  console.log(`✅ Translated ${translatedStats.length} stats`);
                }
              } catch (error) {
                console.error('Error translating stats:', error);
                translatedData.stats = sourceData.stats;
              }
            }

            // Translate destinations array
            if (sourceData.destinations) {
              try {
                const destinations = JSON.parse(sourceData.destinations);
                if (Array.isArray(destinations)) {
                  const translatedDestinations = await Promise.all(
                    destinations.map(async (destination: any) => {
                      const translatedDestination = { ...destination };
                      if (destination.name) {
                        translatedDestination.name = await translateWithDeepL(destination.name, 'id', language);
                      }
                      if (destination.description) {
                        translatedDestination.description = await translateWithDeepL(destination.description, 'id', language);
                      }
                      if (destination.location) {
                        translatedDestination.location = await translateWithDeepL(destination.location, 'id', language);
                      }
                      if (destination.category) {
                        translatedDestination.category = await translateWithDeepL(destination.category, 'id', language);
                      }
                      if (destination.highlights && Array.isArray(destination.highlights)) {
                        translatedDestination.highlights = await Promise.all(
                          destination.highlights.map(async (highlight: string) => 
                            await translateWithDeepL(highlight, 'id', language)
                          )
                        );
                      }
                      return translatedDestination;
                    })
                  );
                  translatedData.destinations = JSON.stringify(translatedDestinations);
                  console.log(`✅ Translated ${translatedDestinations.length} destinations`);
                }
              } catch (error) {
                console.error('Error translating destinations:', error);
                translatedData.destinations = sourceData.destinations;
              }
            }

            // Translate packages array
            if (sourceData.packages) {
              try {
                const packages = JSON.parse(sourceData.packages);
                if (Array.isArray(packages)) {
                  const translatedPackages = await Promise.all(
                    packages.map(async (pkg: any) => {
                      const translatedPkg = { ...pkg };
                      if (pkg.title) {
                        translatedPkg.title = await translateWithDeepL(pkg.title, 'id', language);
                      }
                      if (pkg.description) {
                        translatedPkg.description = await translateWithDeepL(pkg.description, 'id', language);
                      }
                      if (pkg.highlights && Array.isArray(pkg.highlights)) {
                        translatedPkg.highlights = await Promise.all(
                          pkg.highlights.map(async (highlight: string) => 
                            await translateWithDeepL(highlight, 'id', language)
                          )
                        );
                      }
                      return translatedPkg;
                    })
                  );
                  translatedData.packages = JSON.stringify(translatedPackages);
                  console.log(`✅ Translated ${translatedPackages.length} packages`);
                }
              } catch (error) {
                console.error('Error translating packages:', error);
                translatedData.packages = sourceData.packages;
              }
            }

            // Translate individual content cards based on section type
            if (sectionId === 'tourPackages') {
              console.log(`🌍 DeepL: Translating individual packages from packages table for tourPackages section...`);
              
              try {
                const [packageRows] = await connection.execute(
                  'SELECT * FROM packages WHERE status = ?',
                  ['published']
                );
                
                if ((packageRows as any[]).length > 0) {
                  console.log(`📦 Found ${(packageRows as any[]).length} published packages to translate`);
                  
                  for (const pkg of packageRows as any[]) {
                    console.log(`🔄 Translating individual package: ${pkg.title}`);
                    
                    // Translate package fields
                    const translatedPackageData = {
                      id: pkg.id,
                      title: pkg.title ? await translateWithDeepL(pkg.title, 'id', language) : pkg.title,
                      description: pkg.description ? await translateWithDeepL(pkg.description, 'id', language) : pkg.description,
                      highlights: pkg.highlights ? await translateWithDeepL(pkg.highlights, 'id', language) : pkg.highlights,
                      includes: pkg.includes ? await translateWithDeepL(pkg.includes, 'id', language) : pkg.includes,
                      excludes: pkg.excludes ? await translateWithDeepL(pkg.excludes, 'id', language) : pkg.excludes,
                      itinerary: pkg.itinerary ? await translateWithDeepL(pkg.itinerary, 'id', language) : pkg.itinerary,
                      language: language,
                      createdAt: pkg.createdAt,
                      updatedAt: new Date()
                    };
                    
                    // Upsert package translation
                    await connection.execute(
                      `INSERT INTO package_translations 
                       (id, packageId, language, title, description, highlights, includes, excludes, itinerary, createdAt, updatedAt) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                       ON DUPLICATE KEY UPDATE 
                       title = VALUES(title), description = VALUES(description), highlights = VALUES(highlights), 
                       includes = VALUES(includes), excludes = VALUES(excludes), itinerary = VALUES(itinerary), 
                       updatedAt = VALUES(updatedAt)`,
                      [
                        `${pkg.id}-${language}-${Date.now()}`,
                        pkg.id,
                        language,
                        translatedPackageData.title,
                        translatedPackageData.description,
                        translatedPackageData.highlights,
                        translatedPackageData.includes,
                        translatedPackageData.excludes,
                        translatedPackageData.itinerary,
                        translatedPackageData.createdAt,
                        translatedPackageData.updatedAt
                      ]
                    );
                    
                    console.log(`✅ Individual package ${pkg.title} translated to ${language}`);
                  }
                  
                  console.log(`🎉 All ${(packageRows as any[]).length} individual packages translated to ${language}`);
                } else {
                  console.log(`⚠️  No published packages found for translation`);
                }
              } catch (error) {
                console.error('Error translating individual packages:', error);
              }
            }

            // Translate individual testimonials for testimonials section
            if (sectionId === 'testimonials') {
              console.log(`🌍 DeepL: Translating individual testimonials from testimonials table for testimonials section...`);
              
              try {
                const [testimonialRows] = await connection.execute(
                  'SELECT * FROM testimonials WHERE status = ?',
                  ['approved']
                );
                
                if ((testimonialRows as any[]).length > 0) {
                  console.log(`💬 Found ${(testimonialRows as any[]).length} approved testimonials to translate`);
                  
                  for (const testimonial of testimonialRows as any[]) {
                    console.log(`🔄 Translating individual testimonial: ${testimonial.name}`);
                    
                    // Translate testimonial fields
                    const translatedTestimonialData = {
                      id: testimonial.id,
                      name: testimonial.name ? await translateWithDeepL(testimonial.name, 'id', language) : testimonial.name,
                      content: testimonial.content ? await translateWithDeepL(testimonial.content, 'id', language) : testimonial.content,
                      location: testimonial.location ? await translateWithDeepL(testimonial.location, 'id', language) : testimonial.location,
                      language: language,
                      createdAt: testimonial.createdAt,
                      updatedAt: new Date()
                    };
                    
                    // Upsert testimonial translation
                    await connection.execute(
                      `INSERT INTO testimonial_translations 
                       (id, testimonialId, language, name, content, location, createdAt, updatedAt) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                       ON DUPLICATE KEY UPDATE 
                       name = VALUES(name), content = VALUES(content), location = VALUES(location), 
                       updatedAt = VALUES(updatedAt)`,
                      [
                        `${testimonial.id}-${language}-${Date.now()}`,
                        testimonial.id,
                        language,
                        translatedTestimonialData.name,
                        translatedTestimonialData.content,
                        translatedTestimonialData.location,
                        translatedTestimonialData.createdAt,
                        translatedTestimonialData.updatedAt
                      ]
                    );
                    
                    console.log(`✅ Individual testimonial ${testimonial.name} translated to ${language}`);
                  }
                  
                  console.log(`🎉 All ${(testimonialRows as any[]).length} individual testimonials translated to ${language}`);
                } else {
                  console.log(`⚠️  No approved testimonials found for translation`);
                }
              } catch (error) {
                console.error('Error translating individual testimonials:', error);
              }
            }

            // Translate individual blog posts for blog section
            if (sectionId === 'blog') {
              console.log(`🌍 DeepL: Translating individual blog posts from blogs table for blog section...`);
              
              try {
                const [blogRows] = await connection.execute(
                  'SELECT * FROM blogs WHERE status = ?',
                  ['published']
                );
                
                if ((blogRows as any[]).length > 0) {
                  console.log(`📝 Found ${(blogRows as any[]).length} published blog posts to translate`);
                  
                  for (const blog of blogRows as any[]) {
                    console.log(`🔄 Translating individual blog post: ${blog.title}`);
                    
                    // Translate blog fields
                    const translatedBlogData = {
                      id: blog.id,
                      title: blog.title ? await translateWithDeepL(blog.title, 'id', language) : blog.title,
                      excerpt: blog.excerpt ? await translateWithDeepL(blog.excerpt, 'id', language) : blog.excerpt,
                      content: blog.content ? await translateWithDeepL(blog.content, 'id', language) : blog.content,
                      category: blog.category ? await translateWithDeepL(blog.category, 'id', language) : blog.category,
                      tags: blog.tags || blog.tags,
                      language: language,
                      createdAt: blog.createdAt,
                      updatedAt: new Date()
                    };
                    
                    // Upsert blog translation
                    await connection.execute(
                      `INSERT INTO blog_translations 
                       (id, blogId, language, title, excerpt, content, category, tags, createdAt, updatedAt) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                       ON DUPLICATE KEY UPDATE 
                       title = VALUES(title), excerpt = VALUES(excerpt), content = VALUES(content), 
                       category = VALUES(category), tags = VALUES(tags), updatedAt = VALUES(updatedAt)`,
                      [
                        `${blog.id}-${language}-${Date.now()}`,
                        blog.id,
                        language,
                        translatedBlogData.title,
                        translatedBlogData.excerpt,
                        translatedBlogData.content,
                        translatedBlogData.category,
                        translatedBlogData.tags,
                        translatedBlogData.createdAt,
                        translatedBlogData.updatedAt
                      ]
                    );
                    
                    console.log(`✅ Individual blog post ${blog.title} translated to ${language}`);
                  }
                  
                  console.log(`🎉 All ${(blogRows as any[]).length} individual blog posts translated to ${language}`);
                } else {
                  console.log(`⚠️  No published blog posts found for translation`);
                }
              } catch (error) {
                console.error('Error translating individual blog posts:', error);
              }
            }

            // Translate individual gallery items for gallery section
            if (sectionId === 'gallery') {
              console.log(`🌍 DeepL: Translating individual gallery items from gallery_items table for gallery section...`);
              
              try {
                const [galleryRows] = await connection.execute(
                  'SELECT * FROM gallery_items'
                );
                
                if ((galleryRows as any[]).length > 0) {
                  console.log(`🖼️  Found ${(galleryRows as any[]).length} gallery items to translate`);
                  
                  for (const galleryItem of galleryRows as any[]) {
                    console.log(`🔄 Translating individual gallery item: ${galleryItem.title}`);
                    
                    // Translate gallery fields
                    const translatedGalleryData = {
                      id: galleryItem.id,
                      title: galleryItem.title ? await translateWithDeepL(galleryItem.title, 'id', language) : galleryItem.title,
                      description: galleryItem.description ? await translateWithDeepL(galleryItem.description, 'id', language) : galleryItem.description,
                      category: galleryItem.category ? await translateWithDeepL(galleryItem.category, 'id', language) : galleryItem.category,
                      tags: galleryItem.tags || galleryItem.tags,
                      language: language,
                      createdAt: galleryItem.createdAt,
                      updatedAt: new Date()
                    };
                    
                    // Upsert gallery translation
                    await connection.execute(
                      `INSERT INTO gallery_translations 
                       (id, galleryId, language, title, description, category, tags, createdAt, updatedAt) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                       ON DUPLICATE KEY UPDATE 
                       title = VALUES(title), description = VALUES(description), category = VALUES(category), 
                       tags = VALUES(tags), updatedAt = VALUES(updatedAt)`,
                      [
                        `${galleryItem.id}-${language}-${Date.now()}`,
                        galleryItem.id,
                        language,
                        translatedGalleryData.title,
                        translatedGalleryData.description,
                        translatedGalleryData.category,
                        translatedGalleryData.tags,
                        translatedGalleryData.createdAt,
                        translatedGalleryData.updatedAt
                      ]
                    );
                    
                    console.log(`✅ Individual gallery item ${galleryItem.title} translated to ${language}`);
                  }
                  
                  console.log(`🎉 All ${(galleryRows as any[]).length} individual gallery items translated to ${language}`);
                } else {
                  console.log(`⚠️  No gallery items found for translation`);
                }
              } catch (error) {
                console.error('Error translating individual gallery items:', error);
              }
            }

            // Translate testimonials array
            if (sourceData.testimonials) {
              try {
                const testimonials = JSON.parse(sourceData.testimonials);
                if (Array.isArray(testimonials)) {
                  const translatedTestimonials = await Promise.all(
                    testimonials.map(async (testimonial: any) => {
                      const translatedTestimonial = { ...testimonial };
                      if (testimonial.name) {
                        translatedTestimonial.name = await translateWithDeepL(testimonial.name, 'id', language);
                      }
                      if (testimonial.content) {
                        translatedTestimonial.content = await translateWithDeepL(testimonial.content, 'id', language);
                      }
                      if (testimonial.location) {
                        translatedTestimonial.location = await translateWithDeepL(testimonial.location, 'id', language);
                      }
                      return translatedTestimonial;
                    })
                  );
                  translatedData.testimonials = JSON.stringify(translatedTestimonials);
                  console.log(`✅ Translated ${translatedTestimonials.length} testimonials`);
                }
              } catch (error) {
                console.error('Error translating testimonials:', error);
                translatedData.testimonials = sourceData.testimonials;
              }
            }
            
            console.log(`🌍 DeepL: Translation completed for section ${sectionId} to ${language}`);
            
            // Upsert translation
            await connection.execute(
              `INSERT INTO section_content_translations 
               (id, sectionId, language, title, subtitle, description, ctaText, destinations, features, stats, isAutoTranslated, createdAt, updatedAt) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
               ON DUPLICATE KEY UPDATE 
               title = VALUES(title), subtitle = VALUES(subtitle), description = VALUES(description), 
               ctaText = VALUES(ctaText), destinations = VALUES(destinations), features = VALUES(features), 
               stats = VALUES(stats), isAutoTranslated = VALUES(isAutoTranslated), updatedAt = NOW()`,
              [
                `${sectionId}-${language}-${Date.now()}`, // Generate unique ID
                translatedData.sectionId,
                translatedData.language,
                translatedData.title || null,
                translatedData.subtitle || null,
                translatedData.description || null,
                translatedData.ctaText || null,
                translatedData.destinations || null,
                translatedData.features || null,
                translatedData.stats || null,
                translatedData.isAutoTranslated
              ]
            );
            
            console.log(`✅ Section ${sectionId} translated to ${language}`);
          }
          
          console.log(`🎉 Section ${sectionId} translation completed!`);
        }

        // Simple blog translation function
        async function simpleTranslateBlog(blogId: string, sourceData: any) {
          console.log(`🌍 Simple translating blog: ${blogId}`);
          
          const targetLanguages = ['en', 'de', 'nl', 'zh'];
          console.log(`🌍 Target languages:`, targetLanguages);
          
          for (let i = 0; i < targetLanguages.length; i++) {
            const language = targetLanguages[i];
            console.log(`🌍 Processing language: ${language} (${i + 1}/${targetLanguages.length})`);
            
            // Add delay between languages to avoid rate limiting
            if (i > 0) {
              console.log(`⏳ Waiting 5 seconds before next language...`);
              await new Promise(resolve => setTimeout(resolve, 5000));
            }
            
            // Check if translation already exists
            const [existingRows] = await connection.execute(
              'SELECT * FROM blog_translations WHERE blogId = ? AND language = ?',
              [blogId, language]
            );
            
            if ((existingRows as any[]).length > 0 && !forceRetranslate) {
              console.log(`⏭️  Translation for blog ${blogId} in ${language} already exists, but checking if content changed...`);
              
              // Check if content has changed
              const existingTranslation = (existingRows as any[])[0];
              const contentChanged = 
                existingTranslation.title !== sourceData.title ||
                existingTranslation.excerpt !== sourceData.excerpt ||
                existingTranslation.content !== sourceData.content ||
                existingTranslation.category !== sourceData.category ||
                existingTranslation.tags !== sourceData.tags;
              
              if (!contentChanged) {
                console.log(`✅ Content unchanged for blog ${blogId} in ${language}, skipping...`);
                continue;
              } else {
                console.log(`🔄 Content changed for blog ${blogId} in ${language}, retranslating...`);
              }
            }
            
            console.log(`🔄 Translating blog ${blogId} to ${language}...`);
            
            // Real DeepL translation
            console.log(`🌍 DeepL: Starting translation for blog ${blogId} to ${language}...`);
            
            const translatedData = {
              blogId,
              language,
              title: sourceData.title ? await translateWithDeepL(sourceData.title, 'id', language) : undefined,
              excerpt: sourceData.excerpt ? await translateWithDeepL(sourceData.excerpt, 'id', language) : undefined,
              content: sourceData.content ? await translateWithDeepL(sourceData.content, 'id', language) : undefined,
              category: sourceData.category ? await translateWithDeepL(sourceData.category, 'id', language) : undefined,
              tags: sourceData.tags || undefined,
              isAutoTranslated: true
            };
            
            console.log(`🌍 DeepL: Translation completed for blog ${blogId} to ${language}`);
            
            // Upsert translation
            await connection.execute(
              `INSERT INTO blog_translations 
               (id, blogId, language, title, excerpt, content, category, tags, isAutoTranslated, createdAt, updatedAt) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
               ON DUPLICATE KEY UPDATE 
               title = VALUES(title), excerpt = VALUES(excerpt), content = VALUES(content), 
               category = VALUES(category), tags = VALUES(tags), isAutoTranslated = VALUES(isAutoTranslated), updatedAt = NOW()`,
              [
                `${blogId}-${language}-${Date.now()}`, // Generate unique ID
                translatedData.blogId,
                translatedData.language,
                translatedData.title || null,
                translatedData.excerpt || null,
                translatedData.content || null,
                translatedData.category || null,
                translatedData.tags || null,
                translatedData.isAutoTranslated
              ]
            );
            
            console.log(`✅ Blog ${blogId} translated to ${language}`);
          }
          
          console.log(`🎉 Blog ${blogId} translation completed!`);
        }

        await simpleTranslateSection(contentId, translationData);
        result = { contentType: 'section', contentId };
        break;
      }

      case 'blog': {
        // Get blog data with direct query
        const [rows] = await connection.execute(
          'SELECT * FROM blogs WHERE id = ?',
          [contentId]
        );

        if (!rows || (rows as any[]).length === 0) {
          await connection.end();
          return NextResponse.json(
            { success: false, error: 'Blog not found' },
            { status: 404 }
          );
        }

        const blog = (rows as any[])[0];
        console.log(`🔵 Blog found: ${blog.title}`);

        // Blog translation data
        const blogTranslationData = {
          title: blog.title || undefined,
          excerpt: blog.excerpt || undefined,
          content: blog.content || undefined,
          category: blog.category || undefined,
          tags: blog.tags || undefined
        };

        // Simple blog translation function
        async function simpleTranslateBlog(blogId: string, sourceData: any) {
          console.log(`🌍 Simple translating blog: ${blogId}`);
          
          const targetLanguages = ['en', 'de', 'nl', 'zh'];
          console.log(`🌍 Target languages:`, targetLanguages);
          
          for (let i = 0; i < targetLanguages.length; i++) {
            const language = targetLanguages[i];
            console.log(`🌍 Processing language: ${language} (${i + 1}/${targetLanguages.length})`);
            
            // Add delay between languages to avoid rate limiting
            if (i > 0) {
              console.log(`⏳ Waiting 5 seconds before next language...`);
              await new Promise(resolve => setTimeout(resolve, 5000));
            }
            
            // Check if translation already exists
            const [existingRows] = await connection.execute(
              'SELECT * FROM blog_translations WHERE blogId = ? AND language = ?',
              [blogId, language]
            );
            
            if ((existingRows as any[]).length > 0 && !forceRetranslate) {
              console.log(`⏭️  Translation for blog ${blogId} in ${language} already exists, skipping...`);
              continue;
            }
            
            console.log(`🔄 Translating blog ${blogId} to ${language}...`);
            
            // Real DeepL translation
            console.log(`🌍 DeepL: Starting translation for blog ${blogId} to ${language}...`);
            
            const translatedData: any = {
              blogId,
              language,
              title: sourceData.title ? await translateWithDeepL(sourceData.title, 'id', language) : undefined,
              excerpt: sourceData.excerpt ? await translateWithDeepL(sourceData.excerpt, 'id', language) : undefined,
              content: sourceData.content ? await translateWithDeepL(sourceData.content, 'id', language) : undefined,
              category: sourceData.category ? await translateWithDeepL(sourceData.category, 'id', language) : undefined,
              tags: sourceData.tags || undefined,
              isAutoTranslated: true
            };
            
            console.log(`🌍 DeepL: Translation completed for blog ${blogId} to ${language}`);
            
            // Upsert translation
            await connection.execute(
              `INSERT INTO blog_translations 
               (id, blogId, language, title, excerpt, content, category, tags, isAutoTranslated, createdAt, updatedAt) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
               ON DUPLICATE KEY UPDATE 
               title = VALUES(title),
               excerpt = VALUES(excerpt),
               content = VALUES(content),
               category = VALUES(category),
               tags = VALUES(tags),
               isAutoTranslated = VALUES(isAutoTranslated),
               updatedAt = NOW()`,
              [
                `${blogId}-${language}`,
                blogId,
                language,
                translatedData.title,
                translatedData.excerpt,
                translatedData.content,
                translatedData.category,
                translatedData.tags,
                translatedData.isAutoTranslated
              ]
            );
            
            console.log(`✅ Blog ${blogId} translated to ${language} successfully`);
          }
          
          console.log(`🎉 Blog ${blogId} translation completed!`);
        }

        await simpleTranslateBlog(contentId, blogTranslationData);
        result = { contentType: 'blog', contentId };
        break;
      }

      default:
        await connection.end();
        return NextResponse.json(
          { success: false, error: `Unknown content type: ${contentType}` },
          { status: 400 }
        );
    }

    await connection.end();
    console.log(`✅ Workaround translation triggered successfully for ${contentType} ${contentId}`);

    return NextResponse.json({
      success: true,
      message: 'Workaround translation triggered successfully. Processing in background.',
      data: result
    });

  } catch (error) {
    console.error('❌ Workaround translation trigger failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to trigger workaround translation',
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}
