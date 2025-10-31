'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  RefreshCw, 
  Globe, 
  Zap,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  BarChart3
} from 'lucide-react';

interface TranslationCoverageDisplayProps {
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
}

export default function TranslationCoverageDisplay({ 
  autoRefresh = false,
  refreshInterval = 30 
}: TranslationCoverageDisplayProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [translating, setTranslating] = useState<Set<string>>(new Set());
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  const languages = [
    { code: 'all', name: 'All Languages', flag: '🌍' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' }
  ];

  const fetchCoverage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/translations/check?section=all');
      const result = await response.json();

      // Only update state if component is still mounted
      if (!isMountedRef.current) return;

      if (result.success) {
        console.log('📊 Translation data received:', result.data);
        console.log('📁 Sections available:', Object.keys(result.data.sections));
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch coverage data');
      }
    } catch (err) {
      // Only update state if component is still mounted
      if (!isMountedRef.current) return;
      setError('Network error: ' + (err as Error).message);
    } finally {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleTranslateSection = async (sectionType: string, contentId?: string) => {
    const key = contentId ? `${sectionType}-${contentId}` : sectionType;
    
    if (!isMountedRef.current) return; // Don't start if unmounting
    setTranslating(prev => new Set(prev).add(key));

    try {
      const response = await fetch('/api/translations/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contentType: sectionType === 'sections' ? 'section' : sectionType.replace(/s$/, ''), // Remove trailing 's'
          contentId: contentId,
          forceRetranslate: false
        })
      });

      const result = await response.json();
      
      if (!isMountedRef.current) return; // Don't update if unmounted
      
      if (result.success) {
        alert(`✅ Translation triggered for ${contentId || sectionType}! Check back in 30 seconds.`);
        setTimeout(() => {
          if (isMountedRef.current) fetchCoverage();
        }, 2000); // Refresh after 2s
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (err) {
      if (!isMountedRef.current) return; // Don't update if unmounted
      alert(`❌ Network error: ${(err as Error).message}`);
    } finally {
      if (!isMountedRef.current) return; // Don't update if unmounted
      setTranslating(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const handleTranslateAllInSection = async (sectionName: string, items: any[]) => {
    const key = `batch-${sectionName}`;
    
    if (!isMountedRef.current) return; // Don't start if unmounting
    setTranslating(prev => new Set(prev).add(key));

    try {
      // Determine content type based on section name
      let contentType = sectionName === 'sections' ? 'section' : sectionName.replace(/s$/, '');
      
      let successCount = 0;
      let errorCount = 0;

      // Translate each item sequentially with small delay
      for (const item of items) {
        if (!isMountedRef.current) break; // Stop if unmounted during batch
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay between requests
          
          const response = await fetch('/api/translations/trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              contentType,
              contentId: item.contentId,
              forceRetranslate: false
            })
          });

          const result = await response.json();
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Failed to translate ${item.contentId}:`, result.error);
          }
        } catch (err) {
          errorCount++;
          console.error(`Error translating ${item.contentId}:`, err);
        }
      }

      if (!isMountedRef.current) return; // Don't show alerts if unmounted

      if (successCount > 0) {
        alert(`✅ Translation triggered for ${successCount}/${items.length} items! Check back in 1 minute.`);
        setTimeout(() => {
          if (isMountedRef.current) fetchCoverage();
        }, 3000);
      }
      
      if (errorCount > 0) {
        alert(`⚠️ ${errorCount} items failed to translate. Check console for details.`);
      }
    } catch (err) {
      if (!isMountedRef.current) return; // Don't show alerts if unmounted
      alert(`❌ Batch translation error: ${(err as Error).message}`);
    } finally {
      if (!isMountedRef.current) return; // Don't update if unmounted
      setTranslating(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionName)) {
        next.delete(sectionName);
      } else {
        next.add(sectionName);
      }
      return next;
    });
  };

  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;
    
    // Initial fetch
    fetchCoverage();

    // Setup auto-refresh if enabled
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchCoverage, refreshInterval * 1000);
      
      // Cleanup function
      return () => {
        isMountedRef.current = false; // Mark as unmounted
        clearInterval(interval);
      };
    }
    
    // Cleanup without interval
    return () => {
      isMountedRef.current = false; // Mark as unmounted
    };
  }, [autoRefresh, refreshInterval]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Checking translation coverage...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <XCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">Error: {error}</span>
        </div>
        <button
          onClick={fetchCoverage}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'missing':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (percentage: number) => {
    if (percentage === 100) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBgColor = (percentage: number) => {
    if (percentage === 100) return 'bg-green-50 border-green-200';
    if (percentage >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Language Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <div className="flex flex-wrap gap-2">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                selectedLanguage === lang.code
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overall Summary */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <BarChart3 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Translation Dashboard</h2>
              <p className="text-blue-100 text-sm">Monitor your content translation progress</p>
            </div>
          </div>
          
          <button
            onClick={fetchCoverage}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-all disabled:opacity-50 font-medium"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="text-sm text-blue-100 mb-2 font-medium">Total Content</div>
            <div className="text-4xl font-bold">{data.summary.totalItems}</div>
            <div className="text-xs text-blue-200 mt-1">Items to translate</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="text-sm text-blue-100 mb-2 font-medium">Fully Translated</div>
            <div className="text-4xl font-bold text-green-300">{data.summary.translatedItems}</div>
            <div className="text-xs text-blue-200 mt-1">Complete items</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="text-sm text-blue-100 mb-2 font-medium">Overall Progress</div>
            <div className={`text-4xl font-bold ${
              data.summary.overallCoverage === 100 ? 'text-green-300' : 
              data.summary.overallCoverage >= 50 ? 'text-yellow-300' : 'text-red-300'
            }`}>
              {data.summary.overallCoverage.toFixed(1)}%
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div 
                className="bg-green-300 h-2 rounded-full transition-all duration-500"
                style={{ width: `${data.summary.overallCoverage}%` }}
              />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="text-sm text-blue-100 mb-2 font-medium">Missing Translations</div>
            <div className="text-4xl font-bold text-orange-300">
              {data.summary.totalItems - data.summary.translatedItems}
            </div>
            <div className="text-xs text-blue-200 mt-1">Need attention</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search content types or sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filters</span>
          </button>
        </div>
      </div>

      {/* Section Coverage Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(data.sections)
          .sort(([a], [b]) => {
            // Force "sections" to appear first
            const order = ['sections', 'packages', 'blogs', 'testimonials', 'gallery'];
            return order.indexOf(a) - order.indexOf(b);
          })
          .filter(([sectionName]) => 
            searchQuery === '' || sectionName.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(([sectionName, sectionData]: [string, any]) => {
            const isExpanded = expandedSections.has(sectionName);
            const translationKey = sectionName;
            const isTranslating = translating.has(translationKey);
            
            // Better display names for sections
            const displayNames: Record<string, string> = {
              sections: '📄 Landing Page Sections',
              packages: '📦 Tour Packages',
              blogs: '📝 Blog Posts',
              testimonials: '💬 Testimonials',
              gallery: '📸 Photo Gallery'
            };
            
            const displayName = displayNames[sectionName] || sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
            
            return (
              <div
                key={sectionName}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection(sectionName)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        sectionData.coveragePercentage === 100 ? 'bg-green-100' :
                        sectionData.coveragePercentage >= 50 ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        <Globe className={`w-6 h-6 ${
                          sectionData.coveragePercentage === 100 ? 'text-green-600' :
                          sectionData.coveragePercentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{displayName}</h3>
                        <p className="text-sm text-gray-500">
                          {sectionData.items.length} {sectionData.items.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          sectionData.coveragePercentage === 100 ? 'text-green-600' :
                          sectionData.coveragePercentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {sectionData.coveragePercentage.toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500">Coverage</div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        sectionData.coveragePercentage === 100 ? 'bg-green-500' :
                        sectionData.coveragePercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${sectionData.coveragePercentage}%` }}
                    />
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Complete</div>
                      <div className="text-xl font-bold text-green-600">{sectionData.translated}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Partial</div>
                      <div className="text-xl font-bold text-yellow-600">{sectionData.partial}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Missing</div>
                      <div className="text-xl font-bold text-red-600">{sectionData.missing}</div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-700">Detailed Items</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTranslateAllInSection(sectionName, sectionData.items);
                        }}
                        disabled={translating.has(`batch-${sectionName}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                      >
                        <Zap className={`w-4 h-4 ${translating.has(`batch-${sectionName}`) ? 'animate-pulse' : ''}`} />
                        {translating.has(`batch-${sectionName}`) ? 'Translating...' : `Translate All (${sectionData.items.length})`}
                      </button>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {sectionData.items.map((item: any) => (
                        <div 
                          key={`${sectionName}-${item.contentId}`}
                          className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="font-medium text-gray-800 mb-1 truncate">
                                {item.contentTitle || item.title || item.name || item.contentId}
                              </div>
                              <div className="text-xs text-gray-500 mb-2 font-mono">
                                ID: {item.contentId}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(item.languages).map(([lang, status]: [string, any]) => (
                                  <span
                                    key={lang}
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                      status.exists && status.completeness === 100 ? 'bg-green-100 text-green-700' :
                                      status.exists && status.completeness > 0 ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}
                                    title={`${status.completeness}% complete`}
                                  >
                                    {status.exists && status.completeness === 100 && <CheckCircle className="w-3 h-3" />}
                                    {status.exists && status.completeness > 0 && status.completeness < 100 && <AlertCircle className="w-3 h-3" />}
                                    {!status.exists && <XCircle className="w-3 h-3" />}
                                    {lang.toUpperCase()}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            {/* Individual Translate Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTranslateSection(sectionName, item.contentId);
                              }}
                              disabled={translating.has(`${sectionName}-${item.contentId}`)}
                              className="flex-shrink-0 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors disabled:opacity-50 text-xs font-medium border border-blue-200"
                            >
                              {translating.has(`${sectionName}-${item.contentId}`) ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Zap className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* No Results */}
      {searchQuery && Object.entries(data.sections).filter(([sectionName]) => 
        sectionName.toLowerCase().includes(searchQuery.toLowerCase())
      ).length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No sections found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
