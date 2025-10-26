'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Globe, 
  FileText,
  RefreshCw,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

const SeoManagementPage = () => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [sitemapStatus, setSitemapStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analysisRes, sitemapRes] = await Promise.all([
        fetch('/api/seo/analyzer'),
        fetch('/api/sitemap/generate')
      ]);

      const analysisData = await analysisRes.json();
      const sitemapData = await sitemapRes.json();

      if (analysisData.success) setAnalysis(analysisData.data);
      if (sitemapData.success) setSitemapStatus(sitemapData.data);
    } catch (error) {
      console.error('Error fetching SEO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateSitemap = async () => {
    setRegenerating(true);
    try {
      const res = await fetch('/api/sitemap/generate', {
        method: 'POST'
      });
      const data = await res.json();
      
      if (data.success) {
        alert(`✅ Sitemap regenerated successfully!\n\nTotal Pages: ${data.data.totalPages}\nGoogle Pinged: ${data.data.googlePinged ? 'Yes' : 'No'}\nBing Pinged: ${data.data.bingPinged ? 'Yes' : 'No'}`);
        fetchData();
      } else {
        alert('❌ Failed to regenerate sitemap');
      }
    } catch (error) {
      console.error('Error regenerating sitemap:', error);
      alert('❌ Error regenerating sitemap');
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading SEO Data...</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 50) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'medium': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default: return <AlertCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SEO Management Dashboard</h1>
          <p className="text-gray-600">Monitor and optimize your website's search engine performance</p>
        </div>

        {/* SEO Score Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">SEO Score</h3>
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className={`text-5xl font-bold mb-2 ${getScoreColor(analysis?.score || 0).split(' ')[0]}`}>
              {analysis?.score || 0}
            </div>
            <p className="text-sm text-gray-600">Out of 100</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Pages</h3>
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {analysis?.totalPages || 0}
            </div>
            <p className="text-sm text-gray-600">Indexed pages</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Issues Found</h3>
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {analysis?.issues?.total || 0}
            </div>
            <p className="text-sm text-gray-600">
              {analysis?.issues?.critical || 0} critical, {analysis?.issues?.high || 0} high
            </p>
          </div>
        </div>

        {/* Sitemap Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Globe className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">Sitemap Status</h2>
            </div>
            <button
              onClick={handleRegenerateSitemap}
              disabled={regenerating}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
              <span>{regenerating ? 'Regenerating...' : 'Regenerate Sitemap'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Pages</p>
              <p className="text-2xl font-bold text-gray-900">{sitemapStatus?.totalPages || 0}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Last Updated</p>
              <p className="text-sm font-medium text-gray-900">
                {sitemapStatus?.lastGenerated 
                  ? new Date(sitemapStatus.lastGenerated).toLocaleString() 
                  : 'Never'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Google</p>
              <div className="flex items-center space-x-2">
                {sitemapStatus?.googlePinged ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-900">
                  {sitemapStatus?.googlePinged ? 'Pinged' : 'Not Pinged'}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Bing</p>
              <div className="flex items-center space-x-2">
                {sitemapStatus?.bingPinged ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-900">
                  {sitemapStatus?.bingPinged ? 'Pinged' : 'Not Pinged'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-4">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Sitemap.xml</span>
            </a>
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Google Search Console</span>
            </a>
            <a
              href="https://www.bing.com/webmasters"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Bing Webmaster Tools</span>
            </a>
          </div>
        </div>

        {/* Duplicate Content Alerts */}
        {(analysis?.duplicates?.titles?.length > 0 || analysis?.duplicates?.descriptions?.length > 0) && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold text-red-900">Duplicate Content Detected!</h2>
            </div>

            {analysis?.duplicates?.titles?.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-red-900 mb-2">Duplicate Titles:</h3>
                {analysis.duplicates.titles.map((dup: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-lg p-3 mb-2">
                    <p className="text-sm font-medium text-gray-900 mb-1">{dup.title}</p>
                    <p className="text-xs text-gray-600">Found on: {dup.pages.join(', ')}</p>
                  </div>
                ))}
              </div>
            )}

            {analysis?.duplicates?.descriptions?.length > 0 && (
              <div>
                <h3 className="font-semibold text-red-900 mb-2">Duplicate Descriptions:</h3>
                {analysis.duplicates.descriptions.map((dup: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-lg p-3 mb-2">
                    <p className="text-sm font-medium text-gray-900 mb-1">{dup.description.substring(0, 100)}...</p>
                    <p className="text-xs text-gray-600">Found on: {dup.pages.join(', ')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Issues List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Search className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">SEO Issues & Recommendations</h2>
          </div>

          {analysis?.issuesList && analysis.issuesList.length > 0 ? (
            <div className="space-y-3">
              {analysis.issuesList.map((issue: any, idx: number) => (
                <div 
                  key={idx} 
                  className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  {getSeverityIcon(issue.severity)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                        issue.severity === 'critical' ? 'bg-red-100 text-red-700' :
                        issue.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                        issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {issue.severity}
                      </span>
                      <span className="text-sm text-gray-600">{issue.page}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">{issue.message}</p>
                    {issue.value && (
                      <p className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
                        {issue.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-900 mb-2">All Clear!</p>
              <p className="text-gray-600">No SEO issues detected. Great job! 🎉</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeoManagementPage;

