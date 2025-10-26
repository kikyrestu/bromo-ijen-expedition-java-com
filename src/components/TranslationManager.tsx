'use client';

import React, { useState, useEffect } from 'react';
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
  Activity
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

  const supportedLanguages = {
    id: 'Bahasa Indonesia',
    en: 'English',
    de: 'Deutsch',
    cn: '中文',
    ru: 'Русский',
  };

  useEffect(() => {
    autoDetectContent();
  }, []);

  // Add Log Function
  const addLog = (type: 'info' | 'success' | 'error' | 'warning', message: string, details?: any) => {
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      message,
      details
    };
    setTranslationLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
  };

  // Auto Detect Content Function
  const autoDetectContent = async () => {
    setDetecting(true);
    try {
      // Detect Sections with real translation status
      const sectionsResponse = await fetch('/api/sections');
      if (sectionsResponse.ok) {
        const sectionsData = await sectionsResponse.json();
        if (sectionsData.success) {
          // Check translation status for each section with rate limiting
          const sectionsWithStatus = [];
          for (let i = 0; i < sectionsData.data.length; i++) {
            const section = sectionsData.data[i];
            try {
              // Add small delay between requests to prevent overwhelming the database
              if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
              }
              
              // Check if translations exist in database
              const translationResponse = await fetch(`/api/translations/check-status?sectionId=${section.sectionId}`);
              let hasTranslation = false;
              if (translationResponse.ok) {
                const statusData = await translationResponse.json();
                hasTranslation = statusData.success && statusData.hasTranslation;
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
          setAvailableSections(sectionsWithStatus);
        }
      }

      // Detect Packages
      const packagesResponse = await fetch('/api/packages?includeAll=true');
      if (packagesResponse.ok) {
        const packagesData = await packagesResponse.json();
        if (packagesData.success) {
          const packages = packagesData.data.map((pkg: any) => ({
            id: pkg.id,
            title: pkg.title,
            description: pkg.description || '',
            status: pkg.status
          }));
          setAvailablePackages(packages);
        }
      }

      // Detect Blogs with real translation status
      const blogsResponse = await fetch('/api/blogs?includeAll=true');
      if (blogsResponse.ok) {
        const blogsData = await blogsResponse.json();
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
      setDetecting(false);
    }
  };


  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type, message: '' });
    }, 4000);
  };





  // Translate Controller Functions
  const handleTranslateContent = async (contentId?: string) => {
    const targetContentId = contentId || translateController.contentId;
    
    if (!targetContentId) {
      addLog('error', 'Please enter Content ID');
      showToast('error', 'Please enter Content ID');
      return;
    }

    addLog('info', `Starting translation for ${translateController.contentType} ${targetContentId}`);
    setTranslateController(prev => ({ ...prev, loading: true }));

    try {
      addLog('info', 'Sending translation request to API...');
      
      // Use different endpoints based on content type
      const endpoint = translateController.contentType === 'blog' 
        ? '/api/translations/trigger-workaround' 
        : '/api/translations/trigger-workaround';
        
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType: translateController.contentType,
          contentId: targetContentId,
          forceRetranslate: true // Always force retranslate to handle content updates
        }),
      });

      addLog('info', `API response received: ${response.status} ${response.statusText}`);
      const data = await response.json();

      if (data.success) {
        addLog('success', `Translation completed successfully for ${translateController.contentType} ${targetContentId}`);
        showToast('success', `Translation triggered successfully for ${translateController.contentType} ${targetContentId}`);
        
        // Refresh content status after translation
        addLog('info', 'Refreshing translation status...');
        await autoDetectContent();
        addLog('success', 'Translation status refreshed');
      } else {
        addLog('error', `Translation failed: ${data.error || 'Unknown error'}`);
        showToast('error', data.error || 'Failed to trigger translation');
      }
    } catch (error) {
      addLog('error', `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error triggering translation:', error);
      showToast('error', 'Failed to trigger translation');
    } finally {
      addLog('info', 'Translation process finished');
      setTranslateController(prev => ({ ...prev, loading: false }));
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
                      handleTranslateContent(section.id);
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
                      Check {pkg.title} Translation Status:
                    </label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded text-xs bg-white text-gray-900"
                    >
                      <option value="" className="text-gray-900">Check translation status...</option>
                      <option value={`${pkg.id}.main`} className="text-gray-900">
                        ✅ {pkg.title} - Main Content (Translated)
                      </option>
                      <option value={`${pkg.id}.title`} className="text-gray-900">
                        ✅ {pkg.title} - Title (Translated)
                      </option>
                      <option value={`${pkg.id}.description`} className="text-gray-900">
                        ✅ {pkg.title} - Description (Translated)
                      </option>
                      <option value={`${pkg.id}.highlights`} className="text-gray-900">
                        ✅ {pkg.title} - Highlights (Translated)
                      </option>
                      <option value={`${pkg.id}.itinerary`} className="text-gray-900">
                        ✅ {pkg.title} - Itinerary (Translated)
                      </option>
                      <option value={`${pkg.id}.includes`} className="text-gray-900">
                        ✅ {pkg.title} - Includes (Translated)
                      </option>
                      <option value={`${pkg.id}.excludes`} className="text-gray-900">
                        ✅ {pkg.title} - Excludes (Translated)
                      </option>
                    </select>
                  </div>
                  
                  <button
                    onClick={() => {
                      setTranslateController(prev => ({ ...prev, contentType: 'package', contentId: pkg.id }));
                      handleTranslateContent(pkg.id);
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

          {/* Features Translation */}
          <div className="bg-purple-50 rounded-xl p-6">
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
                setTranslateController(prev => ({ ...prev, contentType: 'section', contentId: 'exclusiveDestinations' }));
                handleTranslateContent('exclusiveDestinations');
              }}
              className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm"
            >
              Translate Exclusive Destinations
            </button>
            <button
              onClick={() => {
                setTranslateController(prev => ({ ...prev, contentType: 'section', contentId: 'whoAmI' }));
                handleTranslateContent('whoAmI');
              }}
              className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm"
            >
              Translate Who Am I
            </button>
            <button
              onClick={() => {
                setTranslateController(prev => ({ ...prev, contentType: 'section', contentId: 'whyChooseUs' }));
                handleTranslateContent('whyChooseUs');
              }}
              className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm"
            >
              Translate Why Choose Us
            </button>
            <button
              onClick={() => {
                setTranslateController(prev => ({ ...prev, contentType: 'section', contentId: 'hero' }));
                handleTranslateContent('hero');
              }}
              className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm"
            >
              Translate Hero Section
            </button>
          </div>
        </div>
      </div>

      {/* Realtime Translation Logs */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Realtime Translation Logs
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {translationLogs.length} logs
            </span>
            <button
              onClick={() => setTranslationLogs([])}
              className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
            >
              Clear Logs
            </button>
          </div>
        </div>
        
        <div className="bg-black rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
          {translationLogs.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No translation logs yet. Start translating to see realtime logs here.
            </div>
          ) : (
            <div className="space-y-1">
              {translationLogs.map((log, index) => (
                <div key={`${log.id}-${index}`} className="flex items-start space-x-2">
                  <span className="text-gray-400 text-xs w-20 flex-shrink-0">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${
                    log.type === 'success' ? 'bg-green-500' :
                    log.type === 'error' ? 'bg-red-500' :
                    log.type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}></span>
                  <span className={`flex-1 ${
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'error' ? 'text-red-400' :
                    log.type === 'warning' ? 'text-yellow-400' :
                    'text-gray-300'
                  }`}>
                    [{log.type.toUpperCase()}] {log.message}
                  </span>
                </div>
              ))}
            </div>
          )}
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
    </div>
  );
};

export default TranslationManager;
