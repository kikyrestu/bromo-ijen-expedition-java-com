'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react';

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

  const fetchCoverage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/translations/check?section=all');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch coverage data');
      }
    } catch (err) {
      setError('Network error: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoverage();

    if (autoRefresh) {
      const interval = setInterval(fetchCoverage, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
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
      {/* Overall Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Translation Coverage Overview</h2>
          <button
            onClick={fetchCoverage}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Total Items</div>
            <div className="text-3xl font-bold text-gray-800">{data.summary.totalItems}</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Fully Translated</div>
            <div className="text-3xl font-bold text-green-600">{data.summary.translatedItems}</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Overall Coverage</div>
            <div className={`text-3xl font-bold ${getStatusColor(data.summary.overallCoverage)}`}>
              {data.summary.overallCoverage.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Section Coverage */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(data.sections).map(([sectionName, sectionData]: [string, any]) => (
          <div
            key={sectionName}
            className={`border rounded-lg p-5 ${getBgColor(sectionData.coveragePercentage)}`}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-3 capitalize">
              {sectionName}
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Coverage:</span>
                <span className={`text-lg font-bold ${getStatusColor(sectionData.coveragePercentage)}`}>
                  {sectionData.coveragePercentage.toFixed(1)}%
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Items:</span>
                <span className="text-sm font-medium text-gray-800">
                  {sectionData.translatedItems}/{sectionData.totalItems}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    sectionData.coveragePercentage === 100 ? 'bg-green-600' :
                    sectionData.coveragePercentage >= 50 ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${sectionData.coveragePercentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Items per Section */}
      {Object.entries(data.sections).map(([sectionName, sectionData]: [string, any]) => (
        <div key={sectionName} className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 capitalize">
            {sectionName} Details
          </h3>

          {sectionData.items.length === 0 ? (
            <p className="text-gray-500 italic">No items in this section</p>
          ) : (
            <div className="space-y-3">
              {sectionData.items.map((item: any) => (
                <div
                  key={item.contentId}
                  className={`border rounded-lg p-4 ${
                    item.status === 'complete' ? 'bg-green-50 border-green-200' :
                    item.status === 'partial' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(item.status)}
                        <h4 className="font-semibold text-gray-800">{item.contentTitle}</h4>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        Coverage: <span className={`font-bold ${getStatusColor(item.overallCoverage)}`}>
                          {item.overallCoverage.toFixed(1)}%
                        </span>
                      </div>

                      {/* Language Status */}
                      <div className="flex gap-2 flex-wrap">
                        {['id', 'en', 'de', 'nl', 'zh'].map(lang => {
                          const langStatus = item.languages[lang];
                          return (
                            <div
                              key={lang}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                langStatus.exists && langStatus.completeness === 100
                                  ? 'bg-green-200 text-green-800'
                                  : langStatus.exists && langStatus.completeness > 0
                                  ? 'bg-yellow-200 text-yellow-800'
                                  : 'bg-red-200 text-red-800'
                              }`}
                              title={`${langStatus.completeness.toFixed(0)}% complete`}
                            >
                              {lang.toUpperCase()}: {langStatus.completeness.toFixed(0)}%
                            </div>
                          );
                        })}
                      </div>

                      {/* Missing Languages */}
                      {item.missingLanguages.length > 0 && (
                        <div className="mt-2 text-xs text-red-600">
                          Missing: {item.missingLanguages.map((l: string) => l.toUpperCase()).join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-gray-500">
                      ID: {item.contentId.substring(0, 8)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
