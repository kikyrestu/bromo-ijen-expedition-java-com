'use client';

import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, RefreshCw, ExternalLink, Shield, CheckCircle, XCircle } from 'lucide-react';
import Toast from '@/components/Toast';

interface ApiKey {
  id: string;
  name: string;
  description: string;
  placeholder: string;
  docUrl: string;
  testable: boolean;
}

const API_KEYS: ApiKey[] = [
  {
    id: 'deepl',
    name: 'DeepL API Key',
    description: 'For automatic content translation',
    placeholder: 'Enter your DeepL API key',
    docUrl: 'https://www.deepl.com/pro-api',
    testable: true
  },
  {
    id: 'googleTranslate',
    name: 'Google Translate API Key',
    description: 'Alternative translation service',
    placeholder: 'Enter your Google Translate API key',
    docUrl: 'https://cloud.google.com/translate/docs',
    testable: true
  },
  {
    id: 'openai',
    name: 'OpenAI API Key',
    description: 'For AI-powered content generation',
    placeholder: 'Enter your OpenAI API key',
    docUrl: 'https://platform.openai.com/api-keys',
    testable: true
  },
  {
    id: 'googleAnalytics',
    name: 'Google Analytics Measurement ID',
    description: 'Track website analytics',
    placeholder: 'G-XXXXXXXXXX',
    docUrl: 'https://analytics.google.com',
    testable: false
  },
  {
    id: 'mapbox',
    name: 'Mapbox Access Token',
    description: 'For interactive maps',
    placeholder: 'Enter your Mapbox token',
    docUrl: 'https://docs.mapbox.com/help/getting-started/access-tokens/',
    testable: false
  },
  {
    id: 'stripe',
    name: 'Stripe API Key',
    description: 'For payment processing',
    placeholder: 'sk_test_...',
    docUrl: 'https://stripe.com/docs/keys',
    testable: false
  },
  {
    id: 'sendgrid',
    name: 'SendGrid API Key',
    description: 'For email notifications',
    placeholder: 'SG.xxxxx',
    docUrl: 'https://docs.sendgrid.com/ui/account-and-settings/api-keys',
    testable: true
  },
  {
    id: 'cloudinary',
    name: 'Cloudinary Cloud Name',
    description: 'For image hosting and optimization',
    placeholder: 'Enter your cloud name',
    docUrl: 'https://cloudinary.com/documentation',
    testable: false
  }
];

export default function ApiKeysManager() {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});
  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error' | 'warning' | 'info'; message: string }>({
    show: false,
    type: 'success',
    message: ''
  });

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setToast({ show: true, type, message });
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings/api-keys');
      const data = await res.json();
      
      if (data.success) {
        setApiKeys(data.apiKeys || {});
      } else {
        showToast('error', 'Failed to load API keys');
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
      showToast('error', 'Error loading API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const res = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKeys })
      });
      
      const data = await res.json();
      
      if (data.success) {
        showToast('success', 'API keys saved successfully!');
      } else {
        showToast('error', 'Failed to save API keys');
      }
    } catch (error) {
      console.error('Error saving API keys:', error);
      showToast('error', 'Error saving API keys');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (keyId: string) => {
    try {
      setTesting(keyId);
      
      // Get the actual API key value (not the masked one)
      const actualApiKey = apiKeys[keyId];
      
      if (!actualApiKey || actualApiKey.trim() === '') {
        showToast('error', 'Please enter an API key first');
        setTesting(null);
        return;
      }
      
      const res = await fetch('/api/settings/api-keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          service: keyId, // API endpoint expects 'service' not 'keyId'
          apiKey: actualApiKey // Send the actual key, not masked
        })
      });
      
      const data = await res.json();
      
      setTestResults({
        ...testResults,
        [keyId]: data.success
      });
      
      if (data.success) {
        showToast('success', `${API_KEYS.find(k => k.id === keyId)?.name} is valid!`);
      } else {
        showToast('error', `${API_KEYS.find(k => k.id === keyId)?.name} test failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      setTestResults({
        ...testResults,
        [keyId]: false
      });
      showToast('error', 'Error testing API key');
    } finally {
      setTesting(null);
    }
  };

  const toggleVisibility = (keyId: string) => {
    setVisibleKeys({
      ...visibleKeys,
      [keyId]: !visibleKeys[keyId]
    });
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading API keys...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API Keys Management</h2>
          <p className="text-gray-600 mt-1">Manage your third-party API integrations</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save All Keys</span>
            </>
          )}
        </button>
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
        <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900 mb-1">Security Notice</h3>
          <p className="text-sm text-yellow-800">
            API keys are encrypted and stored securely in the database. Never share your API keys publicly or commit them to version control.
          </p>
        </div>
      </div>

      {/* API Keys Grid */}
      <div className="grid grid-cols-1 gap-6">
        {API_KEYS.map((keyConfig) => {
          const keyValue = apiKeys[keyConfig.id] || '';
          const isVisible = visibleKeys[keyConfig.id];
          const isTesting = testing === keyConfig.id;
          const testResult = testResults[keyConfig.id];
          
          return (
            <div
              key={keyConfig.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Key className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{keyConfig.name}</h3>
                    {testResult !== null && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        testResult 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {testResult ? (
                          <span className="flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Valid
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <XCircle className="w-3 h-3 mr-1" />
                            Invalid
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{keyConfig.description}</p>
                </div>
                
                <a
                  href={keyConfig.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-700"
                >
                  <span>Docs</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={isVisible ? 'text' : 'password'}
                    value={keyValue}
                    onChange={(e) => setApiKeys({ ...apiKeys, [keyConfig.id]: e.target.value })}
                    placeholder={keyConfig.placeholder}
                    className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => toggleVisibility(keyConfig.id)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {isVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {keyConfig.testable && keyValue && (
                  <button
                    onClick={() => handleTest(keyConfig.id)}
                    disabled={isTesting}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
                  >
                    {isTesting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        <span>Testing...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Test Connection</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
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
