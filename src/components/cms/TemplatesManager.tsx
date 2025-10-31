'use client';

import { useState, useEffect } from 'react';
import { Palette, Check, ExternalLink, Upload } from 'lucide-react';
import Toast from '@/components/Toast';

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  features: string[];
}

const TEMPLATES: Template[] = [
  {
    id: 'default',
    name: 'Default Template',
    description: 'Clean and modern design with focus on usability',
    preview: '/templates/default-preview.jpg',
    features: [
      'Responsive layout',
      'Multi-language support',
      'SEO optimized',
      'Fast loading'
    ]
  },
  {
    id: 'gotur',
    name: 'Gotur Template',
    description: 'Adventure-focused design with dynamic hero sections',
    preview: '/templates/gotur-preview.jpg',
    features: [
      'Dynamic hero slider',
      'Package showcase',
      'Testimonials carousel',
      'Gallery integration'
    ]
  },
  {
    id: 'minimal',
    name: 'Minimal Template',
    description: 'Minimalist design with elegant typography',
    preview: '/templates/minimal-preview.jpg',
    features: [
      'Minimal UI',
      'Focus on content',
      'Elegant animations',
      'Clean aesthetics'
    ]
  },
  {
    id: 'adventure',
    name: 'Adventure Template',
    description: 'Bold and exciting design for adventure tours',
    preview: '/templates/adventure-preview.jpg',
    features: [
      'Bold visuals',
      'Video backgrounds',
      'Interactive maps',
      'Booking integration'
    ]
  }
];

export default function TemplatesManager() {
  const [activeTemplate, setActiveTemplate] = useState<string>('default');
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error' | 'warning' | 'info'; message: string }>({
    show: false,
    type: 'success',
    message: ''
  });

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setToast({ show: true, type, message });
  };

  useEffect(() => {
    fetchActiveTemplate();
  }, []);

  const fetchActiveTemplate = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      const data = await res.json();
      
      if (data.success && data.settings?.activeTemplate) {
        setActiveTemplate(data.settings.activeTemplate);
      }
    } catch (error) {
      console.error('Error fetching active template:', error);
      showToast('error', 'Failed to load template settings');
    } finally {
      setLoading(false);
    }
  };

  const activateTemplate = async (templateId: string) => {
    try {
      setActivating(templateId);
      
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeTemplate: templateId
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setActiveTemplate(templateId);
        showToast('success', `Template "${TEMPLATES.find(t => t.id === templateId)?.name}" activated successfully!`);
      } else {
        showToast('error', 'Failed to activate template');
      }
    } catch (error) {
      console.error('Error activating template:', error);
      showToast('error', 'Error activating template');
    } finally {
      setActivating(null);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading templates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Template Selection</h2>
          <p className="text-gray-600 mt-1">Choose a template for your website</p>
        </div>
        
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg"
        >
          <ExternalLink className="w-5 h-5" />
          <span>Preview Live Site</span>
        </a>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TEMPLATES.map((template) => {
          const isActive = activeTemplate === template.id;
          const isActivating = activating === template.id;
          
          return (
            <div
              key={template.id}
              className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all ${
                isActive 
                  ? 'border-purple-500 ring-2 ring-purple-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Template Preview */}
              <div className="relative bg-gray-100 aspect-video">
                {template.preview ? (
                  <img
                    src={template.preview}
                    alt={template.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-template.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Palette className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                
                {isActive && (
                  <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center space-x-1 shadow-lg">
                    <Check className="w-4 h-4" />
                    <span>Active</span>
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-gray-600 mb-4">{template.description}</p>
                
                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Features:</h4>
                  <ul className="space-y-1">
                    {template.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => activateTemplate(template.id)}
                  disabled={isActive || isActivating}
                  className={`w-full px-4 py-2.5 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isActivating
                      ? 'bg-purple-100 text-purple-600 cursor-wait'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 shadow-lg'
                  }`}
                >
                  {isActivating ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                      Activating...
                    </span>
                  ) : isActive ? (
                    'Currently Active'
                  ) : (
                    'Activate Template'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Template Upload (Coming Soon) */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 border-dashed border-purple-300 p-8 text-center">
        <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Custom Template Upload</h3>
        <p className="text-gray-600 mb-4">
          Upload your own custom template or purchase premium templates from our marketplace
        </p>
        <button
          disabled
          className="px-6 py-2.5 bg-gray-200 text-gray-400 rounded-lg font-medium cursor-not-allowed"
        >
          Coming Soon
        </button>
      </div>

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
