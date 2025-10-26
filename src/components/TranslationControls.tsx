'use client';

import { useState } from 'react';
import { Globe, CheckCircle, Loader2, Eye, RefreshCw, Bug, Database, AlertCircle } from 'lucide-react';

interface TranslationControlsProps {
  contentType: 'package' | 'blog' | 'testimonial' | 'gallery' | 'section';
  contentId: string;
  onTranslationComplete?: () => void;
}

const LANGUAGES = [
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' }
];

export default function TranslationControls({
  contentType,
  contentId,
  onTranslationComplete
}: TranslationControlsProps) {
  const [translating, setTranslating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewLang, setPreviewLang] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  
  // Debug states
  const [showDebug, setShowDebug] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [translationStatus, setTranslationStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Debug logging function
  const addDebugLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    setDebugLogs(prev => [...prev, logEntry]);
    console.log(`🐛 Translation Debug: ${logEntry}`);
    
    // Also log to browser console for easier debugging
    if (typeof window !== 'undefined') {
      switch (type) {
        case 'success':
          console.log(`✅ ${message}`);
          break;
        case 'error':
          console.error(`❌ ${message}`);
          break;
        case 'warning':
          console.warn(`⚠️ ${message}`);
          break;
        default:
          console.info(`ℹ️ ${message}`);
      }
    }
  };

  // Check translation status
  const checkTranslationStatus = async () => {
    try {
      setLoadingStatus(true);
      addDebugLog(`Checking translation status for ${contentType}:${contentId}`);
      
      const response = await fetch(`/api/translations/status?contentType=${contentType}&contentId=${contentId}`);
      const data = await response.json();
      
      if (data.success) {
        setTranslationStatus(data.status);
        addDebugLog(`Status check completed: ${JSON.stringify(data.status)}`, 'success');
      } else {
        addDebugLog(`Status check failed: ${data.error}`, 'error');
      }
    } catch (err) {
      addDebugLog(`Status check error: ${(err as Error).message}`, 'error');
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleTranslate = async (forceRetranslate = false) => {
    try {
      setTranslating(true);
      setSuccess(false);
      setError(null);
      addDebugLog(`Starting translation for ${contentType}:${contentId} (force: ${forceRetranslate})`);

      const requestBody = {
        contentType,
        contentId,
        forceRetranslate
      };
      
      addDebugLog(`Request payload: ${JSON.stringify(requestBody)}`);
      addDebugLog(`Making API call to /api/translations/trigger`);

      const response = await fetch('/api/translations/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      addDebugLog(`API response status: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      addDebugLog(`API response data: ${JSON.stringify(data)}`);

      if (data.success) {
        setSuccess(true);
        addDebugLog(`Translation triggered successfully!`, 'success');
        setTimeout(() => setSuccess(false), 3000);
        
        if (onTranslationComplete) {
          addDebugLog(`Calling onTranslationComplete callback`);
          onTranslationComplete();
        }
        
        // Refresh status after successful translation
        setTimeout(() => {
          addDebugLog(`Refreshing translation status after successful translation`);
          checkTranslationStatus();
        }, 2000);
      } else {
        const errorMsg = data.error || 'Translation failed';
        setError(errorMsg);
        addDebugLog(`Translation failed: ${errorMsg}`, 'error');
      }
    } catch (err) {
      const errorMsg = 'Network error: ' + (err as Error).message;
      setError(errorMsg);
      addDebugLog(`Network error: ${errorMsg}`, 'error');
    } finally {
      setTranslating(false);
      addDebugLog(`Translation process completed`);
    }
  };

  const handlePreview = async (langCode: string) => {
    try {
      setLoadingPreview(true);
      setPreviewLang(langCode);
      setPreviewData(null);
      addDebugLog(`Starting preview for language: ${langCode}`);

      // Build API endpoint based on content type
      let endpoint = '';
      switch (contentType) {
        case 'section':
          endpoint = `/api/sections?section=${contentId}&language=${langCode}`;
          break;
        case 'package':
          endpoint = `/api/packages?id=${contentId}&language=${langCode}`;
          break;
        case 'blog':
          endpoint = `/api/blogs?id=${contentId}&language=${langCode}`;
          break;
        case 'testimonial':
          endpoint = `/api/testimonials?id=${contentId}&language=${langCode}`;
          break;
        case 'gallery':
          endpoint = `/api/gallery?id=${contentId}&language=${langCode}`;
          break;
      }

      addDebugLog(`Preview endpoint: ${endpoint}`);
      addDebugLog(`Making preview API call`);

      const response = await fetch(endpoint);
      addDebugLog(`Preview API response status: ${response.status} ${response.statusText}`);
      
      const result = await response.json();
      addDebugLog(`Preview API response data: ${JSON.stringify(result)}`);

      if (result.success) {
        setPreviewData(result.data);
        addDebugLog(`Preview loaded successfully for ${langCode}`, 'success');
      } else {
        const errorMsg = 'Failed to load preview';
        setError(errorMsg);
        addDebugLog(`Preview failed: ${errorMsg}`, 'error');
      }
    } catch (err) {
      const errorMsg = 'Preview error: ' + (err as Error).message;
      setError(errorMsg);
      addDebugLog(`Preview error: ${errorMsg}`, 'error');
    } finally {
      setLoadingPreview(false);
      addDebugLog(`Preview process completed`);
    }
  };

  const closePreview = () => {
    setPreviewLang(null);
    setPreviewData(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Translation Controls</h3>
        </div>

        <div className="flex items-center gap-3">
          {success && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Translation triggered successfully!</span>
            </div>
          )}
          
          <button
            onClick={() => setShowDebug(!showDebug)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              showDebug 
                ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            <Bug className="w-4 h-4" />
            Debug
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Debug Panel */}
      {showDebug && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-semibold text-gray-900">Debug Information</h4>
            </div>
            <div className="flex gap-2">
              <button
                onClick={checkTranslationStatus}
                disabled={loadingStatus}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                <Database className="w-3 h-3" />
                {loadingStatus ? 'Checking...' : 'Check Status'}
              </button>
              <button
                onClick={() => setDebugLogs([])}
                className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Clear Logs
              </button>
            </div>
          </div>

          {/* Translation Status */}
          {translationStatus && (
            <div className="mb-4 p-3 bg-white border border-gray-200 rounded">
              <h5 className="text-xs font-semibold text-gray-700 mb-2">Translation Status:</h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {LANGUAGES.map((lang) => {
                  const status = translationStatus[lang.code];
                  const isSourceLanguage = lang.code === 'id';
                  return (
                    <div key={lang.code} className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span className="text-gray-600">{lang.name}:</span>
                      <span className={`font-semibold ${
                        status?.exists ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isSourceLanguage ? (
                          status?.exists ? '✅ Source Content' : '❌ No Source Content'
                        ) : (
                          status?.exists ? '✅ Translated' : '❌ Not Translated'
                        )}
                      </span>
                      {isSourceLanguage && (
                        <span className="text-xs text-blue-600">(Source)</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Debug Logs */}
          <div className="mb-3">
            <h5 className="text-xs font-semibold text-gray-700 mb-2">Debug Logs:</h5>
            <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono max-h-48 overflow-y-auto">
              {debugLogs.length === 0 ? (
                <div className="text-gray-500">No debug logs yet. Try translating or checking status.</div>
              ) : (
                debugLogs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Content Info */}
          <div className="text-xs text-gray-600">
            <div><strong>Content Type:</strong> {contentType}</div>
            <div><strong>Content ID:</strong> {contentId}</div>
            <div><strong>Supported Languages:</strong> {LANGUAGES.map(l => l.code).join(', ')}</div>
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
              <div className="font-semibold text-blue-800 mb-1">📝 Translation Logic:</div>
              <div className="text-blue-700">
                • <strong>Indonesian (id)</strong> = Source language (original content)
                <br />
                • <strong>Other languages</strong> = Translated from Indonesian
                <br />
                • Translation only goes: <strong>Indonesian → Other Languages</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Translation Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => handleTranslate(false)}
          disabled={translating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {translating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Translating...
            </>
          ) : (
            <>
              <Globe className="w-4 h-4" />
              Translate to All Languages
            </>
          )}
        </button>

        <button
          onClick={() => handleTranslate(true)}
          disabled={translating}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {translating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Re-translating...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Force Re-translate
            </>
          )}
        </button>
      </div>

      {/* Language Preview Buttons */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Preview Translations:</h4>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handlePreview(lang.code)}
              disabled={loadingPreview}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                previewLang === lang.code
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              } disabled:opacity-50`}
            >
              <span>{lang.flag}</span>
              <span className="text-sm">{lang.name}</span>
              {previewLang === lang.code && loadingPreview && (
                <Loader2 className="w-3 h-3 animate-spin" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {previewLang && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">
                  Preview: {LANGUAGES.find(l => l.code === previewLang)?.name}
                </h3>
              </div>
              <button
                onClick={closePreview}
                className="px-3 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              >
                Close
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6">
              <div className="space-y-4">
                {previewData.title && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Title:</label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{previewData.title}</p>
                  </div>
                )}

                {previewData.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description:</label>
                    <p className="text-gray-700 mt-1">{previewData.description}</p>
                  </div>
                )}

                {previewData.content && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Content:</label>
                    <div 
                      className="prose max-w-none mt-1"
                      dangerouslySetInnerHTML={{ __html: previewData.content }}
                    />
                  </div>
                )}

                {previewData.excerpt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Excerpt:</label>
                    <p className="text-gray-700 mt-1">{previewData.excerpt}</p>
                  </div>
                )}

                {previewData.category && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Category:</label>
                    <p className="text-gray-700 mt-1">{previewData.category}</p>
                  </div>
                )}

                {previewData.location && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location:</label>
                    <p className="text-gray-700 mt-1">{previewData.location}</p>
                  </div>
                )}

                {previewData.tags && Array.isArray(previewData.tags) && previewData.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tags:</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {previewData.tags.map((tag: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
