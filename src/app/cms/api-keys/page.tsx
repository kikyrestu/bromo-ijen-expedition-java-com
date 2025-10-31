'use client';

import { useState, useEffect } from 'react';
import { 
  Key, 
  ArrowLeft, 
  Save, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle,
  Globe,
  RefreshCw,
  Shield
} from 'lucide-react';
import Link from 'next/link';

interface ApiKey {
  service: string;
  key: string;
  label: string;
  description: string;
  icon: string;
  required: boolean;
}

const ApiKeysManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [testResults, setTestResults] = useState<Record<string, 'idle' | 'testing' | 'success' | 'error'>>({});

  const services: ApiKey[] = [
    {
      service: 'deepl',
      key: '',
      label: 'DeepL API',
      description: 'Professional translation service with high-quality results',
      icon: '🌐',
      required: false
    },
    {
      service: 'google_translate',
      key: '',
      label: 'Google Translate API',
      description: 'Google Cloud Translation API for automatic translation',
      icon: '🔤',
      required: false
    },
    {
      service: 'openai',
      key: '',
      label: 'OpenAI API',
      description: 'AI-powered content generation and translation',
      icon: '🤖',
      required: false
    },
    {
      service: 'google_analytics',
      key: '',
      label: 'Google Analytics',
      description: 'Track website analytics and user behavior',
      icon: '📊',
      required: false
    },
    {
      service: 'mapbox',
      key: '',
      label: 'Mapbox API',
      description: 'Interactive maps and location services',
      icon: '🗺️',
      required: false
    },
    {
      service: 'stripe',
      key: '',
      label: 'Stripe API',
      description: 'Payment processing and subscription management',
      icon: '💳',
      required: false
    },
    {
      service: 'sendgrid',
      key: '',
      label: 'SendGrid API',
      description: 'Email delivery and notification service',
      icon: '📧',
      required: false
    },
    {
      service: 'cloudinary',
      key: '',
      label: 'Cloudinary API',
      description: 'Media storage and image optimization',
      icon: '☁️',
      required: false
    }
  ];

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/api-keys');
      const data = await res.json();
      
      if (data.success) {
        setApiKeys(data.data || {});
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKeys })
      });

      const data = await res.json();

      if (data.success) {
        alert('✅ API Keys saved successfully!');
      } else {
        alert('❌ Failed to save API keys: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving API keys:', error);
      alert('❌ Error saving API keys');
    } finally {
      setSaving(false);
    }
  };

  const testApiKey = async (service: string) => {
    setTestResults(prev => ({ ...prev, [service]: 'testing' }));
    
    try {
      const res = await fetch('/api/settings/api-keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, apiKey: apiKeys[service] })
      });

      const data = await res.json();

      if (data.success) {
        setTestResults(prev => ({ ...prev, [service]: 'success' }));
        setTimeout(() => {
          setTestResults(prev => ({ ...prev, [service]: 'idle' }));
        }, 3000);
      } else {
        setTestResults(prev => ({ ...prev, [service]: 'error' }));
        setTimeout(() => {
          setTestResults(prev => ({ ...prev, [service]: 'idle' }));
        }, 3000);
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, [service]: 'error' }));
      setTimeout(() => {
        setTestResults(prev => ({ ...prev, [service]: 'idle' }));
      }, 3000);
    }
  };

  const toggleShowKey = (service: string) => {
    setShowKeys(prev => ({ ...prev, [service]: !prev[service] }));
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading API Keys...</p>
        </div>
      </div>
    );
  }

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
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">API Keys Management</h1>
                  <p className="text-sm text-gray-600">Manage third-party service integrations</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save All Keys'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-900 mb-1">Security Notice</h3>
              <p className="text-sm text-yellow-700">
                API keys are encrypted and stored securely in the database. Never share your API keys publicly.
                Make sure to rotate keys periodically and revoke unused keys from service providers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 gap-6">
          {services.map((service) => (
            <div key={service.service} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{service.icon}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900">{service.label}</h3>
                      {service.required && (
                        <span className="text-xs font-semibold px-2 py-1 bg-red-100 text-red-700 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                  </div>
                </div>

                {testResults[service.service] === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                {testResults[service.service] === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type={showKeys[service.service] ? 'text' : 'password'}
                      value={apiKeys[service.service] || ''}
                      onChange={(e) => setApiKeys(prev => ({ ...prev, [service.service]: e.target.value }))}
                      placeholder={`Enter ${service.label} key...`}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>

                  <button
                    onClick={() => toggleShowKey(service.service)}
                    className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title={showKeys[service.service] ? 'Hide key' : 'Show key'}
                  >
                    {showKeys[service.service] ? (
                      <EyeOff className="w-5 h-5 text-gray-600" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  <button
                    onClick={() => testApiKey(service.service)}
                    disabled={!apiKeys[service.service] || testResults[service.service] === 'testing'}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${testResults[service.service] === 'testing' ? 'animate-spin' : ''}`} />
                    <span className="text-sm font-medium">Test</span>
                  </button>
                </div>

                {apiKeys[service.service] && (
                  <div className="text-xs text-gray-500 font-mono bg-gray-50 px-3 py-2 rounded">
                    Current: {maskKey(apiKeys[service.service])}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Need Help Getting API Keys?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://www.deepl.com/pro-api"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-blue-700 hover:text-blue-900 text-sm"
            >
              <Globe className="w-4 h-4" />
              <span>Get DeepL API Key →</span>
            </a>
            <a
              href="https://cloud.google.com/translate/docs/setup"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-blue-700 hover:text-blue-900 text-sm"
            >
              <Globe className="w-4 h-4" />
              <span>Get Google Translate API →</span>
            </a>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-blue-700 hover:text-blue-900 text-sm"
            >
              <Globe className="w-4 h-4" />
              <span>Get OpenAI API Key →</span>
            </a>
            <a
              href="https://analytics.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-blue-700 hover:text-blue-900 text-sm"
            >
              <Globe className="w-4 h-4" />
              <span>Setup Google Analytics →</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeysManagementPage;

