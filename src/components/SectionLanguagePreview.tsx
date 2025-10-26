'use client';

import { useState, useEffect } from 'react';
import { Globe, Eye, Languages } from 'lucide-react';

interface SectionLanguagePreviewProps {
  sectionType: 'hero' | 'about' | 'whyChooseUs' | 'packages' | 'destinations' | 'testimonials' | 'blog' | 'contact';
  currentContent: {
    title?: string;
    subtitle?: string;
    description?: string;
    ctaText?: string;
    [key: string]: any;
  };
}

const LANGUAGES = [
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' }
];

export default function SectionLanguagePreview({
  sectionType,
  currentContent
}: SectionLanguagePreviewProps) {
  const [selectedLang, setSelectedLang] = useState('id');
  const [previewData, setPreviewData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch section data dengan bahasa tertentu
  const fetchSectionPreview = async (langCode: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/sections?type=${sectionType}&language=${langCode}`);
      const result = await response.json();

      if (result.success) {
        setPreviewData(result.data);
      } else {
        console.error('Failed to fetch preview');
      }
    } catch (error) {
      console.error('Preview error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (langCode: string) => {
    setSelectedLang(langCode);
    setShowPreview(true);
    fetchSectionPreview(langCode);
  };

  const closePreview = () => {
    setShowPreview(false);
    setSelectedLang('id');
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Languages className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Language Preview</h3>
        <span className="text-sm text-gray-500 ml-auto">
          Sections are translated via static LanguageContext
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Preview how this section appears in different languages. 
        Section translations are managed in <code className="bg-gray-100 px-2 py-0.5 rounded">LanguageContext.tsx</code>
      </p>

      {/* Current Content Display */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
        <div className="text-xs font-medium text-gray-500 mb-2">Current Content (Indonesian):</div>
        <div className="space-y-2">
          {currentContent.title && (
            <div>
              <span className="text-xs text-gray-400">Title:</span>
              <p className="font-semibold text-gray-900">{currentContent.title}</p>
            </div>
          )}
          {currentContent.subtitle && (
            <div>
              <span className="text-xs text-gray-400">Subtitle:</span>
              <p className="text-sm text-gray-700">{currentContent.subtitle}</p>
            </div>
          )}
          {currentContent.description && (
            <div>
              <span className="text-xs text-gray-400">Description:</span>
              <p className="text-sm text-gray-600">{currentContent.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Language Selector */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-3">Preview in other languages:</div>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                selectedLang === lang.code && showPreview
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
              } disabled:opacity-50`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {LANGUAGES.find(l => l.code === selectedLang)?.flag} {' '}
                    {LANGUAGES.find(l => l.code === selectedLang)?.name}
                  </h3>
                  <p className="text-sm text-gray-600">Section: {sectionType}</p>
                </div>
              </div>
              <button
                onClick={closePreview}
                className="px-4 py-2 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors font-medium"
              >
                Close
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-8">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                  <span className="ml-3 text-gray-600">Loading preview...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {previewData.title && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-5 border border-gray-200">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                        Title
                      </label>
                      <p className="text-2xl font-bold text-gray-900 leading-tight">
                        {previewData.title}
                      </p>
                    </div>
                  )}

                  {previewData.subtitle && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
                      <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2 block">
                        Subtitle
                      </label>
                      <p className="text-lg font-semibold text-gray-800">
                        {previewData.subtitle}
                      </p>
                    </div>
                  )}

                  {previewData.description && (
                    <div className="bg-white rounded-lg p-5 border border-gray-300 shadow-sm">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                        Description
                      </label>
                      <p className="text-base text-gray-700 leading-relaxed">
                        {previewData.description}
                      </p>
                    </div>
                  )}

                  {previewData.ctaText && (
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
                      <label className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-2 block">
                        Call to Action
                      </label>
                      <button className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg shadow-lg hover:bg-orange-700 transition-colors">
                        {previewData.ctaText}
                      </button>
                    </div>
                  )}

                  {previewData.features && Array.isArray(previewData.features) && (
                    <div className="bg-white rounded-lg p-5 border border-gray-300">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                        Features
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {previewData.features.map((feature: any, i: number) => (
                          <div key={i} className="p-3 bg-gray-50 rounded border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {previewData.stats && Array.isArray(previewData.stats) && (
                    <div className="bg-white rounded-lg p-5 border border-gray-300">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                        Statistics
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {previewData.stats.map((stat: any, i: number) => (
                          <div key={i} className="text-center p-3 bg-blue-50 rounded border border-blue-200">
                            <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
                            <div className="text-sm text-gray-700">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
