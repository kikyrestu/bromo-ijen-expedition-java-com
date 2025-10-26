'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Eye, EyeOff, RefreshCw, CheckCircle, AlertCircle, Database } from 'lucide-react';

interface SectionDebugData {
  sectionId: string;
  data: any;
  language: string;
  isTranslated: boolean;
  fetchTime: number;
  translationFound: boolean;
  originalTitle?: string;
  translatedTitle?: string;
}

const SECTIONS = [
  { id: 'hero', name: 'Hero Section' },
  { id: 'whoAmI', name: 'About Section' },
  { id: 'whyChooseUs', name: 'Why Choose Us' },
  { id: 'packages', name: 'Tour Packages' },
  { id: 'testimonials', name: 'Testimonials' },
  { id: 'blog', name: 'Blog' },
  { id: 'gallery', name: 'Gallery' }
];

export default function TranslationDebugPanel() {
  const { currentLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [debugData, setDebugData] = useState<SectionDebugData[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const fetchSectionData = async () => {
    setLoading(true);
    const results: SectionDebugData[] = [];

    for (let i = 0; i < SECTIONS.length; i++) {
      const section = SECTIONS[i];
      const startTime = Date.now();
      
      // Add small delay between requests to prevent overwhelming the database
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      try {
        const res = await fetch(`/api/sections?section=${section.id}&language=${currentLanguage}`);
        const data = await res.json();
        const fetchTime = Date.now() - startTime;

        // Check if actually translated by comparing title/content
        const sectionData = data.data || data;
        const originalTitle = sectionData.title;
        
        // Check for common Indonesian words to detect if translated
        const hasIndonesianWords = sectionData.title && (
          sectionData.title.includes('Gunung') ||
          sectionData.title.includes('Kawah') ||
          sectionData.title.includes('dan') ||
          sectionData.title.includes('di') ||
          sectionData.title.includes('yang')
        );
        
        const isActuallyTranslated = currentLanguage === 'id' ? true : !hasIndonesianWords;
        const translationFound = data.translationFound !== undefined ? data.translationFound : isActuallyTranslated;

        results.push({
          sectionId: section.id,
          data: sectionData,
          language: currentLanguage,
          isTranslated: isActuallyTranslated,
          translationFound: currentLanguage === 'id' ? true : translationFound,
          originalTitle: originalTitle,
          translatedTitle: isActuallyTranslated ? originalTitle : undefined,
          fetchTime
        });
      } catch (error) {
        results.push({
          sectionId: section.id,
          data: { error: String(error) },
          language: currentLanguage,
          isTranslated: false,
          translationFound: false,
          fetchTime: Date.now() - startTime
        });
      }
    }

    setDebugData(results);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchSectionData();
    }
  }, [isOpen, currentLanguage]);

  const getLanguageName = (code: string) => {
    const names: Record<string, string> = {
      id: '🇮🇩 Indonesian',
      en: '🇬🇧 English',
      de: '🇩🇪 German',
      nl: '🇳🇱 Dutch',
      zh: '🇨🇳 Chinese'
    };
    return names[code] || code;
  };

  const getSectionName = (id: string) => {
    return SECTIONS.find(s => s.id === id)?.name || id;
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-medium"
        title="Open Translation Debug Panel"
      >
        <Database className="w-4 h-4" />
        Debug Translations
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-2xl shadow-2xl w-[600px] max-h-[80vh] overflow-hidden flex flex-col border-2 border-purple-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-lg">Translation Debug Panel</h3>
            <p className="text-xs text-purple-100">
              Current Language: {getLanguageName(currentLanguage)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSectionData}
            disabled={loading}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && debugData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Fetching section data...</p>
          </div>
        ) : (
          debugData.map((section) => (
            <div
              key={section.sectionId}
              className="border border-gray-200 rounded-lg overflow-hidden hover:border-purple-300 transition-colors"
            >
              {/* Section Header */}
              <button
                onClick={() => setExpandedSection(
                  expandedSection === section.sectionId ? null : section.sectionId
                )}
                className="w-full p-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {section.isTranslated ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                  )}
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">
                      {getSectionName(section.sectionId)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {section.isTranslated
                        ? `✅ Translated (${section.fetchTime}ms)`
                        : `⚠️ No translation (${section.fetchTime}ms)`}
                    </p>
                  </div>
                </div>
                <Eye className="w-4 h-4 text-gray-400" />
              </button>

              {/* Expanded Details */}
              {expandedSection === section.sectionId && (
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="space-y-3">
                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Section ID:</span>
                        <span className="ml-2 font-mono text-purple-600">
                          {section.sectionId}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Language:</span>
                        <span className="ml-2 font-semibold">
                          {getLanguageName(section.language)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Fetch Time:</span>
                        <span className={`ml-2 font-semibold ${
                          section.fetchTime > 1000 ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {section.fetchTime}ms
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className={`ml-2 font-semibold ${
                          section.isTranslated ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {section.isTranslated ? 'Translated' : 'Not Translated'}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">DB Translation:</span>
                        <span className={`ml-2 font-semibold ${
                          section.translationFound ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {section.translationFound ? '✅ Found in database' : '❌ Not found in database'}
                        </span>
                      </div>
                    </div>

                    {/* Action Required */}
                    {!section.isTranslated && section.language !== 'id' && (
                      <div className="mt-3 p-3 bg-orange-50 border-l-4 border-orange-500 rounded">
                        <p className="text-sm font-semibold text-orange-800 mb-2">
                          ⚠️ Action Required:
                        </p>
                        <ol className="text-xs text-orange-700 space-y-1 ml-4 list-decimal">
                          <li>Go to CMS → Section Editor → {getSectionName(section.sectionId)}</li>
                          <li>Scroll down to "Translation Controls"</li>
                          <li>Click "Translate to All Languages" button</li>
                          <li>Wait 30 seconds for DeepL translation</li>
                          <li>Refresh this page to see translated content</li>
                        </ol>
                      </div>
                    )}

                    {/* Data Preview */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        Data Preview:
                      </p>
                      <div className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs font-mono overflow-x-auto max-h-48 overflow-y-auto">
                        <pre>{JSON.stringify(section.data, null, 2)}</pre>
                      </div>
                    </div>

                    {/* Translation Fields */}
                    {section.data && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          Key Fields:
                        </p>
                        <div className="space-y-1 text-sm">
                          {section.data.title && (
                            <div className="bg-purple-50 p-2 rounded">
                              <span className="font-semibold text-purple-700">Title:</span>
                              <span className="ml-2 text-gray-800">
                                {section.data.title}
                              </span>
                            </div>
                          )}
                          {section.data.subtitle && (
                            <div className="bg-blue-50 p-2 rounded">
                              <span className="font-semibold text-blue-700">Subtitle:</span>
                              <span className="ml-2 text-gray-800">
                                {section.data.subtitle}
                              </span>
                            </div>
                          )}
                          {section.data.description && (
                            <div className="bg-green-50 p-2 rounded">
                              <span className="font-semibold text-green-700">Description:</span>
                              <span className="ml-2 text-gray-800 line-clamp-2">
                                {section.data.description?.substring(0, 100)}...
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-3 border-t border-gray-200 text-xs text-gray-600 text-center">
        💡 Click on sections to see detailed data • Language auto-updates
      </div>
    </div>
  );
}
