'use client';

import { useState, useEffect } from 'react';
import { Search, AlertCircle, CheckCircle, X } from 'lucide-react';

interface SeoFormProps {
  pageType: string;
  pageSlug: string;
  onSave?: () => void;
}

const SeoForm = ({ pageType, pageSlug, onSave }: SeoFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    keywords: '',
    canonicalUrl: '',
    ogImage: '',
    ogType: 'website',
    noIndex: false
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState<any>({});
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchSeoData();
  }, [pageType, pageSlug]);

  const fetchSeoData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/seo?pageType=${pageType}&pageSlug=${pageSlug}`);
      const data = await res.json();
      if (data.success && data.data) {
        setFormData({
          title: data.data.title || '',
          description: data.data.description || '',
          keywords: data.data.keywords || '',
          canonicalUrl: data.data.canonicalUrl || '',
          ogImage: data.data.ogImage || '',
          ogType: data.data.ogType || 'website',
          noIndex: data.data.noIndex || false
        });
      }
    } catch (error) {
      console.error('Error fetching SEO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateField = (field: string, value: string) => {
    const newValidation = { ...validation };

    if (field === 'title') {
      if (value.length === 0) {
        newValidation.title = { type: 'error', message: 'Title is required' };
      } else if (value.length < 30) {
        newValidation.title = { type: 'warning', message: `${value.length}/60 chars - Too short (optimal: 50-60)` };
      } else if (value.length > 60) {
        newValidation.title = { type: 'error', message: `${value.length}/60 chars - Too long!` };
      } else {
        newValidation.title = { type: 'success', message: `${value.length}/60 chars - Perfect!` };
      }
    }

    if (field === 'description') {
      if (value.length === 0) {
        newValidation.description = { type: 'error', message: 'Description is required' };
      } else if (value.length < 100) {
        newValidation.description = { type: 'warning', message: `${value.length}/160 chars - Too short (optimal: 120-160)` };
      } else if (value.length > 160) {
        newValidation.description = { type: 'error', message: `${value.length}/160 chars - Too long!` };
      } else {
        newValidation.description = { type: 'success', message: `${value.length}/160 chars - Perfect!` };
      }
    }

    setValidation(newValidation);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    if (typeof value === 'string') {
      validateField(field, value);
    }
  };

  const handleSave = async () => {
    // Validate before saving
    if (formData.title.length === 0 || formData.description.length === 0) {
      alert('Title and Description are required!');
      return;
    }

    if (formData.title.length > 60 || formData.description.length > 160) {
      alert('Title or Description is too long!');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageType,
          pageSlug,
          ...formData
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ SEO data saved successfully!');
        if (onSave) onSave();
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving SEO data:', error);
      alert('❌ Failed to save SEO data!');
    } finally {
      setSaving(false);
    }
  };

  const renderValidation = (field: string) => {
    const val = validation[field];
    if (!val) return null;

    const icons = {
      error: <AlertCircle className="w-4 h-4" />,
      warning: <AlertCircle className="w-4 h-4" />,
      success: <CheckCircle className="w-4 h-4" />
    };

    const colors = {
      error: 'text-red-600 bg-red-50 border-red-200',
      warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      success: 'text-green-600 bg-green-50 border-green-200'
    };

    return (
      <div className={`flex items-center space-x-2 text-xs mt-1 px-2 py-1 rounded border ${colors[val.type as keyof typeof colors]}`}>
        {icons[val.type as keyof typeof icons]}
        <span>{val.message}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setShowForm(!showForm)}
      >
        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold text-gray-900">SEO Settings</h3>
          <span className="text-xs text-gray-500">({pageType}/{pageSlug})</span>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          {showForm ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="p-4 border-t border-gray-200 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Meta Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              placeholder="e.g., Best Bromo Sunrise Tour | Expert Guide 2025"
              maxLength={60}
            />
            {renderValidation('title')}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Meta Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              placeholder="Experience breathtaking sunrise views at Mount Bromo with our professional tour guides..."
              maxLength={160}
            />
            {renderValidation('description')}
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Meta Keywords
            </label>
            <input
              type="text"
              value={formData.keywords}
              onChange={(e) => handleChange('keywords', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              placeholder="bromo tour, ijen tour, volcano tour, indonesia travel"
            />
            <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
          </div>

          {/* Canonical URL */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Canonical URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.canonicalUrl}
              onChange={(e) => handleChange('canonicalUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              placeholder="https://bromoijen.com/packages/bromo-sunrise"
            />
          </div>

          {/* OG Image */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Open Graph Image URL
            </label>
            <input
              type="url"
              value={formData.ogImage}
              onChange={(e) => handleChange('ogImage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              placeholder="/og-bromo-sunrise.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">Used for social media sharing (1200x630px recommended)</p>
          </div>

          {/* No Index */}
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.noIndex}
                onChange={(e) => handleChange('noIndex', e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-sm text-gray-900">
                No Index (Hide from search engines)
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">Enable for draft or private pages</p>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {saving ? 'Saving...' : '💾 Save SEO Data'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeoForm;

