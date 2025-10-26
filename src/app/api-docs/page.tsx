'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { 
  ChevronRight, 
  ChevronDown, 
  Copy, 
  Check,
  Globe,
  Database,
  Search,
  Mail,
  BookOpen,
  Camera,
  Calendar,
  Users,
  BarChart3,
  Filter,
  ArrowRight,
  Code,
  Play
} from 'lucide-react';

const ApiDocumentation = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const copyToClipboard = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const apiEndpoints = [
    {
      id: 'destinations',
      title: 'Destinations',
      description: 'Manage tourist destinations',
      icon: Globe,
      methods: [
        {
          method: 'GET',
          endpoint: '/api/destinations',
          description: 'Get all destinations',
          params: [
            { name: 'category', type: 'string', required: false, description: 'Filter by category' },
            { name: 'featured', type: 'boolean', required: false, description: 'Filter featured destinations' },
            { name: 'limit', type: 'number', required: false, description: 'Number of items per page' },
            { name: 'page', type: 'number', required: false, description: 'Page number' }
          ],
          example: {
            request: `fetch('/api/destinations?category=adventure&limit=10&page=1')
  .then(response => response.json())
  .then(data => console.log(data));`,
            response: `{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Gunung Bromo",
      "description": "Gunung Bromo dengan pemandangan sunrise yang menakjubkan",
      "location": "Bromo Tengger, Jawa Timur",
      "category": "Adventure",
      "rating": 4.9,
      "image": "/api/placeholder/400/300",
      "featured": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}`
          }
        },
        {
          method: 'POST',
          endpoint: '/api/destinations',
          description: 'Create new destination',
          body: {
            name: 'string (required)',
            description: 'string (required)',
            location: 'string (required)',
            category: 'string (required)',
            image: 'string (optional)',
            featured: 'boolean (optional)'
          },
          example: {
            request: `fetch('/api/destinations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Kawah Ijen',
    description: 'Kawah Ijen dengan blue fire yang misterius',
    location: 'Banyuwangi, Jawa Timur',
    category: 'Adventure',
    featured: true
  })
})
.then(response => response.json())
.then(data => console.log(data));`,
            response: `{
  "success": true,
  "data": {
    "id": 2,
    "name": "Kawah Ijen",
    "description": "Kawah Ijen dengan blue fire yang misterius",
    "location": "Banyuwangi, Jawa Timur",
    "category": "Adventure",
    "rating": 4.8,
    "image": "/api/placeholder/400/300",
    "featured": true,
    "createdAt": "2024-01-20T10:30:00Z"
  },
  "message": "Destination created successfully"
}`
          }
        }
      ]
    },
    {
      id: 'packages',
      title: 'Tour Packages',
      description: 'Manage tour packages and itineraries',
      icon: Calendar,
      methods: [
        {
          method: 'GET',
          endpoint: '/api/packages',
          description: 'Get all tour packages',
          params: [
            { name: 'category', type: 'string', required: false, description: 'Filter by category' },
            { name: 'featured', type: 'boolean', required: false, description: 'Filter featured packages' },
            { name: 'minPrice', type: 'number', required: false, description: 'Minimum price filter' },
            { name: 'maxPrice', type: 'number', required: false, description: 'Maximum price filter' }
          ],
          example: {
            request: `fetch('/api/packages?category=adventure&featured=true')
  .then(response => response.json())
  .then(data => console.log(data));`,
            response: `{
  "success": true,
  "data": [
    {
      "id": "bromo-sunrise-adventure",
      "title": "Bromo Sunrise Adventure",
      "price": 450000,
      "duration": "3 Days",
      "category": "Adventure Tour",
      "location": "Bromo Tengger, East Java",
      "rating": 4.9,
      "reviewCount": 1200,
      "featured": true
    }
  ]
}`
          }
        },
        {
          method: 'GET',
          endpoint: '/api/packages/[id]',
          description: 'Get specific package details',
          params: [
            { name: 'id', type: 'string', required: true, description: 'Package ID' }
          ],
          example: {
            request: `fetch('/api/packages/bromo-sunrise-adventure')
  .then(response => response.json())
  .then(data => console.log(data));`,
            response: `{
  "success": true,
  "data": {
    "id": "bromo-sunrise-adventure",
    "title": "Bromo Sunrise Adventure",
    "price": 450000,
    "duration": "3 Days",
    "description": "3 hari perjalanan sunrise Bromo...",
    "highlights": ["Sunrise view dari Penanjakan", "Trekking ke kawah Bromo"],
    "itinerary": [...],
    "reviews": [...],
    "images": [...]
  }
}`
          }
        }
      ]
    },
    {
      id: 'blogs',
      title: 'Blog Posts',
      description: 'Manage blog articles and content',
      icon: BookOpen,
      methods: [
        {
          method: 'GET',
          endpoint: '/api/blogs',
          description: 'Get all blog posts',
          params: [
            { name: 'category', type: 'string', required: false, description: 'Filter by category' },
            { name: 'featured', type: 'boolean', required: false, description: 'Filter featured posts' },
            { name: 'limit', type: 'number', required: false, description: 'Number of items per page' }
          ],
          example: {
            request: `fetch('/api/blogs?featured=true&limit=5')
  .then(response => response.json())
  .then(data => console.log(data));`,
            response: `{
  "success": true,
  "data": [
    {
      "id": "bromo-sunrise-guide",
      "title": "Complete Guide to Bromo Sunrise",
      "excerpt": "Discover the ultimate guide...",
      "author": "Bromo Ijen Tour Team",
      "category": "Travel Guide",
      "publishDate": "2024-01-15",
      "readTime": "8 min read",
      "likes": 1247,
      "featured": true
    }
  ]
}`
          }
        }
      ]
    },
    {
      id: 'bookings',
      title: 'Bookings',
      description: 'Manage tour bookings and reservations',
      icon: Users,
      methods: [
        {
          method: 'POST',
          endpoint: '/api/bookings',
          description: 'Create new booking',
          body: {
            packageId: 'string (required)',
            customerName: 'string (required)',
            customerEmail: 'string (required)',
            checkInDate: 'string (required)',
            adults: 'number (required)',
            children: 'number (optional)',
            infants: 'number (optional)',
            specialRequests: 'string (optional)'
          },
          example: {
            request: `fetch('/api/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    packageId: 'bromo-sunrise-adventure',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    checkInDate: '2024-02-15',
    adults: 2,
    children: 0,
    specialRequests: 'Vegetarian meals please'
  })
})
.then(response => response.json())
.then(data => console.log(data));`,
            response: `{
  "success": true,
  "data": {
    "id": 123,
    "packageId": "bromo-sunrise-adventure",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "checkInDate": "2024-02-15",
    "adults": 2,
    "children": 0,
    "totalPrice": 900000,
    "status": "pending",
    "paymentStatus": "pending"
  },
  "message": "Booking created successfully"
}`
          }
        }
      ]
    },
    {
      id: 'contact',
      title: 'Contact Form',
      description: 'Handle contact form submissions',
      icon: Mail,
      methods: [
        {
          method: 'POST',
          endpoint: '/api/contact',
          description: 'Submit contact form',
          body: {
            name: 'string (required)',
            email: 'string (required)',
            message: 'string (required)',
            phone: 'string (optional)',
            subject: 'string (optional)'
          },
          example: {
            request: `fetch('/api/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+62 812-3456-7890',
    subject: 'Bromo Tour Inquiry',
    message: 'Hi, I would like to know more about your Bromo tour packages.'
  })
})
.then(response => response.json())
.then(data => console.log(data));`,
            response: `{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+62 812-3456-7890",
    "subject": "Bromo Tour Inquiry",
    "message": "Hi, I would like to know more...",
    "status": "new",
    "createdAt": "2024-01-20T10:30:00Z"
  },
  "message": "Contact message sent successfully"
}`
          }
        }
      ]
    },
    {
      id: 'newsletter',
      title: 'Newsletter',
      description: 'Manage newsletter subscriptions',
      icon: Mail,
      methods: [
        {
          method: 'POST',
          endpoint: '/api/newsletter',
          description: 'Subscribe to newsletter',
          body: {
            email: 'string (required)',
            name: 'string (optional)',
            preferences: 'object (optional)'
          },
          example: {
            request: `fetch('/api/newsletter', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john@example.com',
    name: 'John Doe',
    preferences: {
      travelTips: true,
      promotions: true,
      blogUpdates: false
    }
  })
})
.then(response => response.json())
.then(data => console.log(data));`,
            response: `{
  "success": true,
  "data": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "status": "active",
    "preferences": {
      "travelTips": true,
      "promotions": true,
      "blogUpdates": false
    },
    "subscribedAt": "2024-01-20T10:30:00Z"
  },
  "message": "Successfully subscribed to newsletter"
}`
          }
        }
      ]
    },
    {
      id: 'gallery',
      title: 'Gallery',
      description: 'Manage photo gallery',
      icon: Camera,
      methods: [
        {
          method: 'GET',
          endpoint: '/api/gallery',
          description: 'Get gallery items',
          params: [
            { name: 'category', type: 'string', required: false, description: 'Filter by category' },
            { name: 'sort', type: 'string', required: false, description: 'Sort by: latest, popular, likes' },
            { name: 'limit', type: 'number', required: false, description: 'Number of items per page' }
          ],
          example: {
            request: `fetch('/api/gallery?category=nature&sort=popular&limit=12')
  .then(response => response.json())
  .then(data => console.log(data));`,
            response: `{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Bromo Sunrise",
      "category": "Nature",
      "image": "/api/placeholder/400/300",
      "description": "Spectacular sunrise view from Mount Bromo",
      "likes": 1247,
      "views": 8934
    }
  ]
}`
          }
        }
      ]
    },
    {
      id: 'search',
      title: 'Search',
      description: 'Search across all content',
      icon: Search,
      methods: [
        {
          method: 'GET',
          endpoint: '/api/search',
          description: 'Basic search',
          params: [
            { name: 'q', type: 'string', required: true, description: 'Search query' },
            { name: 'type', type: 'string', required: false, description: 'Search type: all, packages, blogs, destinations' },
            { name: 'limit', type: 'number', required: false, description: 'Number of results per type' }
          ],
          example: {
            request: `fetch('/api/search?q=bromo&type=packages&limit=5')
  .then(response => response.json())
  .then(data => console.log(data));`,
            response: `{
  "success": true,
  "data": {
    "packages": [
      {
        "id": "bromo-sunrise-adventure",
        "title": "Bromo Sunrise Adventure",
        "description": "3 hari perjalanan sunrise Bromo...",
        "price": 450000,
        "rating": 4.9
      }
    ],
    "blogs": [],
    "destinations": []
  },
  "meta": {
    "query": "bromo",
    "type": "packages",
    "totalResults": 1
  }
}`
          }
        },
        {
          method: 'POST',
          endpoint: '/api/search',
          description: 'Advanced search with filters',
          body: {
            query: 'string (required)',
            type: 'string (optional)',
            filters: 'object (optional)',
            sort: 'string (optional)',
            limit: 'number (optional)'
          },
          example: {
            request: `fetch('/api/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'bromo',
    type: 'packages',
    filters: {
      category: 'adventure',
      minPrice: 300000,
      maxPrice: 600000,
      minRating: 4.5
    },
    sort: 'rating',
    limit: 10
  })
})
.then(response => response.json())
.then(data => console.log(data));`,
            response: `{
  "success": true,
  "data": {
    "packages": [
      {
        "id": "bromo-sunrise-adventure",
        "title": "Bromo Sunrise Adventure",
        "price": 450000,
        "rating": 4.9,
        "category": "Adventure Tour"
      }
    ]
  },
  "meta": {
    "query": "bromo",
    "type": "packages",
    "filters": {
      "category": "adventure",
      "minPrice": 300000,
      "maxPrice": 600000,
      "minRating": 4.5
    },
    "sort": "rating"
  }
}`
          }
        }
      ]
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Admin dashboard statistics',
      icon: BarChart3,
      methods: [
        {
          method: 'GET',
          endpoint: '/api/dashboard',
          description: 'Get dashboard overview',
          params: [
            { name: 'section', type: 'string', required: false, description: 'Section: overview, revenue, packages, activity, bookings' }
          ],
          example: {
            request: `fetch('/api/dashboard?section=overview')
  .then(response => response.json())
  .then(data => console.log(data));`,
            response: `{
  "success": true,
  "data": {
    "totalBookings": 156,
    "totalRevenue": 125000000,
    "totalCustomers": 89,
    "totalPackages": 4,
    "totalBlogs": 12,
    "totalGalleryItems": 24,
    "totalTestimonials": 8,
    "totalNewsletterSubscribers": 234
  }
}`
          }
        }
      ]
    }
  ];

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
            <span className="text-sm text-gray-600">API Documentation</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">API Documentation</h1>
          <p className="text-lg text-gray-600 mb-6">
            Complete API reference for Bromo Ijen Tour & Travel platform. All endpoints support JSON responses with consistent error handling.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-900">13 Endpoints</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-900">REST API</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-900">JSON Format</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <Play className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-900">Live Testing</span>
              </div>
            </div>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="space-y-6">
          {apiEndpoints.map((endpoint) => (
            <div key={endpoint.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Endpoint Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection(endpoint.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <endpoint.icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{endpoint.title}</h2>
                      <p className="text-gray-600">{endpoint.description}</p>
                    </div>
                  </div>
                  {expandedSections.has(endpoint.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Endpoint Methods */}
              {expandedSections.has(endpoint.id) && (
                <div className="border-t border-gray-200">
                  {endpoint.methods.map((method, methodIndex) => (
                    <div key={methodIndex} className="p-6 border-b border-gray-100 last:border-b-0">
                      {/* Method Header */}
                      <div className="flex items-center space-x-3 mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          method.method === 'GET' ? 'bg-green-100 text-green-800' :
                          method.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                          method.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {method.method}
                        </span>
                        <code className="text-lg font-mono text-gray-900">{method.endpoint}</code>
                      </div>

                      <p className="text-gray-700 mb-4">{method.description}</p>

                      {/* Parameters */}
                      {'params' in method && method.params && method.params.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Parameters</h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-200">
                                  <th className="text-left py-2 font-medium text-gray-900">Name</th>
                                  <th className="text-left py-2 font-medium text-gray-900">Type</th>
                                  <th className="text-left py-2 font-medium text-gray-900">Required</th>
                                  <th className="text-left py-2 font-medium text-gray-900">Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {method.params.map((param, paramIndex) => (
                                  <tr key={paramIndex} className="border-b border-gray-100">
                                    <td className="py-2 font-mono text-gray-900">{param.name}</td>
                                    <td className="py-2 text-gray-600">{param.type}</td>
                                    <td className="py-2">
                                      <span className={`px-2 py-1 rounded text-xs ${
                                        param.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        {param.required ? 'Required' : 'Optional'}
                                      </span>
                                    </td>
                                    <td className="py-2 text-gray-600">{param.description}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Request Body */}
                      {method.body && (
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Request Body</h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(method.body, null, 2)}</pre>
                          </div>
                        </div>
                      )}

                      {/* Example Request */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-900">Example Request</h4>
                          <button
                            onClick={() => copyToClipboard(method.example.request, `${endpoint.id}-${methodIndex}-request`)}
                            className="flex items-center space-x-1 text-sm text-orange-600 hover:text-orange-700"
                          >
                            {copiedCode === `${endpoint.id}-${methodIndex}-request` ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                          <pre className="text-sm text-green-400 font-mono">{method.example.request}</pre>
                        </div>
                      </div>

                      {/* Example Response */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-900">Example Response</h4>
                          <button
                            onClick={() => copyToClipboard(method.example.response, `${endpoint.id}-${methodIndex}-response`)}
                            className="flex items-center space-x-1 text-sm text-orange-600 hover:text-orange-700"
                          >
                            {copiedCode === `${endpoint.id}-${methodIndex}-response` ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                          <pre className="text-sm text-blue-400 font-mono">{method.example.response}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Error Handling */}
        <div className="mt-12 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Handling</h2>
          <p className="text-gray-600 mb-4">
            All API endpoints return consistent error responses with appropriate HTTP status codes.
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Response Format</h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-red-400 font-mono">{`{
  "success": false,
  "error": "Error message description"
}`}</pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">HTTP Status Codes</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-900">Code</th>
                      <th className="text-left py-2 font-medium text-gray-900">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-mono text-gray-900">200</td>
                      <td className="py-2 text-gray-600">Success</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-mono text-gray-900">400</td>
                      <td className="py-2 text-gray-600">Bad Request - Invalid parameters</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-mono text-gray-900">404</td>
                      <td className="py-2 text-gray-600">Not Found - Resource not found</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-mono text-gray-900">409</td>
                      <td className="py-2 text-gray-600">Conflict - Resource already exists</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-mono text-gray-900">500</td>
                      <td className="py-2 text-gray-600">Internal Server Error</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Limiting */}
        <div className="mt-8 bg-orange-50 border border-orange-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-orange-900 mb-2">Rate Limiting</h2>
          <p className="text-orange-800 mb-4">
            API requests are rate limited to ensure fair usage and system stability.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600 mb-1">1000</div>
              <div className="text-sm text-orange-800">Requests per hour</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600 mb-1">100</div>
              <div className="text-sm text-orange-800">Requests per minute</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600 mb-1">10</div>
              <div className="text-sm text-orange-800">Concurrent requests</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocumentation;
