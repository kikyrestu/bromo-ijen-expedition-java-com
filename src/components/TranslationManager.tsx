'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Languages, 
  Save, 
  RefreshCw, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Play,
  Settings,
  Zap,
  Package,
  Activity,
  Download,
  Terminal
} from 'lucide-react';

interface TranslationManagerProps {}

const TranslationManager: React.FC<TranslationManagerProps> = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({
    show: false,
    type: 'success',
    message: ''
  });

  // Translate Controller States
  const [translateController, setTranslateController] = useState({
    contentType: 'section',
    contentId: '',
    language: 'zh',
    forceRetranslate: false,
    loading: false
  });

  // Auto Detect States
  const [availableSections, setAvailableSections] = useState<any[]>([]);
  const [availablePackages, setAvailablePackages] = useState<any[]>([]);
  const [availableBlogs, setAvailableBlogs] = useState<any[]>([]);
  const [availableTestimonials, setAvailableTestimonials] = useState<any[]>([]);
  const [availableGallery, setAvailableGallery] = useState<any[]>([]);
  const [detecting, setDetecting] = useState(false);

  // Translation Logs State
  const [translationLogs, setTranslationLogs] = useState<Array<{
    id: string;
    timestamp: Date;
    type: 'info' | 'success' | 'error' | 'warning';
    message: string;
    details?: any;
  }>>([]);
  
  // Modal state for logs popup
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Ref for auto-scroll and mounted tracking
  const logsEndRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);

  const supportedLanguages = {
    id: 'Bahasa Indonesia',
    en: 'English',
    de: 'Deutsch',
    nl: 'Nederlands',
    zh: '中文',
  };

  useEffect(() => {
    isMountedRef.current = true;
    autoDetectContent();
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Debug: Track showLogsModal state changes
  useEffect(() => {
    console.log('🔔 showLogsModal changed to:', showLogsModal);
  }, [showLogsModal]);
  
  // Auto-scroll to bottom when new log is added
  useEffect(() => {
    if (isMountedRef.current) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [translationLogs]);

  // Add Log Function with emoji support
  const addLog = (type: 'info' | 'success' | 'error' | 'warning', message: string, details?: any) => {
    if (!isMountedRef.current) return; // Don't update if unmounted
    
    const emoji = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    }[type];
    
    const newLog = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date(),
      type,
      message: `${emoji} ${message}`,
      details
    };
    setTranslationLogs(prev => [newLog, ...prev.slice(0, 99)]); // Keep last 100 logs
  };

  // Auto Detect Content Function
  const autoDetectContent = async () => {
    if (!isMountedRef.current) return;
    
    setDetecting(true);
    try {
      // Detect Sections with real translation status
      const sectionsResponse = await fetch('/api/sections');
      
      if (!isMountedRef.current) return;
      
      if (sectionsResponse.ok) {
        const sectionsData = await sectionsResponse.json();
        
        if (!isMountedRef.current) return;
        
        if (sectionsData.success) {
          // Check translation status for each section with rate limiting
          const sectionsWithStatus = [];
          for (let i = 0; i < sectionsData.data.length; i++) {
            if (!isMountedRef.current) return;
            
            const section = sectionsData.data[i];
            try {
              // Add small delay between requests to prevent overwhelming the database
              if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
              }
              
              if (!isMountedRef.current) return;
              
              // Check if translations exist in database (add timestamp to prevent caching)
              const translationResponse = await fetch(`/api/translations/check-status?sectionId=${section.sectionId}&t=${Date.now()}`);
              let hasTranslation = false;
              
              if (!isMountedRef.current) return;
              
              if (translationResponse.ok) {
                const statusData = await translationResponse.json();
                
                if (!isMountedRef.current) return;
                
                hasTranslation = statusData.success && statusData.hasTranslation;
                console.log(`🔍 Section "${section.sectionId}" translation status: ${hasTranslation ? '✅ HAS translations' : '❌ NO translations'} (count: ${statusData.translationCount || 0})`);
              }
              
              sectionsWithStatus.push({
                id: section.sectionId,
                title: section.title || section.sectionId,
                description: section.description || '',
                hasTranslation
              });
            } catch (error) {
              console.error(`Error checking translation status for ${section.sectionId}:`, error);
              sectionsWithStatus.push({
                id: section.sectionId,
                title: section.title || section.sectionId,
                description: section.description || '',
                hasTranslation: false
              });
            }
          }
          
          if (isMountedRef.current) {
            setAvailableSections(sectionsWithStatus);
          }
        }
      }

      if (!isMountedRef.current) return;

      // Detect Packages
      const packagesResponse = await fetch('/api/packages?includeAll=true');
      
      if (!isMountedRef.current) return;
      
      if (packagesResponse.ok) {
        const packagesData = await packagesResponse.json();
        
        if (!isMountedRef.current) return;
        
        if (packagesData.success) {
          const packages = packagesData.data.map((pkg: any) => ({
            id: pkg.id,
            title: pkg.title,
            description: pkg.description || '',
            status: pkg.status
          }));
          
          if (isMountedRef.current) {
            setAvailablePackages(packages);
          }
        }
      }

      if (!isMountedRef.current) return;

      // Detect Blogs with real translation status
      const blogsResponse = await fetch('/api/blogs?includeAll=true');
      
      if (!isMountedRef.current) return;
      
      if (blogsResponse.ok) {
        const blogsData = await blogsResponse.json();
        
        if (!isMountedRef.current) return;
        
        if (blogsData.success) {
          // Check translation status for each blog
          const blogsWithStatus = await Promise.all(
            blogsData.data.map(async (blog: any) => {
              try {
                // Check if translations exist in database
                const translationResponse = await fetch(`/api/translations/check-blog-status?blogId=${blog.id}`);
                let hasTranslation = false;
                if (translationResponse.ok) {
                  const statusData = await translationResponse.json();
                  hasTranslation = statusData.success && statusData.hasTranslation;
                }
                
                return {
                  id: blog.id,
                  title: blog.title,
                  description: blog.excerpt || '',
                  status: blog.status,
                  hasTranslation
                };
              } catch (error) {
                console.error(`Error checking blog translation status for ${blog.id}:`, error);
                return {
                  id: blog.id,
                  title: blog.title,
                  description: blog.excerpt || '',
                  status: blog.status,
                  hasTranslation: false
                };
              }
            })
          );
          setAvailableBlogs(blogsWithStatus);
        }
      }

      // Detect Testimonials
      const testimonialsResponse = await fetch('/api/testimonials?includeAll=true');
      if (testimonialsResponse.ok) {
        const testimonialsData = await testimonialsResponse.json();
        if (testimonialsData.success) {
          const testimonials = testimonialsData.data.map((testimonial: any) => ({
            id: testimonial.id,
            title: testimonial.name,
            description: testimonial.content || '',
            status: testimonial.status
          }));
          setAvailableTestimonials(testimonials);
        }
      }

      // Detect Gallery
      const galleryResponse = await fetch('/api/gallery?includeAll=true');
      if (galleryResponse.ok) {
        const galleryData = await galleryResponse.json();
        if (galleryData.success) {
          const gallery = galleryData.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description || '',
            category: item.category
          }));
          setAvailableGallery(gallery);
        }
      }

    } catch (error) {
      console.error('Error auto-detecting content:', error);
    } finally {
      if (isMountedRef.current) {
        setDetecting(false);
      }
    }
  };


  const showToast = (type: 'success' | 'error', message: string) => {
    if (!isMountedRef.current) return;
    
    setToast({ show: true, type, message });
    setTimeout(() => {
      if (isMountedRef.current) {
        setToast({ show: false, type, message: '' });
      }
    }, 4000);
  };





  // Translate Controller Functions
  const handleTranslateContent = async (
    contentId?: string,
    contentTypeOverride?: 'section' | 'package' | 'blog' | 'testimonial' | 'gallery'
  ) => {
    const targetContentId = contentId ?? translateController.contentId;
    const targetContentType = contentTypeOverride ?? translateController.contentType ?? 'section';
    
    if (!targetContentId) {
      addLog('error', 'Please enter Content ID');
      showToast('error', 'Please enter Content ID');
      return;
    }

    console.log('🔵 TRANSLATE TRIGGERED:', { contentType: targetContentType, targetContentId });
    console.log('🔵 Current showLogsModal state:', showLogsModal);

    // Open modal and clear previous logs
    console.log('🟢 Setting showLogsModal to TRUE...');
    setShowLogsModal(true);
    // Double-ensure state update is flushed even during concurrent renders
    setTimeout(() => {
      if (isMountedRef.current) {
        setShowLogsModal(true);
      }
    }, 0);
    console.log('🟢 Setting isTranslating to TRUE...');
    setIsTranslating(true);
    console.log('🟢 Clearing translation logs...');
    setTranslationLogs([]); // Clear previous logs
    
    console.log('🟢 Modal state should now be TRUE');
    
    addLog('info', `Starting translation for ${targetContentType} ${targetContentId}`);
    setTranslateController(prev => ({
      ...prev,
      contentType: targetContentType,
      contentId: targetContentId,
      loading: true
    }));

    try {
      addLog('info', 'Sending translation request to API...');
      
      // Use correct translation trigger endpoint
      const endpoint = '/api/translations/trigger';
        
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType: targetContentType,
          contentId: targetContentId,
          forceRetranslate: true // Always force retranslate to handle content updates
        }),
      });

      addLog('info', `API response received: ${response.status} ${response.statusText}`);
      const data = await response.json();

      // Add API logs to UI if they exist
      if (data.logs && Array.isArray(data.logs)) {
        data.logs.forEach((log: any) => {
          addLog(log.type, log.message, log.details);
        });
      }

      if (data.success) {
        addLog('success', `Translation completed successfully for ${targetContentType} ${targetContentId}`);
        showToast('success', `Translation triggered successfully for ${targetContentType} ${targetContentId}`);
        
        // Refresh content status after translation
        addLog('info', 'Refreshing translation status...');
        await autoDetectContent();
        addLog('success', 'Translation status refreshed');
      } else {
        addLog('error', `Translation failed: ${data.error || 'Unknown error'}`);
        if (data.details) {
          addLog('error', `Details: ${data.details}`);
        }
        showToast('error', data.error || 'Failed to trigger translation');
      }
    } catch (error) {
      addLog('error', `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error triggering translation:', error);
      showToast('error', 'Failed to trigger translation');
    } finally {
      addLog('info', 'Translation process finished');
      setTranslateController(prev => ({ ...prev, loading: false }));
      setIsTranslating(false);
    }
  };

  const handleTranslateFeatures = async () => {
    if (!translateController.contentId) {
      addLog('error', 'Please enter Section ID');
      showToast('error', 'Please enter Section ID');
      return;
    }

    addLog('info', `Starting features translation for section ${translateController.contentId} to ${translateController.language}`);
    setTranslateController(prev => ({ ...prev, loading: true }));

    try {
      addLog('info', 'Sending features translation request to API...');
      const response = await fetch('/api/translate-features', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId: translateController.contentId,
          language: translateController.language
        }),
      });

      addLog('info', `Features API response received: ${response.status} ${response.statusText}`);
      const data = await response.json();

      if (data.success) {
        addLog('success', `Features translated successfully to ${translateController.language}`);
        showToast('success', `Features translated successfully to ${translateController.language}`);
      } else {
        addLog('error', `Features translation failed: ${data.error || 'Unknown error'}`);
        showToast('error', data.error || 'Failed to translate features');
      }
    } catch (error) {
      addLog('error', `Features translation network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error translating features:', error);
      showToast('error', 'Failed to translate features');
    } finally {
      addLog('info', 'Features translation process finished');
      setTranslateController(prev => ({ ...prev, loading: false }));
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Languages className="w-6 h-6 mr-3 text-orange-600" />
              Translation Manager
            </h1>
            <p className="text-gray-800 mt-2">
              Manage multi-language content for your website. <span className="font-semibold text-red-600">ALL LANGUAGES ARE REQUIRED</span> - content must be translated to every supported language.
            </p>
          </div>
        </div>
      </div>

      {/* Translate Controller */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-orange-600" />
              Translate Controller
            </h2>
            <p className="text-gray-800 mt-1">
              Trigger automatic translations for sections, packages, blogs, testimonials, and gallery items.
            </p>
          </div>
        </div>
        
        {/* One-Click Translation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sections */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <Play className="w-5 h-5 mr-2" />
              Sections ({availableSections.length})
            </h3>
            

            <div className="space-y-2">
              {availableSections.map((section) => (
                <div key={section.id} className="bg-white rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{section.title}</div>
                      <div className="text-sm text-gray-800">{section.id}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {section.hasTranslation ? (
                        <span className="text-green-600 text-sm">✅</span>
                      ) : (
                        <span className="text-red-600 text-sm">❌</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Section Content Status Dropdown */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-900 mb-1">
                      Check {section.title} Translation Status:
                    </label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded text-xs bg-white text-gray-900"
                    >
                      <option value="" className="text-gray-900">Check translation status...</option>
                      <option value={`${section.id}.main`} className="text-gray-900">
                        ✅ {section.title} - Main Content (Translated)
                      </option>
                      <option value={`${section.id}.title`} className="text-gray-900">
                        ✅ {section.title} - Title (Translated)
                      </option>
                      <option value={`${section.id}.subtitle`} className="text-gray-900">
                        ✅ {section.title} - Subtitle (Translated)
                      </option>
                      <option value={`${section.id}.description`} className="text-gray-900">
                        ✅ {section.title} - Description (Translated)
                      </option>
                      {section.id === 'hero' && (
                        <option value="hero.ctaText" className="text-gray-900">
                          ✅ Hero - CTA Text (Translated)
                        </option>
                      )}
                      {section.id === 'whoAmI' && (
                        <>
                          <option value="whoAmI.features" className="text-gray-900">
                            ✅ Who Am I - Features (Translated)
                          </option>
                          <option value="whoAmI.stats" className="text-gray-900">
                            ✅ Who Am I - Stats (Translated)
                          </option>
                        </>
                      )}
                      {section.id === 'whyChooseUs' && (
                        <option value="whyChooseUs.features" className="text-gray-900">
                          ✅ Why Choose Us - Features (Translated)
                        </option>
                      )}
                      {section.id === 'exclusiveDestinations' && (
                        <option value="exclusiveDestinations.destinations" className="text-gray-900">
                          ✅ Exclusive Destinations - Destinations (Translated)
                        </option>
                      )}
                    </select>
                  </div>
                  
                  <button
                    onClick={() => {
                      setTranslateController(prev => ({ ...prev, contentType: 'section', contentId: section.id }));
                      handleTranslateContent(section.id, 'section');
                    }}
                    disabled={translateController.loading}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {translateController.loading && translateController.contentId === section.id ? (
                      <RefreshCw className="w-3 h-3 animate-spin mx-auto" />
                    ) : (
                      `Translate ${section.title}`
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Packages */}
          <div className="bg-green-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Packages ({availablePackages.length})
            </h3>
            <div className="bg-white rounded-lg p-3 mb-4 border-2 border-green-200">
              <p className="text-xs font-medium text-green-900 mb-2">📊 Package Detail Page Content:</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="text-green-800">✅ 15 Dynamic Fields:</div>
                <div className="text-gray-700 text-xs">Title, Description, Long Desc, Highlights, Includes, Excludes, Itinerary, FAQs, Location, Duration, Departure, Return, Group Size, Difficulty, Best For</div>
                <div className="text-orange-800 mt-2">⚠️ 35+ Static Texts:</div>
                <div className="text-gray-700 text-xs">Breadcrumbs, Labels, Buttons, Headings, Error Messages, Form Labels, etc.</div>
                <div className="text-blue-800 font-semibold mt-2 col-span-2">🎯 Total: 50+ translatable items per package!</div>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availablePackages.slice(0, 5).map((pkg) => (
                <div key={pkg.id} className="bg-white rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{pkg.title}</div>
                      <div className="text-xs text-gray-800">{pkg.status}</div>
                    </div>
                  </div>
                  
                  {/* Package Content Status Dropdown */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-900 mb-1">
                      📦 {pkg.title} - Translation Fields (15):
                    </label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded text-xs bg-white text-gray-900"
                    >
                      <option value="" className="text-gray-900">View all translatable fields...</option>
                      <optgroup label="📝 Main Content (5 fields)">
                        <option value={`${pkg.id}.title`} className="text-gray-900">
                          ✅ Title
                        </option>
                        <option value={`${pkg.id}.description`} className="text-gray-900">
                          ✅ Short Description
                        </option>
                        <option value={`${pkg.id}.longDescription`} className="text-gray-900">
                          ✅ Long Description (Rich Text)
                        </option>
                        <option value={`${pkg.id}.location`} className="text-gray-900">
                          ✅ Location
                        </option>
                        <option value={`${pkg.id}.duration`} className="text-gray-900">
                          ✅ Duration
                        </option>
                      </optgroup>
                      <optgroup label="🎯 Details (5 fields)">
                        <option value={`${pkg.id}.highlights`} className="text-gray-900">
                          ✅ Highlights (Array)
                        </option>
                        <option value={`${pkg.id}.includes`} className="text-gray-900">
                          ✅ Includes (Array)
                        </option>
                        <option value={`${pkg.id}.excludes`} className="text-gray-900">
                          ✅ Excludes (Array)
                        </option>
                        <option value={`${pkg.id}.itinerary`} className="text-gray-900">
                          ✅ Itinerary (Array of Objects)
                        </option>
                        <option value={`${pkg.id}.faqs`} className="text-gray-900">
                          ✅ FAQs (Array of Q&A)
                        </option>
                      </optgroup>
                      <optgroup label="📊 Meta Info (5 fields)">
                        <option value={`${pkg.id}.groupSize`} className="text-gray-900">
                          ✅ Group Size
                        </option>
                        <option value={`${pkg.id}.difficulty`} className="text-gray-900">
                          ✅ Difficulty Level
                        </option>
                        <option value={`${pkg.id}.bestFor`} className="text-gray-900">
                          ✅ Best For (Target Audience)
                        </option>
                        <option value={`${pkg.id}.departure`} className="text-gray-900">
                          ✅ Departure Info
                        </option>
                        <option value={`${pkg.id}.return`} className="text-gray-900">
                          ✅ Return Info
                        </option>
                      </optgroup>
                    </select>
                  </div>
                  
                  <button
                    onClick={() => {
                      setTranslateController(prev => ({ ...prev, contentType: 'package', contentId: pkg.id }));
                      handleTranslateContent(pkg.id, 'package');
                    }}
                    disabled={translateController.loading}
                    className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {translateController.loading && translateController.contentId === pkg.id ? (
                      <RefreshCw className="w-3 h-3 animate-spin mx-auto" />
                    ) : (
                      `Translate ${pkg.title}`
                    )}
                  </button>
                </div>
              ))}
              {availablePackages.length > 5 && (
                <div className="text-center text-sm text-gray-800">
                  +{availablePackages.length - 5} more packages
                </div>
              )}
            </div>
          </div>

          {/* Blogs */}
          <div className="bg-purple-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Blogs ({availableBlogs.length})
            </h3>
            <div className="bg-white rounded-lg p-3 mb-4 border-2 border-purple-200">
              <p className="text-xs font-medium text-purple-900 mb-2">📝 Blog Detail Page Content:</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="text-purple-800">✅ 6 Dynamic Fields:</div>
                <div className="text-gray-700 text-xs">Title, Excerpt, Content (Rich Text), Author, Category, Tags (Array)</div>
                <div className="text-orange-800 mt-2">⚠️ 10+ Static Texts:</div>
                <div className="text-gray-700 text-xs">Badges, Buttons, Links, Headings, Error Messages</div>
                <div className="text-blue-800 font-semibold mt-2 col-span-2">🎯 Total: 16+ translatable items per blog!</div>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableBlogs.slice(0, 5).map((blog) => (
                <div key={blog.id} className="bg-white rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{blog.title}</div>
                      <div className="text-xs text-gray-800">{blog.status}</div>
                    </div>
                  </div>
                  
                  {/* Blog Content Status Dropdown */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-900 mb-1">
                      📝 {blog.title} - Translation Fields (6):
                    </label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded text-xs bg-white text-gray-900"
                    >
                      <option value="" className="text-gray-900">View all translatable fields...</option>
                      <optgroup label="📄 Content (3 fields)">
                        <option value={`${blog.id}.title`} className="text-gray-900">
                          ✅ Title
                        </option>
                        <option value={`${blog.id}.excerpt`} className="text-gray-900">
                          ✅ Excerpt (Summary)
                        </option>
                        <option value={`${blog.id}.content`} className="text-gray-900">
                          ✅ Content (Rich Text/HTML)
                        </option>
                      </optgroup>
                      <optgroup label="👤 Meta (3 fields)">
                        <option value={`${blog.id}.author`} className="text-gray-900">
                          ✅ Author Name
                        </option>
                        <option value={`${blog.id}.category`} className="text-gray-900">
                          ✅ Category
                        </option>
                        <option value={`${blog.id}.tags`} className="text-gray-900">
                          ✅ Tags (Array)
                        </option>
                      </optgroup>
                    </select>
                  </div>
                  
                  <button
                    onClick={() => {
                      setTranslateController(prev => ({ ...prev, contentType: 'blog', contentId: blog.id }));
                      handleTranslateContent(blog.id, 'blog');
                    }}
                    disabled={translateController.loading}
                    className="w-full px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50"
                  >
                    {translateController.loading && translateController.contentId === blog.id ? (
                      <RefreshCw className="w-3 h-3 animate-spin mx-auto" />
                    ) : (
                      `Translate ${blog.title}`
                    )}
                  </button>
                </div>
              ))}
              {availableBlogs.length > 5 && (
                <div className="text-center text-sm text-gray-800">
                  +{availableBlogs.length - 5} more blogs
                </div>
              )}
            </div>
          </div>

          {/* Features Translation */}
          <div className="bg-amber-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Features Translation
            </h3>
            
        
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Target Language
                </label>
                <select
                  value={translateController.language}
                  onChange={(e) => setTranslateController(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="en">English</option>
                  <option value="de">German</option>
                  <option value="nl">Dutch</option>
                  <option value="zh">Chinese</option>
                </select>
          </div>
              <div className="space-y-2">
                {availableSections.filter(section => 
                  ['whoAmI', 'whyChooseUs', 'exclusiveDestinations', 'hero', 'tourPackages'].includes(section.id)
                ).map((section) => (
                  <div key={section.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{section.title}</div>
                      <div className="text-xs text-gray-800">{section.id}</div>
                    </div>
                    <button
                      onClick={() => {
                        setTranslateController(prev => ({ ...prev, contentType: 'section', contentId: section.id }));
                        handleTranslateFeatures();
                      }}
                      disabled={translateController.loading}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50"
                    >
                      {translateController.loading && translateController.contentId === section.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        'Features'
                      )}
                    </button>
                      </div>
                    ))}
                  </div>
                </div>
          </div>
        </div>

        {/* Content Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Detected Content</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-blue-900">Sections</div>
              <div className="text-lg font-bold text-blue-600">{availableSections.length}</div>
              <div className="text-xs text-blue-700">
                {availableSections.filter(s => s.hasTranslation).length} translated
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-green-900">Packages</div>
              <div className="text-lg font-bold text-green-600">{availablePackages.length}</div>
              <div className="text-xs text-green-700">
                {availablePackages.filter(p => p.status === 'published').length} published
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-purple-900">Blogs</div>
              <div className="text-lg font-bold text-purple-600">{availableBlogs.length}</div>
              <div className="text-xs text-purple-700">
                {availableBlogs.filter(b => b.status === 'published').length} published
              </div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-orange-900">Testimonials</div>
              <div className="text-lg font-bold text-orange-600">{availableTestimonials.length}</div>
              <div className="text-xs text-orange-700">
                {availableTestimonials.filter(t => t.status === 'approved').length} approved
              </div>
            </div>
            <div className="bg-pink-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-pink-900">Gallery</div>
              <div className="text-lg font-bold text-pink-600">{availableGallery.length}</div>
              <div className="text-xs text-pink-700">
                {new Set(availableGallery.map(g => g.category)).size} categories
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => {
                // Set content type first, then call with explicit ID
                handleTranslateContent('exclusiveDestinations', 'section');
              }}
              className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm font-medium"
            >
              Translate Exclusive Destinations
            </button>
            <button
              onClick={() => {
                handleTranslateContent('whoAmI', 'section');
              }}
              className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm font-medium"
            >
              Translate Who Am I
            </button>
            <button
              onClick={() => {
                handleTranslateContent('whyChooseUs', 'section');
              }}
              className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm font-medium"
            >
              Translate Why Choose Us
            </button>
            <button
              onClick={() => {
                handleTranslateContent('hero', 'section');
              }}
              className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm font-medium"
            >
              Translate Hero Section
            </button>
          </div>
        </div>
      </div>

      {/* Realtime Translation Logs */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Terminal className="w-5 h-5 mr-2 text-green-400" />
            Translation Logs (Real-time)
          </h3>
          <div className="flex items-center space-x-3">
            {/* Log Stats */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">
                ✅ {translationLogs.filter(l => l.type === 'success').length}
              </span>
              <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded">
                ❌ {translationLogs.filter(l => l.type === 'error').length}
              </span>
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                ⚠️ {translationLogs.filter(l => l.type === 'warning').length}
              </span>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                ℹ️ {translationLogs.filter(l => l.type === 'info').length}
              </span>
            </div>
            <button
              onClick={() => setTranslationLogs([])}
              className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded hover:bg-gray-600 transition-colors"
            >
              Clear Logs
            </button>
          </div>
        </div>
        
        <div className="bg-black rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm border border-gray-700" style={{ scrollBehavior: 'smooth' }}>
          {translationLogs.length === 0 ? (
            <div className="text-gray-500 text-center py-16">
              <Terminal className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No translation logs yet.</p>
              <p className="text-xs mt-1">Start translating to see real-time logs here.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {translationLogs.map((log, index) => (
                <div key={`${log.id}-${index}`} className="flex items-start space-x-3 hover:bg-gray-900/50 px-2 py-1 rounded transition-colors">
                  <span className="text-gray-500 text-xs w-24 flex-shrink-0 font-normal">
                    {log.timestamp.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                    log.type === 'success' ? 'bg-green-500/20 text-green-400' :
                    log.type === 'error' ? 'bg-red-500/20 text-red-400' :
                    log.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {log.type.toUpperCase()}
                  </span>
                  <span className={`flex-1 ${
                    log.type === 'success' ? 'text-green-300' :
                    log.type === 'error' ? 'text-red-300' :
                    log.type === 'warning' ? 'text-yellow-300' :
                    'text-gray-300'
                  }`}>
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
        
        {/* Log Actions */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span>
            Total: {translationLogs.length} log entries
          </span>
          <button
            onClick={() => {
              const logText = translationLogs.map(l => 
                `[${l.timestamp.toISOString()}] ${l.type.toUpperCase()}: ${l.message}`
              ).join('\n');
              const blob = new Blob([logText], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `translation-logs-${new Date().toISOString()}.txt`;
              a.click();
            }}
            className="flex items-center space-x-1 hover:text-gray-200 transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>Export Logs</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 flex-shrink-0" />
            )}
            <div className="font-medium">{toast.message}</div>
            <button
              onClick={() => setToast({ ...toast, show: false })}
              className="ml-4 hover:opacity-80"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Translation Logs Modal Popup */}
      {(() => {
        console.log('🔴 Modal conditional check - showLogsModal:', showLogsModal);
        return showLogsModal;
      })() && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col border border-gray-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <Terminal className="w-6 h-6 text-green-400" />
                <h2 className="text-2xl font-bold text-white">Translation Process Monitor</h2>
                {isTranslating && (
                  <div className="flex items-center space-x-2 text-yellow-400">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Translating...</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                {/* Log Stats */}
                <div className="flex items-center space-x-2 text-xs">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded font-mono">
                    ✅ {translationLogs.filter(l => l.type === 'success').length}
                  </span>
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded font-mono">
                    ❌ {translationLogs.filter(l => l.type === 'error').length}
                  </span>
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded font-mono">
                    ⚠️ {translationLogs.filter(l => l.type === 'warning').length}
                  </span>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded font-mono">
                    ℹ️ {translationLogs.filter(l => l.type === 'info').length}
                  </span>
                </div>
                <button
                  onClick={() => !isTranslating && setShowLogsModal(false)}
                  disabled={isTranslating}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isTranslating 
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  {isTranslating ? 'Please wait...' : 'Close'}
                </button>
              </div>
            </div>

            {/* Modal Body - Logs */}
            <div className="flex-1 overflow-hidden p-6">
              <div className="bg-black rounded-xl p-6 h-full overflow-y-auto font-mono text-sm border border-gray-700" style={{ scrollBehavior: 'smooth' }}>
                {translationLogs.length === 0 ? (
                  <div className="text-gray-500 text-center py-20">
                    <Terminal className="w-16 h-16 mx-auto mb-4 opacity-50 animate-pulse" />
                    <p className="text-lg font-medium">Initializing translation process...</p>
                    <p className="text-sm mt-2">Logs will appear here in real-time</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {translationLogs.map((log, index) => (
                      <div 
                        key={`${log.id}-${index}`} 
                        className="flex items-start space-x-4 hover:bg-gray-900/50 px-3 py-2 rounded-lg transition-all animate-fade-in"
                      >
                        <span className="text-gray-500 text-xs w-28 flex-shrink-0 font-normal">
                          {log.timestamp.toLocaleTimeString('en-US', { 
                            hour12: false, 
                            hour: '2-digit', 
                            minute: '2-digit', 
                            second: '2-digit',
                            fractionalSecondDigits: 2
                          })}
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold flex-shrink-0 uppercase ${
                          log.type === 'success' ? 'bg-green-500/30 text-green-300 border border-green-500/50' :
                          log.type === 'error' ? 'bg-red-500/30 text-red-300 border border-red-500/50' :
                          log.type === 'warning' ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/50' :
                          'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                        }`}>
                          {log.type}
                        </span>
                        <span className={`flex-1 text-base ${
                          log.type === 'success' ? 'text-green-300 font-medium' :
                          log.type === 'error' ? 'text-red-300 font-medium' :
                          log.type === 'warning' ? 'text-yellow-300' :
                          'text-gray-300'
                        }`}>
                          {log.message}
                        </span>
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                <span className="font-mono">Total logs: {translationLogs.length}</span>
                {isTranslating && (
                  <span className="ml-4 text-yellow-400 animate-pulse">● Processing translations...</span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setTranslationLogs([])}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  Clear Logs
                </button>
                <button
                  onClick={() => {
                    const logText = translationLogs.map(l => 
                      `[${l.timestamp.toISOString()}] ${l.type.toUpperCase()}: ${l.message}`
                    ).join('\n');
                    const blob = new Blob([logText], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `translation-logs-${new Date().toISOString()}.txt`;
                    a.click();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Logs</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationManager;
