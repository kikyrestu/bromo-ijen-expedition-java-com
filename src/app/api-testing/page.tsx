'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { 
  ChevronRight, 
  Play, 
  Copy, 
  Check,
  Code,
  Globe,
  Database,
  Search,
  Mail,
  BookOpen,
  Camera,
  Calendar,
  Users,
  BarChart3,
  ArrowRight,
  Loader2
} from 'lucide-react';

const ApiTesting = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeEndpoint, setActiveEndpoint] = useState('destinations');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copyToClipboard = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const testEndpoint = async (endpoint: string, method: string = 'GET', body?: any) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
      }

      const res = await fetch(endpoint, options);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const endpoints = [
    {
      id: 'destinations',
      title: 'Destinations',
      icon: Globe,
      methods: [
        {
          method: 'GET',
          endpoint: '/api/destinations',
          description: 'Get all destinations',
          testFunction: () => testEndpoint('/api/destinations')
        },
        {
          method: 'GET',
          endpoint: '/api/destinations?featured=true',
          description: 'Get featured destinations',
          testFunction: () => testEndpoint('/api/destinations?featured=true')
        }
      ]
    },
    {
      id: 'packages',
      title: 'Tour Packages',
      icon: Calendar,
      methods: [
        {
          method: 'GET',
          endpoint: '/api/packages',
          description: 'Get all tour packages',
          testFunction: () => testEndpoint('/api/packages')
        },
        {
          method: 'GET',
          endpoint: '/api/packages/bromo-sunrise-adventure',
          description: 'Get specific package details',
          testFunction: () => testEndpoint('/api/packages/bromo-sunrise-adventure')
        }
      ]
    },
    {
      id: 'blogs',
      title: 'Blog Posts',
      icon: BookOpen,
      methods: [
        {
          method: 'GET',
          endpoint: '/api/blogs',
          description: 'Get all blog posts',
          testFunction: () => testEndpoint('/api/blogs')
        },
        {
          method: 'GET',
          endpoint: '/api/blogs?featured=true',
          description: 'Get featured blog posts',
          testFunction: () => testEndpoint('/api/blogs?featured=true')
        }
      ]
    },
    {
      id: 'bookings',
      title: 'Bookings',
      icon: Users,
      methods: [
        {
          method: 'POST',
          endpoint: '/api/bookings',
          description: 'Create new booking',
          testFunction: () => testEndpoint('/api/bookings', 'POST', {
            packageId: 'bromo-sunrise-adventure',
            customerName: 'Test User',
            customerEmail: 'test@example.com',
            checkInDate: '2024-03-15',
            adults: 2,
            children: 0
          })
        }
      ]
    },
    {
      id: 'contact',
      title: 'Contact Form',
      icon: Mail,
      methods: [
        {
          method: 'POST',
          endpoint: '/api/contact',
          description: 'Submit contact form',
          testFunction: () => testEndpoint('/api/contact', 'POST', {
            name: 'Test User',
            email: 'test@example.com',
            subject: 'API Test Inquiry',
            message: 'This is a test message from the API testing page.'
          })
        }
      ]
    },
    {
      id: 'newsletter',
      title: 'Newsletter',
      icon: Mail,
      methods: [
        {
          method: 'POST',
          endpoint: '/api/newsletter',
          description: 'Subscribe to newsletter',
          testFunction: () => testEndpoint('/api/newsletter', 'POST', {
            email: 'test@example.com',
            name: 'Test User',
            preferences: {
              travelTips: true,
              promotions: false,
              blogUpdates: true
            }
          })
        }
      ]
    },
    {
      id: 'gallery',
      title: 'Gallery',
      icon: Camera,
      methods: [
        {
          method: 'GET',
          endpoint: '/api/gallery',
          description: 'Get gallery items',
          testFunction: () => testEndpoint('/api/gallery')
        },
        {
          method: 'GET',
          endpoint: '/api/gallery?sort=popular',
          description: 'Get popular gallery items',
          testFunction: () => testEndpoint('/api/gallery?sort=popular')
        }
      ]
    },
    {
      id: 'search',
      title: 'Search',
      icon: Search,
      methods: [
        {
          method: 'GET',
          endpoint: '/api/search?q=bromo',
          description: 'Search for "bromo"',
          testFunction: () => testEndpoint('/api/search?q=bromo')
        },
        {
          method: 'POST',
          endpoint: '/api/search',
          description: 'Advanced search',
          testFunction: () => testEndpoint('/api/search', 'POST', {
            query: 'bromo',
            type: 'packages',
            filters: {
              category: 'adventure',
              minPrice: 300000,
              maxPrice: 600000
            }
          })
        }
      ]
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: BarChart3,
      methods: [
        {
          method: 'GET',
          endpoint: '/api/dashboard',
          description: 'Get dashboard overview',
          testFunction: () => testEndpoint('/api/dashboard')
        },
        {
          method: 'GET',
          endpoint: '/api/dashboard?section=overview',
          description: 'Get dashboard stats',
          testFunction: () => testEndpoint('/api/dashboard?section=overview')
        }
      ]
    }
  ];

  const currentEndpoint = endpoints.find(ep => ep.id === activeEndpoint);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b mt-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600">API Testing</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">API Testing Playground</h1>
          <p className="text-lg text-gray-600 mb-6">
            Test all API endpoints interactively. Click the play button to execute requests and see real responses.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-900">10 Endpoints</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <Play className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-900">Live Testing</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-900">Real Responses</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-900">Production Ready</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Endpoint Selector */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Select Endpoint</h2>
              <div className="space-y-2">
                {endpoints.map((endpoint) => (
                  <button
                    key={endpoint.id}
                    onClick={() => setActiveEndpoint(endpoint.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      activeEndpoint === endpoint.id
                        ? 'bg-orange-100 text-orange-900 border border-orange-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <endpoint.icon className="w-5 h-5" />
                    <span className="font-medium">{endpoint.title}</span>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Testing Area */}
          <div className="lg:col-span-2">
            {currentEndpoint && (
              <div className="space-y-6">
                {/* Endpoint Info */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <currentEndpoint.icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{currentEndpoint.title}</h2>
                      <p className="text-gray-600">Test {currentEndpoint.title.toLowerCase()} endpoints</p>
                    </div>
                  </div>

                  {/* Methods */}
                  <div className="space-y-4">
                    {currentEndpoint.methods.map((method, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              method.method === 'GET' ? 'bg-green-100 text-green-800' :
                              method.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                              method.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {method.method}
                            </span>
                            <code className="text-sm font-mono text-gray-900">{method.endpoint}</code>
                          </div>
                          <button
                            onClick={method.testFunction}
                            disabled={loading}
                            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                            <span>Test</span>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Response Area */}
                {(response || error) && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Response</h3>
                    
                    {error && (
                      <div className="mb-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm font-medium text-red-800">Error</span>
                          </div>
                          <p className="text-red-700">{error}</p>
                        </div>
                      </div>
                    )}

                    {response && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-green-800">Success</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(response, null, 2), 'response')}
                            className="flex items-center space-x-1 text-sm text-orange-600 hover:text-orange-700"
                          >
                            {copiedCode === 'response' ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span>Copy Response</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                          <pre className="text-sm text-green-400 font-mono">
                            {JSON.stringify(response, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-blue-900 mb-2">How to Use</h3>
                  <ul className="text-blue-800 space-y-2">
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Select an endpoint from the left sidebar</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Click the "Test" button to execute the request</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>View the response in JSON format below</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Copy the response for use in your applications</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTesting;
