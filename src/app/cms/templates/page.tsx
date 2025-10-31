'use client';

import { useState, useEffect } from 'react';
import { Layout, ArrowLeft, Check, Eye, Download } from 'lucide-react';
import Link from 'next/link';

interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  features: string[];
  isActive: boolean;
}

const TemplatesManagementPage = () => {
  const [activeTemplate, setActiveTemplate] = useState('default');
  const [saving, setSaving] = useState(false);

  const templates: Template[] = [
    {
      id: 'default',
      name: 'Default Template',
      description: 'Clean and modern tour & travel template with interactive hero section',
      thumbnail: '/templates/default-preview.jpg',
      features: [
        'Interactive Map Hero Section',
        'Batik Ornament Design',
        'Multi-language Support',
        'SEO Optimized',
        'Responsive Design'
      ],
      isActive: true
    },
    {
      id: 'gotur',
      name: 'Gotur Template',
      description: 'Modern template with advanced features and card-based layout',
      thumbnail: '/templates/gotur-preview.jpg',
      features: [
        'Modern Card Layout',
        'Advanced Gallery',
        'Booking Integration',
        'Custom Widgets',
        'Animation Effects'
      ],
      isActive: false
    },
    {
      id: 'minimal',
      name: 'Minimal Template',
      description: 'Minimalist design focused on content and readability',
      thumbnail: '/templates/minimal-preview.jpg',
      features: [
        'Clean Typography',
        'Fast Loading',
        'Simple Navigation',
        'Content Focused',
        'Lightweight'
      ],
      isActive: false
    },
    {
      id: 'adventure',
      name: 'Adventure Template',
      description: 'Bold and energetic template for adventure tours',
      thumbnail: '/templates/adventure-preview.jpg',
      features: [
        'Dynamic Animations',
        'Video Backgrounds',
        'Action-Focused',
        'Social Integration',
        'Booking Engine'
      ],
      isActive: false
    }
  ];

  useEffect(() => {
    // Fetch active template from settings
    fetchActiveTemplate();
  }, []);

  const fetchActiveTemplate = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.data?.activeTemplate) {
        setActiveTemplate(data.data.activeTemplate);
      }
    } catch (error) {
      console.error('Error fetching active template:', error);
    }
  };

  const handleActivateTemplate = async (templateId: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeTemplate: templateId })
      });

      const data = await res.json();

      if (data.success) {
        setActiveTemplate(templateId);
        alert(`✅ Template "${templates.find(t => t.id === templateId)?.name}" activated successfully!\n\nRefresh the homepage to see changes.`);
      } else {
        alert('❌ Failed to activate template: ' + data.error);
      }
    } catch (error) {
      console.error('Error activating template:', error);
      alert('❌ Error activating template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/cms"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back to CMS</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500">
                  <Layout className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Templates Management</h1>
                  <p className="text-sm text-gray-600">Choose and customize your website template</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Active Template Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Currently Active</h3>
                <p className="text-lg font-bold text-orange-600">
                  {templates.find(t => t.id === activeTemplate)?.name || 'Default Template'}
                </p>
              </div>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Preview Live</span>
            </a>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`bg-white rounded-xl shadow-sm border-2 transition-all ${
                template.id === activeTemplate
                  ? 'border-orange-500 ring-2 ring-orange-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Template Preview */}
              <div className="relative h-48 bg-gray-100 rounded-t-xl overflow-hidden">
                {template.thumbnail ? (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <Layout className="w-16 h-16 text-gray-400" />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
                    <Layout className="w-16 h-16 text-orange-400" />
                  </div>
                )}
                
                {/* Active Badge */}
                {template.id === activeTemplate && (
                  <div className="absolute top-4 right-4 flex items-center space-x-1 px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-semibold shadow-lg">
                    <Check className="w-3 h-3" />
                    <span>Active</span>
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {template.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {template.id === activeTemplate ? (
                    <button
                      disabled
                      className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                    >
                      Currently Active
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivateTemplate(template.id)}
                      disabled={saving}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      {saving ? 'Activating...' : 'Activate Template'}
                    </button>
                  )}
                  
                  <button
                    className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    title="Preview template"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Template Upload (Future Feature) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-dashed border-gray-300">
          <div className="text-center py-8">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100">
              <Download className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Template</h3>
            <p className="text-sm text-gray-600 mb-4">
              Want to use your own custom template? Upload your template files here.
            </p>
            <button className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-colors cursor-not-allowed">
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesManagementPage;

