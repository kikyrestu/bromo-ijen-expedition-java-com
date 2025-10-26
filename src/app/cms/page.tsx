'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Eye, 
  Package, 
  MapPin, 
  MessageSquare, 
  Code, 
  Play,
  BookOpen,
  Camera,
  Users,
  BarChart3,
  Calendar,
  RefreshCw,
  Settings,
  CheckCircle,
  XCircle,
  FolderOpen,
  Menu,
  Languages
} from 'lucide-react';

import CMSForm from '@/components/CMSForm';
import CMSList from '@/components/CMSList';
import CMSDashboard from '@/components/CMSDashboard';
import SectionManager from '@/components/SectionManager';
import MediaManager from '@/components/MediaManager';
import NavigationManager from '@/components/NavigationManager';
import TranslationManager from '@/components/TranslationManager';
import {
  packageFields,
  blogFields,
  testimonialFields,
  galleryFields,
  packageColumns,
  blogColumns,
  testimonialColumns,
  galleryColumns,
  badgeColors
} from '@/config/cmsFields';


interface Package {
  id: string;
  title: string;
  duration: string;
  price: number;
  originalPrice: number;
  discount: string;
  rating: number;
  reviewCount: number;
  category: string;
  description: string;
  destinations: string[];
  includes: string[];
  highlights: string[];
  groupSize: string;
  difficulty: string;
  bestFor: string;
  image: string;
  featured: boolean;
  available: boolean;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  readTime: string;
  category: string;
  tags: string[];
  image: string;
  likes: number;
  shares: number;
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string;
  tags: string[];
  likes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}


const CMSDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [packages, setPackages] = useState<Package[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [showMediaManager, setShowMediaManager] = useState(false); // For form image selection
  const [currentImageField, setCurrentImageField] = useState('');
  
  // Toast notification state
  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({
    show: false,
    type: 'success',
    message: ''
  });

  // Dashboard stats with real data
  const [stats, setStats] = useState({
    totalPackages: packages.length,
    totalBlogs: blogs.length,
    totalGalleryItems: galleryItems.length,
    totalTestimonials: testimonials.length,
    totalSections: 8, // Hero, WhoAmI, WhyChooseUs, ExclusiveDestinations, TourPackages, Testimonials, Blog, Gallery
    totalTranslations: 4, // en, de, nl, zh
    totalMediaFiles: galleryItems.length + packages.length, // Each package has 1 image
    recentActivity: packages.length + blogs.length + testimonials.length + galleryItems.length,
    translationCoverage: 85, // Based on our translation system
    seoScore: 92 // Based on our SEO implementation
  });

  // Recent activity with real data
  const [recentActivity, setRecentActivity] = useState<any[]>(() => {
    const activities = [
      ...packages.slice(0, 2).map((pkg, index) => ({
        id: `package-${pkg.id}`,
        type: 'package' as const,
        title: pkg.title,
        description: `Tour package - ${pkg.duration}`,
        timestamp: `${index + 1} day${index > 0 ? 's' : ''} ago`,
        status: 'published' as const,
        language: 'id'
      })),
      ...blogs.slice(0, 2).map((blog, index) => ({
        id: `blog-${blog.id}`,
        type: 'blog' as const,
        title: blog.title,
        description: 'Blog post published',
        timestamp: `${index + 2} day${index > 0 ? 's' : ''} ago`,
        status: 'published' as const,
        language: 'id'
      })),
      ...testimonials.slice(0, 1).map((testimonial, index) => ({
        id: `testimonial-${testimonial.id}`,
        type: 'testimonial' as const,
        title: testimonial.name,
        description: 'Customer testimonial added',
        timestamp: `${index + 3} day${index > 0 ? 's' : ''} ago`,
        status: 'published' as const,
        language: 'id'
      }))
    ];
    return activities.slice(0, 5); // Show only 5 most recent
  });

  useEffect(() => {
    fetchAllData();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.success) {
        setFormData({
          ...formData,
          whatsappNumber: data.data.whatsappNumber,
          whatsappGreeting: data.data.whatsappGreeting,
          providerName: data.data.providerName,
          memberSince: data.data.memberSince,
          providerPhone: data.data.providerPhone,
          providerEmail: data.data.providerEmail,
          activeTemplate: data.data.activeTemplate || 'default'
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Sequential requests with delays to prevent connection pool exhaustion
      const pkgRes = await fetch('/api/packages?includeAll=true');
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
      
      const blogsRes = await fetch('/api/blogs?includeAll=true');
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
      
      const testRes = await fetch('/api/testimonials?includeAll=true');
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
      
      const galleryRes = await fetch('/api/gallery');
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
      
      const statsRes = await fetch('/api/dashboard?section=overview');

      const pkgData = await pkgRes.json();
      const blogsData = await blogsRes.json();
      const testData = await testRes.json();
      const galleryData = await galleryRes.json();
      const statsData = await statsRes.json();

      if (pkgData.success) setPackages(pkgData.data);
      if (blogsData.success) setBlogs(blogsData.data);
      if (testData.success) setTestimonials(testData.data);
      if (galleryData.success) setGalleryItems(galleryData.data);
      
      // Update stats with real data
      const newStats = {
        totalPackages: pkgData.success ? pkgData.data.length : 0,
        totalBlogs: blogsData.success ? blogsData.data.length : 0,
        totalGalleryItems: galleryData.success ? galleryData.data.length : 0,
        totalTestimonials: testData.success ? testData.data.length : 0,
        totalSections: 8,
        totalTranslations: 4,
        totalMediaFiles: (galleryData.success ? galleryData.data.length : 0) + 
                        (pkgData.success ? pkgData.data.length : 0), // Each package has 1 image
        recentActivity: (pkgData.success ? pkgData.data.length : 0) + 
                       (blogsData.success ? blogsData.data.length : 0) + 
                       (testData.success ? testData.data.length : 0) + 
                       (galleryData.success ? galleryData.data.length : 0),
        translationCoverage: 85,
        seoScore: 92
      };
      setStats(newStats);
      
      // Update recent activity with real data
      const activities = [
        ...(pkgData.success ? pkgData.data.slice(0, 2).map((pkg: any, index: number) => ({
          id: `package-${pkg.id}`,
          type: 'package' as const,
          title: pkg.title,
          description: `Tour package - ${pkg.duration}`,
          timestamp: `${index + 1} day${index > 0 ? 's' : ''} ago`,
          status: 'published' as const,
          language: 'id'
        })) : []),
        ...(blogsData.success ? blogsData.data.slice(0, 2).map((blog: any, index: number) => ({
          id: `blog-${blog.id}`,
          type: 'blog' as const,
          title: blog.title,
          description: 'Blog post published',
          timestamp: `${index + 2} day${index > 0 ? 's' : ''} ago`,
          status: 'published' as const,
          language: 'id'
        })) : []),
        ...(testData.success ? testData.data.slice(0, 1).map((testimonial: any, index: number) => ({
          id: `testimonial-${testimonial.id}`,
          type: 'testimonial' as const,
          title: testimonial.name,
          description: 'Customer testimonial added',
          timestamp: `${index + 3} day${index > 0 ? 's' : ''} ago`,
          status: 'published' as const,
          language: 'id'
        })) : [])
      ];
      setRecentActivity(activities.slice(0, 5));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      let method = 'POST';

      if (activeTab === 'packages') {
        endpoint = '/api/packages';
        if (isEditing) method = 'PUT';
      } else if (activeTab === 'blogs') {
        endpoint = '/api/blogs';
        if (isEditing) method = 'PUT';
      } else if (activeTab === 'testimonials') {
        endpoint = '/api/testimonials';
        if (isEditing) method = 'PUT';
      } else if (activeTab === 'gallery') {
        endpoint = '/api/gallery';
        if (isEditing) method = 'PUT';
      }

      // Preprocess form data
      const processedData = { ...formData };

      // For packages, convert textarea fields to arrays/objects
      if (activeTab === 'packages') {
        // Convert "one per line" fields to arrays
        ['destinations', 'includes', 'excludes', 'highlights'].forEach(field => {
          if (typeof processedData[field] === 'string') {
            processedData[field] = processedData[field].split('\n').filter((line: string) => line.trim());
          }
        });

        // Convert gallery URLs to array
        if (typeof processedData.gallery === 'string') {
          processedData.gallery = processedData.gallery.split('\n').filter((line: string) => line.trim());
        }

        // Parse JSON fields (itinerary, faqs)
        ['itinerary', 'faqs'].forEach(field => {
          if (typeof processedData[field] === 'string' && processedData[field].trim()) {
            try {
              processedData[field] = JSON.parse(processedData[field]);
            } catch (e) {
              console.warn(`Failed to parse ${field} as JSON, keeping as string`);
            }
          }
        });
      }

      // For other tabs with array fields
      if (activeTab === 'blogs' || activeTab === 'gallery') {
        ['highlights', 'tags'].forEach(field => {
          if (typeof processedData[field] === 'string') {
            processedData[field] = processedData[field].split('\n').filter((line: string) => line.trim());
          }
        });
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
      });

      if (response.ok) {
        await fetchAllData();
        setIsEditing(false);
        setEditingItem(null);
        setFormData({});
        showToast('success', '✅ Data berhasil disimpan!');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        showToast('error', `❌ Gagal menyimpan: ${errorData.error || 'Server error'}`);
      }
    } catch (error) {
      console.error('Error saving data:', error);
      showToast('error', '❌ Gagal menyimpan data! Cek koneksi internet.');
    } finally {
      setLoading(false);
    }
  };

  // Toast notification helper
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type, message: '' });
    }, 4000); // Auto dismiss after 4 seconds
  };

  // Handle field change for media selection
  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsEditing(true);
    
    // Preprocess data for form display
    const processedItem = { ...item };

    // For packages, convert arrays to textarea-friendly format
    if (activeTab === 'packages') {
      // Convert arrays to "one per line" strings
      ['destinations', 'includes', 'excludes', 'highlights', 'gallery'].forEach(field => {
        if (Array.isArray(processedItem[field])) {
          processedItem[field] = processedItem[field].join('\n');
        }
      });

      // Convert objects/arrays to JSON strings
      ['itinerary', 'faqs'].forEach(field => {
        if (processedItem[field] && typeof processedItem[field] !== 'string') {
          processedItem[field] = JSON.stringify(processedItem[field], null, 2);
        }
      });
    }

    // For other tabs with array fields
    if (activeTab === 'blogs' || activeTab === 'gallery') {
      ['highlights', 'tags'].forEach(field => {
        if (Array.isArray(processedItem[field])) {
          processedItem[field] = processedItem[field].join('\n');
        }
      });
    }

    setFormData(processedItem);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;

    try {
      let endpoint = '';
      let method = 'DELETE';
      let body = null;

      if (activeTab === 'packages') endpoint = `/api/packages?id=${id}`;
      else if (activeTab === 'blogs') endpoint = `/api/blogs?id=${id}`;
      else if (activeTab === 'testimonials') endpoint = `/api/testimonials?id=${id}`;
      else if (activeTab === 'gallery') endpoint = `/api/gallery?id=${id}`;

      const fetchOptions: RequestInit = {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body
      };

      const response = await fetch(endpoint, fetchOptions);

      if (response.ok) {
        await fetchAllData();
        showToast('success', '✅ Data berhasil dihapus!');
      } else {
        showToast('error', '❌ Gagal menghapus data!');
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      showToast('error', '❌ Gagal menghapus data!');
    }
  };

  const handleToggleStatus = async (item: any) => {
    if (activeTab !== 'packages' && activeTab !== 'blogs' && activeTab !== 'testimonials') return;

    let newStatus: string;
    let confirmMessage: string;
    
    if (activeTab === 'testimonials') {
      // Testimonials: pending, approved, rejected
      newStatus = item.status === 'approved' ? 'pending' : 'approved';
      const itemName = item.name;
      confirmMessage = `Apakah Anda yakin ingin ${newStatus === 'approved' ? 'approve' : 'ubah ke pending'} testimoni dari "${itemName}"?`;
    } else {
      // Packages & Blogs: draft, published
      newStatus = item.status === 'published' ? 'draft' : 'published';
      const itemName = item.title || item.name;
      confirmMessage = `Apakah Anda yakin ingin ${newStatus === 'published' ? 'publish' : 'unpublish'} "${itemName}"?`;
    }

    if (!confirm(confirmMessage)) return;

    try {
      const endpointMap: {[key: string]: string} = {
        packages: '/api/packages',
        blogs: '/api/blogs',
        testimonials: '/api/testimonials'
      };
      const endpoint = endpointMap[activeTab];
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: item.id,
          status: newStatus
        }),
      });

      if (response.ok) {
        await fetchAllData();
        const itemTypeMap: {[key: string]: string} = {
          packages: 'Package',
          blogs: 'Blog',
          testimonials: 'Testimonial'
        };
        const itemType = itemTypeMap[activeTab];
        const statusMsg = activeTab === 'testimonials' 
          ? (newStatus === 'approved' ? 'di-approve' : 'diubah ke pending')
          : (newStatus === 'published' ? 'dipublish' : 'diubah ke draft');
        showToast('success', `✅ ${itemType} berhasil ${statusMsg}!`);
      } else {
        showToast('error', '❌ Gagal mengubah status!');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      showToast('error', '❌ Gagal mengubah status!');
    }
  };

  const handleAddNew = () => {
    setIsEditing(true);
    setEditingItem(null);
    setFormData({});
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-package':
        setActiveTab('packages');
        handleAddNew();
        break;
      case 'add-blog':
        setActiveTab('blogs');
        handleAddNew();
        break;
      case 'add-gallery':
        setActiveTab('gallery');
        handleAddNew();
        break;
      case 'manage-sections':
        setActiveTab('sections');
        break;
      case 'translate-content':
        setActiveTab('translations');
        break;
      case 'seo-settings':
        setActiveTab('seo');
        break;
      case 'analytics':
        // Could open analytics modal or navigate to analytics page
        alert('Analytics feature coming soon!');
        break;
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'sections', name: 'Section Content', icon: Settings },
    { id: 'navigation', name: 'Navigation', icon: Menu },
    { id: 'translations', name: 'Translations', icon: Languages },
    { id: 'packages', name: 'Packages', icon: Package },
    { id: 'blogs', name: 'Blogs', icon: BookOpen },
    { id: 'testimonials', name: 'Testimonials', icon: MessageSquare },
    { id: 'gallery', name: 'Gallery', icon: Camera },
    { id: 'media', name: 'Media Manager', icon: FolderOpen },
    { id: 'settings', name: 'Settings', icon: Code },
  ];

  const getFields = () => {
    switch (activeTab) {
      case 'packages': return packageFields;
      case 'blogs': return blogFields;
      case 'testimonials': return testimonialFields;
      case 'gallery': return galleryFields;
      default: return [];
    }
  };

  const getColumns = () => {
    switch (activeTab) {
      case 'packages': return packageColumns;
      case 'blogs': return blogColumns;
      case 'testimonials': return testimonialColumns;
      case 'gallery': return galleryColumns;
      default: return [];
    }
  };

  const getData = () => {
    switch (activeTab) {
      case 'packages': return packages;
      case 'blogs': return blogs;
      case 'testimonials': return testimonials;
      case 'gallery': return galleryItems;
      default: return [];
    }
  };

  const getSearchFields = () => {
    switch (activeTab) {
      case 'packages': return ['title', 'category'];
      case 'blogs': return ['title', 'author', 'category'];
      case 'testimonials': return ['name', 'role'];
      case 'gallery': return ['title', 'category'];
      default: return [];
    }
  };

  const getFilterOptions = () => {
    switch (activeTab) {
      case 'testimonials': return [
        { value: 'all', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' }
      ];
      case 'blogs': return [
        { value: 'all', label: 'All Status' },
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' },
        { value: 'archived', label: 'Archived' }
      ];
      case 'packages': return [
        { value: 'all', label: 'All Status' },
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' }
      ];
      case 'blogs': return [
        { value: 'all', label: 'All Status' },
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' }
      ];
      default: return [];
    }
  };

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Media Manager & API Tools */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tools & Resources</h3>
        <p className="text-gray-600 mb-6">
          Access media library, API documentation, and testing tools.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Code className="w-8 h-8 text-blue-600 mr-4" />
            <div>
              <h4 className="font-semibold text-blue-900">API Documentation</h4>
              <p className="text-sm text-blue-700">Complete API reference</p>
            </div>
          </a>

          <a
            href="/api-testing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Play className="w-8 h-8 text-green-600 mr-4" />
            <div>
              <h4 className="font-semibold text-green-900">API Testing</h4>
              <p className="text-sm text-green-700">Interactive testing playground</p>
            </div>
          </a>
        </div>
      </div>

      {/* WhatsApp Booking Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">WhatsApp Booking Settings</h3>
        <p className="text-gray-600 mb-6">
          Configure WhatsApp number for direct booking. When customers click "Book Now", they will be redirected to WhatsApp with pre-filled package information.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              WhatsApp Number
            </label>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-900">
                +62
              </span>
              <input
                type="tel"
                value={formData.whatsappNumber || ''}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                placeholder="e.g., 81234567890"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter phone number without +62 or 0. Example: 81234567890
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Greeting Message (Optional)
            </label>
            <textarea
              value={formData.whatsappGreeting || ''}
              onChange={(e) => setFormData({ ...formData, whatsappGreeting: e.target.value })}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              placeholder="e.g., Halo Bromo Ijen Tour! 👋"
            />
            <p className="text-xs text-gray-500 mt-1">
              Customize the greeting message (default: "Halo Bromo Ijen Tour! 👋")
            </p>
          </div>
        </div>
      </div>

      {/* Provider Details */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Details</h3>
        <p className="text-gray-600 mb-6">
          Configure your tour provider information displayed on package detail pages.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Provider Name
            </label>
            <input
              type="text"
              value={formData.providerName || ''}
              onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              placeholder="e.g., Bromo Ijen Tour"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Member Since
            </label>
            <input
              type="text"
              value={formData.memberSince || ''}
              onChange={(e) => setFormData({ ...formData, memberSince: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              placeholder="e.g., 14 May 2024"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Provider Phone
            </label>
            <input
              type="text"
              value={formData.providerPhone || ''}
              onChange={(e) => setFormData({ ...formData, providerPhone: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              placeholder="e.g., +62 812-3456-7890"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Provider Email
            </label>
            <input
              type="email"
              value={formData.providerEmail || ''}
              onChange={(e) => setFormData({ ...formData, providerEmail: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              placeholder="e.g., info@bromotour.com"
            />
          </div>
        </div>
      </div>

      {/* SEO Default Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Default Settings</h3>
        <p className="text-gray-600 mb-6">
          Configure default SEO settings for your website. These will be used as fallback for pages without specific SEO data.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Site Name
            </label>
            <input
              type="text"
              value={formData.siteName || ''}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              placeholder="Bromo Ijen Tour & Travel"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Site Description
            </label>
            <textarea
              value={formData.siteDescription || ''}
              onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              placeholder="Experience the best of Mount Bromo and Ijen with professional tour packages"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Site URL
            </label>
            <input
              type="url"
              value={formData.siteUrl || ''}
              onChange={(e) => setFormData({ ...formData, siteUrl: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              placeholder="https://bromoijen.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your website's main URL (without trailing slash)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Default OG Image
            </label>
            <input
              type="text"
              value={formData.defaultOgImage || ''}
              onChange={(e) => setFormData({ ...formData, defaultOgImage: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              placeholder="/og-default.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Default Open Graph image for social media sharing (1200x630px)
            </p>
          </div>
        </div>
      </div>

      {/* Search Engine Verification */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Search Engine Verification</h3>
        <p className="text-gray-600 mb-6">
          Add verification codes from Google Search Console and Bing Webmaster Tools. These meta tags will be automatically added to your homepage.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Google Search Console Verification Code
            </label>
            <input
              type="text"
              value={formData.googleSiteVerification || ''}
              onChange={(e) => setFormData({ ...formData, googleSiteVerification: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 font-mono text-sm"
              placeholder="e.g., abc123xyz456..."
            />
            <p className="text-xs text-gray-500 mt-1">
              📋 Copy only the <strong>content</strong> value from GSC: <code className="bg-gray-100 px-1 rounded">&lt;meta name=&quot;google-site-verification&quot; content=&quot;<span className="text-orange-600">YOUR_CODE_HERE</span>&quot;&gt;</code>
            </p>
            <a 
              href="https://search.google.com/search-console" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 mt-2 inline-block"
            >
              → Open Google Search Console
            </a>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Bing Webmaster Tools Verification Code
            </label>
            <input
              type="text"
              value={formData.bingSiteVerification || ''}
              onChange={(e) => setFormData({ ...formData, bingSiteVerification: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 font-mono text-sm"
              placeholder="e.g., ABC123XYZ456..."
            />
            <p className="text-xs text-gray-500 mt-1">
              📋 Copy only the <strong>content</strong> value from Bing: <code className="bg-gray-100 px-1 rounded">&lt;meta name=&quot;msvalidate.01&quot; content=&quot;<span className="text-orange-600">YOUR_CODE_HERE</span>&quot;&gt;</code>
            </p>
            <a 
              href="https://www.bing.com/webmasters" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 mt-2 inline-block"
            >
              → Open Bing Webmaster Tools
            </a>
          </div>
        </div>
      </div>

      {/* Template Selection */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎨 Template Selection</h3>
        <p className="text-gray-600 mb-6">
          Choose which template design to use for your landing page. Template controls the layout and styling of sections.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Default Template */}
          <div
            onClick={() => setFormData({ ...formData, activeTemplate: 'default' })}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              formData.activeTemplate === 'default' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Default Template</h4>
              <p className="text-sm text-gray-600">Modern, clean design with card-based layouts</p>
            </div>
          </div>

          {/* Gotur Template */}
          <div
            onClick={() => setFormData({ ...formData, activeTemplate: 'gotur' })}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              formData.activeTemplate === 'gotur' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Gotur Template</h4>
              <p className="text-sm text-gray-600">Professional travel agency template</p>
            </div>
          </div>

          {/* Custom Template */}
          <div
            onClick={() => setFormData({ ...formData, activeTemplate: 'custom' })}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              formData.activeTemplate === 'custom' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Custom Template</h4>
              <p className="text-sm text-gray-600">Fully customized design (Coming Soon)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Save All Settings Button */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <button
          onClick={async () => {
            try {
              const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
              });
              if (response.ok) {
                showToast('success', '✅ All settings saved successfully!');
              } else {
                showToast('error', '❌ Failed to save settings!');
              }
            } catch (error) {
              showToast('error', '❌ Failed to save settings!');
            }
          }}
          className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-lg"
        >
          💾 Save All Settings
        </button>
      </div>

      {/* System Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Site Maintenance Mode</h4>
              <p className="text-sm text-gray-600">Enable maintenance mode to temporarily disable the site</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Auto-approve Testimonials</h4>
              <p className="text-sm text-gray-600">Automatically approve new testimonials</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600">Send email notifications for new bookings</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Backup & Export */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup & Export</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900">Export Data</h4>
              <p className="text-sm text-gray-600">Download all content as JSON</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <RefreshCw className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900">Import Data</h4>
              <p className="text-sm text-gray-600">Upload content from JSON file</p>
            </div>
          </button>
        </div>
      </div>

      {/* API Endpoints Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">API Endpoints Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Content Management</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• /api/destinations</li>
              <li>• /api/packages</li>
              <li>• /api/blogs</li>
              <li>• /api/gallery</li>
            </ul>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">User Interactions</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• /api/bookings</li>
              <li>• /api/contact</li>
              <li>• /api/newsletter</li>
              <li>• /api/testimonials</li>
            </ul>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">System Tools</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• /api/search</li>
              <li>• /api/dashboard</li>
              <li>• /api/blogs/[id]</li>
              <li>• /api/packages/[id]</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex space-x-4">
              <button
                onClick={fetchAllData}
                disabled={loading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 inline ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <a
                href="/"
                target="_blank"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Eye className="w-4 h-4 mr-2 inline" />
                Preview Site
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'dashboard' ? (
          <CMSDashboard
            stats={stats}
            recentActivity={recentActivity}
            onQuickAction={handleQuickAction}
          />
        ) : activeTab === 'sections' ? (
          <SectionManager />
        ) : activeTab === 'navigation' ? (
          <NavigationManager />
        ) : activeTab === 'translations' ? (
          <TranslationManager />
        ) : activeTab === 'media' ? (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <MediaManager
              isOpen={true}
              onClose={() => setActiveTab('dashboard')}
              mode="manage"
            />
          </div>
        ) : activeTab === 'settings' ? (
          renderSettings()
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {isEditing ? (
                <div className="bg-white rounded-xl shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {isEditing ? 'Edit' : 'Add New'} {tabs.find(t => t.id === activeTab)?.name}
                      </h2>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditingItem(null);
                            setFormData({});
                          }}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <CMSForm
                      formData={formData}
                      setFormData={setFormData}
                      fields={getFields()}
                      onSubmit={handleSave}
                      loading={loading}
                      showSeoForm={(activeTab === 'packages' || activeTab === 'blogs') && formData.slug}
                      seoPageType={activeTab === 'packages' ? 'package' : activeTab === 'blogs' ? 'blog' : ''}
                      seoPageSlug={formData.slug || ''}
                      imageContext={
                        activeTab === 'packages' ? 'bromo-ijen-tour-package' :
                        activeTab === 'blogs' ? 'bromo-ijen-blog' :
                        activeTab === 'gallery' ? 'bromo-ijen-gallery' :
                        activeTab === 'testimonials' ? 'bromo-ijen-testimonial' :
                        'bromo-ijen'
                      }
                    />
                  </div>
                </div>
              ) : (
                <CMSList
                  data={getData()}
                  columns={getColumns()}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={(activeTab === 'packages' || activeTab === 'blogs' || activeTab === 'testimonials') ? handleToggleStatus : undefined}
                  searchFields={getSearchFields()}
                  filterOptions={getFilterOptions()}
                  title={`${tabs.find(t => t.id === activeTab)?.name} List`}
                  loading={loading}
                  onRefresh={fetchAllData}
                  badgeColors={badgeColors}
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={handleAddNew}
                      className="w-full flex items-center space-x-2 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New</span>
                    </button>
                    <button
                      onClick={fetchAllData}
                      className="w-full flex items-center space-x-2 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Refresh Data</span>
                    </button>
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Packages</span>
                      <span className="font-semibold">{stats.totalPackages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Blogs</span>
                      <span className="font-semibold">{stats.totalBlogs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Media Files</span>
                      <span className="font-semibold">{stats.totalMediaFiles}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Translation Coverage</span>
                      <span className="font-semibold">{stats.translationCoverage}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 flex-shrink-0" />
            )}
            <div className="font-medium">{toast.message}</div>
            <button
              onClick={() => setToast({ ...toast, show: false })}
              className="ml-4 hover:opacity-80"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Media Manager Modal - for forms */}
      <MediaManager
        isOpen={showMediaManager}
        onClose={() => setShowMediaManager(false)}
        onSelect={(url) => {
          handleFieldChange(currentImageField, url);
          setShowMediaManager(false);
          setCurrentImageField('');
        }}
        mode="select"
      />
    </div>
  );
};

export default CMSDashboardPage;