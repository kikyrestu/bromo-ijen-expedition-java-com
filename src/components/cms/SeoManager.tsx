'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Target,
  BarChart3,
  AlertCircle,
  Info
} from 'lucide-react';
import Toast from '@/components/Toast';

interface SeoData {
  score: number;
  sitemapStatus: string;
  lastGenerated?: string;
  duplicateContent: {
    titles: number;
    descriptions: number;
  };
  issues: Array<{
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    message: string;
    recommendation: string;
  }>;
}

const SEVERITY_COLORS = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-blue-100 text-blue-800 border-blue-200'
};

const SEVERITY_ICONS = {
  critical: AlertCircle,
  high: AlertTriangle,
  medium: Info,
  low: CheckCircle
};

export default function SeoManager() {
  const [seoData, setSeoData] = useState<SeoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error' | 'warning' | 'info'; message: string }>({
    show: false,
    type: 'success',
    message: ''
  });

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setToast({ show: true, type, message });
  };

  useEffect(() => {
    fetchSeoData();
  }, []);

  const fetchSeoData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/seo/analyzer');
      const data = await res.json();
      
      if (data.success) {
        // Ensure duplicateContent exists with default values
        const seoDataWithDefaults = {
          ...data.data,
          duplicateContent: data.data.duplicateContent || { titles: 0, descriptions: 0 },
          issues: data.data.issues || []
        };
        setSeoData(seoDataWithDefaults);
      } else {
        showToast('error', 'Failed to fetch SEO data');
        // Set default empty state
        setSeoData({
          score: 0,
          sitemapStatus: 'inactive',
          duplicateContent: { titles: 0, descriptions: 0 },
          issues: []
        });
      }
    } catch (error) {
      console.error('Error fetching SEO data:', error);
      showToast('error', 'Error fetching SEO data');
      // Set default empty state
      setSeoData({
        score: 0,
        sitemapStatus: 'inactive',
        duplicateContent: { titles: 0, descriptions: 0 },
        issues: []
      });
    } finally {
      setLoading(false);
    }
  };

  const regenerateSitemap = async () => {
    try {
      setRegenerating(true);
      const res = await fetch('/api/sitemap/generate', {
        method: 'POST'
      });
      
      const data = await res.json();
      
      if (data.success) {
        showToast('success', 'Sitemap regenerated successfully!');
        fetchSeoData();
      } else {
        showToast('error', 'Failed to regenerate sitemap');
      }
    } catch (error) {
      console.error('Error regenerating sitemap:', error);
      showToast('error', 'Error regenerating sitemap');
    } finally {
      setRegenerating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Analyzing SEO...</p>
      </div>
    );
  }

  if (!seoData || !seoData.duplicateContent) {
    return (
      <div className="p-12 text-center">
        <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load SEO data</p>
        <button
          onClick={fetchSeoData}
          className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SEO Management</h2>
          <p className="text-gray-600 mt-1">Monitor and optimize your website's SEO performance</p>
        </div>
        
        <button
          onClick={fetchSeoData}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* SEO Score */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-24 h-24 rounded-full ${getScoreBgColor(seoData.score)}`}>
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(seoData.score)}`}>
                  {seoData.score}
                </div>
                <div className="text-xs text-gray-600">/ 100</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-900">Overall SEO Score</h3>
              <p className="text-gray-600 mt-1">
                {seoData.score >= 80 && 'Excellent! Your SEO is in great shape.'}
                {seoData.score >= 60 && seoData.score < 80 && 'Good, but there\'s room for improvement.'}
                {seoData.score >= 40 && seoData.score < 60 && 'Fair. Consider addressing the issues below.'}
                {seoData.score < 40 && 'Needs attention. Please review the recommendations.'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Google Search Console</span>
            </a>
            <a
              href="https://www.bing.com/webmasters"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Bing Webmaster</span>
            </a>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sitemap Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Sitemap</h3>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              seoData.sitemapStatus === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {seoData.sitemapStatus}
            </span>
          </div>
          
          {seoData.lastGenerated && (
            <p className="text-sm text-gray-600 mb-3">
              Last generated: {new Date(seoData.lastGenerated).toLocaleDateString()}
            </p>
          )}
          
          <button
            onClick={regenerateSitemap}
            disabled={regenerating}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate Sitemap</span>
          </button>
        </div>

        {/* Duplicate Titles */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Duplicate Titles</h3>
          </div>
          
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {seoData.duplicateContent?.titles || 0}
          </div>
          
          <p className="text-sm text-gray-600">
            {(seoData.duplicateContent?.titles || 0) === 0 
              ? 'All titles are unique'
              : 'Pages with duplicate title tags'
            }
          </p>
        </div>

        {/* Duplicate Descriptions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Duplicate Descriptions</h3>
          </div>
          
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {seoData.duplicateContent?.descriptions || 0}
          </div>
          
          <p className="text-sm text-gray-600">
            {(seoData.duplicateContent?.descriptions || 0) === 0 
              ? 'All descriptions are unique'
              : 'Pages with duplicate meta descriptions'
            }
          </p>
        </div>
      </div>

      {/* SEO Issues */}
      {seoData.issues && seoData.issues.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
              SEO Issues & Recommendations
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            {seoData.issues.map((issue, index) => {
              const SeverityIcon = SEVERITY_ICONS[issue.severity];
              
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${SEVERITY_COLORS[issue.severity]}`}
                >
                  <div className="flex items-start space-x-3">
                    <SeverityIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{issue.type}</h4>
                        <span className="text-xs font-medium uppercase px-2 py-1 rounded">
                          {issue.severity}
                        </span>
                      </div>
                      
                      <p className="text-sm mb-2">{issue.message}</p>
                      
                      <div className="bg-white/50 rounded p-3 mt-2">
                        <p className="text-xs font-medium mb-1">Recommendation:</p>
                        <p className="text-sm">{issue.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(!seoData.issues || seoData.issues.length === 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">All Clear!</h3>
          <p className="text-gray-600">No SEO issues detected. Keep up the good work!</p>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
