'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  UserCircle,
  BarChart3,
  Calendar,
  RefreshCw,
  Settings,
  Bell,
  Search,
  CheckCircle,
  XCircle,
  FolderOpen,
  Menu,
  Languages,
  Layout,
  Key,
  LogOut,
  Lock,
  X,
  EyeOff,
  Eye as EyeIcon,
  Trash2
} from 'lucide-react';

import CMSForm from '@/components/CMSForm';
import CMSList from '@/components/CMSList';
import CMSDashboard from '@/components/CMSDashboard';
import SectionManager from '@/components/SectionManager';
import MediaManager from '@/components/MediaManager';
import NavigationManager from '@/components/NavigationManager';
import TranslationManager from '@/components/TranslationManager';
import TranslationCoverageDisplay from '@/components/TranslationCoverageDisplay';
import Toast from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import UsersManager from '@/components/cms/UsersManager';
import SeoManager from '@/components/cms/SeoManager';
import TemplatesManager from '@/components/cms/TemplatesManager';
import ApiKeysManager from '@/components/cms/ApiKeysManager';
import BannerManager from '@/components/cms/BannerManager';
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [backupList, setBackupList] = useState<any[]>([]);
  
  // Toast notification state
  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error' | 'warning' | 'info'; message: string }>({
    show: false,
    type: 'success',
    message: ''
  });

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
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
    fetchCurrentUser();
  }, []);

  // Fetch backup list when settings tab is opened
  useEffect(() => {
    if (activeTab === 'settings') {
      fetchBackupList();
    }
  }, [activeTab]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.authenticated) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  // Toast helper
  const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setToast({ show: true, type, message });
  };

  // Confirm helper
  const showConfirm = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' | 'info' = 'warning') => {
    setConfirmDialog({ show: true, title, message, onConfirm, type });
  };

  // Fetch backup list
  const fetchBackupList = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/backup/complete');
      const data = await response.json();
      
      if (data.success) {
        setBackupList(data.data || []);
      } else {
        showToast('error', 'Failed to load backup list');
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
      showToast('error', 'Failed to load backup list');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    showConfirm(
      'Logout Confirmation',
      'Are you sure you want to logout?',
      async () => {
        try {
          const res = await fetch('/api/auth/logout', { method: 'POST' });
          if (res.ok) {
            window.location.href = '/maheswaradev/admin/login';
          }
        } catch (error) {
          console.error('Error logging out:', error);
          showToast('error', 'Failed to logout');
        }
        setConfirmDialog({ ...confirmDialog, show: false });
      },
      'warning'
    );
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData)
      });

      const data = await res.json();

      if (data.success) {
        showToast('success', 'Password changed successfully!');
        setShowChangePassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setPasswordError(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('Network error. Please try again');
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.success && data.data) {
        setFormData((prev: any) => ({
          ...prev,
          whatsappNumber: data.data.whatsappNumber ?? prev.whatsappNumber ?? '',
          whatsappGreeting: data.data.whatsappGreeting ?? prev.whatsappGreeting ?? '',
          providerName: data.data.providerName ?? prev.providerName ?? '',
          memberSince: data.data.memberSince ?? prev.memberSince ?? '',
          providerPhone: data.data.providerPhone ?? prev.providerPhone ?? '',
          providerEmail: data.data.providerEmail ?? prev.providerEmail ?? '',
          activeTemplate: data.data.activeTemplate || prev.activeTemplate || 'default',
          // Branding
          brandName: data.data.brandName ?? prev.brandName ?? '',
          siteLogo: data.data.siteLogo ?? prev.siteLogo ?? '',
          siteTagline: data.data.siteTagline ?? prev.siteTagline ?? '',
          favicon: data.data.favicon ?? prev.favicon ?? '',
          // SEO basics displayed in settings
          siteName: data.data.siteName ?? prev.siteName ?? '',
          siteDescription: data.data.siteDescription ?? prev.siteDescription ?? '',
          defaultOgImage: data.data.defaultOgImage ?? prev.defaultOgImage ?? '',
          siteUrl: data.data.siteUrl ?? prev.siteUrl ?? ''
        }));
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
        endpoint = '/api/cms/packages';
        if (isEditing) method = 'PUT';
      } else if (activeTab === 'blogs') {
        endpoint = '/api/cms/blogs';
        if (isEditing) method = 'PUT';
      } else if (activeTab === 'testimonials') {
        endpoint = '/api/cms/testimonials';
        if (isEditing) method = 'PUT';
      } else if (activeTab === 'gallery') {
        endpoint = '/api/cms/gallery';
        if (isEditing) method = 'PUT';
      }

      // Preprocess form data
      const processedData = { ...formData };

      // For packages, convert textarea fields to arrays/objects then stringify for Prisma
      if (activeTab === 'packages') {
        // Convert "one per line" fields to arrays, then to JSON strings for database
        ['destinations', 'includes', 'excludes', 'highlights'].forEach(field => {
          if (typeof processedData[field] === 'string') {
            const arrayData = processedData[field].split('\n').filter((line: string) => line.trim());
            processedData[field] = JSON.stringify(arrayData);
          } else if (Array.isArray(processedData[field])) {
            // If already array (from edit), stringify it
            processedData[field] = JSON.stringify(processedData[field]);
          }
        });

        // Convert gallery URLs to array then stringify
        if (typeof processedData.gallery === 'string') {
          const galleryArray = processedData.gallery.split('\n').filter((line: string) => line.trim());
          processedData.gallery = JSON.stringify(galleryArray);
        } else if (Array.isArray(processedData.gallery)) {
          processedData.gallery = JSON.stringify(processedData.gallery);
        }

        // Stringify JSON fields (itinerary, faqs) if they're objects/arrays
        ['itinerary', 'faqs'].forEach(field => {
          if (typeof processedData[field] === 'string' && processedData[field].trim()) {
            try {
              // Parse to validate, then stringify again
              const parsed = JSON.parse(processedData[field]);
              processedData[field] = JSON.stringify(parsed);
            } catch (e) {
              console.warn(`Failed to parse ${field} as JSON, keeping as string`);
            }
          } else if (typeof processedData[field] === 'object') {
            // If already object/array, just stringify
            processedData[field] = JSON.stringify(processedData[field]);
          }
        });
      }

      // For other tabs with array fields
      if (activeTab === 'blogs' || activeTab === 'gallery') {
        ['highlights', 'tags'].forEach(field => {
          if (typeof processedData[field] === 'string') {
            const arrayData = processedData[field].split('\n').filter((line: string) => line.trim());
            processedData[field] = JSON.stringify(arrayData);
          } else if (Array.isArray(processedData[field])) {
            processedData[field] = JSON.stringify(processedData[field]);
          }
        });
      }

      console.log('💾 Saving to endpoint:', endpoint);
      console.log('📦 Data to save:', processedData);

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Save successful:', responseData);
        await fetchAllData();
        setIsEditing(false);
        setEditingItem(null);
        setFormData({});
        showToast('success', '✅ Data berhasil disimpan!');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Save failed:', errorData);
        showToast('error', `❌ Gagal menyimpan: ${errorData.error || errorData.details || 'Server error'}`);
      }
    } catch (error) {
      console.error('Error saving data:', error);
      showToast('error', '❌ Gagal menyimpan data! Cek koneksi internet.');
    } finally {
      setLoading(false);
    }
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
    showConfirm(
      'Delete Confirmation',
      'Are you sure you want to delete this item? This action cannot be undone.',
      async () => {
        try {
          await performDelete(id);
        } catch (error) {
          console.error('Error in delete handler:', error);
        }
        setConfirmDialog({ ...confirmDialog, show: false });
      },
      'danger'
    );
  };

  const performDelete = async (id: number | string) => {
    try {
      let endpoint = '';
      let method = 'DELETE';
      let body = null;

      if (activeTab === 'packages') endpoint = `/api/cms/packages?id=${id}`;
      else if (activeTab === 'blogs') endpoint = `/api/cms/blogs?id=${id}`;
      else if (activeTab === 'testimonials') endpoint = `/api/cms/testimonials?id=${id}`;
      else if (activeTab === 'gallery') endpoint = `/api/cms/gallery?id=${id}`;
      else if (activeTab === 'banners') endpoint = `/api/cms/banners?id=${id}`;

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

    showConfirm(
      'Status Change',
      confirmMessage,
      async () => {
        try {
          const endpointMap: {[key: string]: string} = {
            packages: '/api/cms/packages',
            blogs: '/api/cms/blogs',
            testimonials: '/api/cms/testimonials'
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
            showToast('success', `${itemType} berhasil ${statusMsg}!`);
          } else {
            showToast('error', 'Gagal mengubah status!');
          }
        } catch (error) {
          console.error('Error toggling status:', error);
          showToast('error', 'Gagal mengubah status!');
        }
        setConfirmDialog({ ...confirmDialog, show: false });
      },
      'info'
    );
  };

  const handleAddNew = () => {
    setIsEditing(true);
    setEditingItem(null);
    setFormData({});
  };

  const handleNavigate = (tabId: string) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
    setIsEditing(false);
    setEditingItem(null);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-package':
        handleNavigate('packages');
        handleAddNew();
        break;
      case 'add-blog':
        handleNavigate('blogs');
        handleAddNew();
        break;
      case 'add-gallery':
        handleNavigate('gallery');
        handleAddNew();
        break;
      case 'manage-sections':
        handleNavigate('sections');
        break;
      case 'translate-content':
        handleNavigate('translations');
        break;
      case 'seo-settings':
        handleNavigate('settings');
        break;
      case 'analytics':
        // Could open analytics modal or navigate to analytics page
        showToast('info', 'Analytics feature coming soon!');
        break;
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'templates', name: 'Templates', icon: Layout },
    { id: 'sections', name: 'Section Content', icon: Settings },
    { id: 'navigation', name: 'Navigation', icon: Menu },
    { id: 'banners', name: 'Banners', icon: Layout },
    { id: 'translations', name: 'Translations', icon: Languages },
    { id: 'packages', name: 'Packages', icon: Package },
    { id: 'blogs', name: 'Blogs', icon: BookOpen },
    { id: 'testimonials', name: 'Testimonials', icon: MessageSquare },
    { id: 'gallery', name: 'Gallery', icon: Camera },
    { id: 'media', name: 'Media Manager', icon: FolderOpen },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'seo', name: 'SEO Management', icon: Search },
    { id: 'api-keys', name: 'API Keys', icon: Key },
    { id: 'settings', name: 'Settings', icon: Code },
  ];

  const tabCounters: Record<string, number> = {
    packages: stats.totalPackages,
    blogs: stats.totalBlogs,
    testimonials: stats.totalTestimonials,
    gallery: stats.totalGalleryItems,
  };

  const renderNavItems = () => (
    <nav className="space-y-1 px-3">
      {tabs.map((tab: any) => {
        const isActive = activeTab === tab.id;
        const badge = tabCounters[tab.id];

        // All tabs are now internal (no external redirects)
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleNavigate(tab.id)}
            className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold tracking-wide transition ${
              isActive
                ? 'bg-orange-500/20 text-white shadow-inner ring-1 ring-orange-400/30'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-3">
              <tab.icon className={`h-4 w-4 ${isActive ? 'text-orange-200' : 'text-white/50 group-hover:text-orange-200'}`} />
              {tab.name}
            </span>
            {badge !== undefined && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  isActive ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70'
                }`}
              >
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

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

      {/* General Settings - Logo & Site Name */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🏢 General Settings</h3>
        <p className="text-gray-600 mb-6">
          Configure your site logo and basic branding. These settings will be displayed in the header navigation across all pages.
        </p>
        
        <div className="space-y-6">
          {/* Site Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Site Name / Brand Name
            </label>
            <input
              type="text"
              value={formData.brandName || formData.siteName || ''}
              onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              placeholder="e.g., Bromo Ijen Tours"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will appear in the header next to your logo
            </p>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Site Logo
            </label>
            <div className="flex items-start gap-4">
              {/* Logo Preview */}
              {formData.siteLogo && (
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                    <img 
                      src={formData.siteLogo} 
                      alt="Site Logo" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">Current Logo</p>
                </div>
              )}
              
              {/* Logo Input */}
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.siteLogo || ''}
                  onChange={(e) => setFormData({ ...formData, siteLogo: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 font-mono text-sm"
                  placeholder="/uploads/logo.png"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter logo URL or use Media Manager to upload
                </p>
                
                <button
                  onClick={() => {
                    setCurrentImageField('siteLogo');
                    setShowMediaManager(true);
                  }}
                  className="mt-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Browse Media Library
                </button>
              </div>
            </div>
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>💡 Recommended:</strong> PNG format with transparent background, 200x60px or similar aspect ratio (max height: 60px in header)
              </p>
            </div>
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Site Tagline (Optional)
            </label>
            <input
              type="text"
              value={formData.siteTagline || ''}
              onChange={(e) => setFormData({ ...formData, siteTagline: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              placeholder="e.g., Your Adventure Starts Here"
            />
            <p className="text-xs text-gray-500 mt-1">
              Short tagline displayed below logo (optional)
            </p>
          </div>

          {/* Favicon */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Favicon (Browser Tab Icon)
            </label>
            <div className="flex items-start gap-4">
              {formData.favicon && (
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                    <img 
                      src={formData.favicon} 
                      alt="Favicon" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">Favicon</p>
                </div>
              )}
              
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.favicon || ''}
                  onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 font-mono text-sm"
                  placeholder="/favicon.ico"
                />
                <p className="text-xs text-gray-500 mt-1">
                  32x32px or 16x16px .ico or .png file
                </p>
              </div>
            </div>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💾 Complete Backup System</h3>
        <p className="text-gray-600 mb-6">
          Create a complete backup file (<code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">.mswbak</code>) containing database, content, and all uploaded files. 
          Perfect for site migration or disaster recovery.
        </p>
        
        {/* Create Backup Button */}
        <div className="mb-6">
          <button 
            onClick={async () => {
              try {
                showToast('info', '⏳ Creating complete backup... This may take a few minutes.');
                
                const response = await fetch('/api/backup/complete', { 
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
                });
                
                const data = await response.json();
                
                if (data.success) {
                  showToast('success', `✅ Backup created! ${data.filename} (${data.size})`);
                  // Refresh backup list
                  fetchBackupList();
                } else {
                  showToast('error', `❌ Backup failed: ${data.error}`);
                }
              } catch (error) {
                console.error('Backup error:', error);
                showToast('error', '❌ Failed to create backup!');
              }
            }}
            className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl border-2 border-blue-500"
          >
            <RefreshCw className="w-5 h-5" />
            <div className="text-left">
              <h4 className="font-semibold text-lg">Create Complete Backup (.mswbak)</h4>
              <p className="text-sm text-blue-100">Database + Content + Files (One-click restore)</p>
            </div>
          </button>
        </div>
        
        {/* Backup Files List */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
            <span>📂 Existing Backups</span>
            <button
              onClick={fetchBackupList}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </h4>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading backups...
            </div>
          ) : backupList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No backups found</p>
              <p className="text-sm">Create your first backup above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {backupList.map((backup: any) => (
                <div
                  key={backup.name}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h5 className="font-mono text-sm font-semibold text-gray-900">{backup.name}</h5>
                      <p className="text-xs text-gray-600">
                        {new Date(backup.createdAt).toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })} • {backup.size}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <a
                      href={backup.path}
                      download
                      className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </a>
                    
                    <button
                      onClick={() => {
                        showConfirm(
                          'Delete Backup',
                          `Are you sure you want to delete ${backup.name}? This action cannot be undone.`,
                          async () => {
                            try {
                              const response = await fetch(`/api/backup/complete?filename=${encodeURIComponent(backup.name)}`, {
                                method: 'DELETE'
                              });
                              
                              const data = await response.json();
                              
                              if (data.success) {
                                showToast('success', '✅ Backup deleted successfully');
                                fetchBackupList();
                              } else {
                                showToast('error', `❌ Delete failed: ${data.error}`);
                              }
                            } catch (error) {
                              showToast('error', '❌ Failed to delete backup');
                            }
                            setConfirmDialog({ ...confirmDialog, show: false });
                          },
                          'danger'
                        );
                      }}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 text-sm mb-1">💡 What's included in .mswbak backup?</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>✅ <strong>database.sql</strong> - Complete MySQL database dump</li>
                <li>✅ <strong>app-data.json</strong> - All content with translations (packages, blogs, etc)</li>
                <li>✅ <strong>uploads/</strong> - All images and files from /public/uploads/</li>
                <li>✅ <strong>manifest.json</strong> - File checksums for integrity verification</li>
                <li>🔄 <strong>One-click restore</strong> - Upload .mswbak file to restore entire site</li>
              </ul>
            </div>
          </div>
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
    <div className="flex min-h-screen bg-[#eef3f8]">
      <aside className="hidden w-64 flex-col bg-gradient-to-b from-[#0f1e2f] via-[#0b2635] to-[#051320] text-white shadow-lg lg:flex lg:sticky lg:top-0 lg:h-screen">
        <div className="flex h-20 items-center border-b border-white/10 px-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.45em] text-white/60">Navigator</p>
            <span className="text-lg font-semibold tracking-wide">TournTravel Suite</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-4">{renderNavItems()}</div>
        <div className="border-t border-white/10 px-6 py-4 text-[11px] leading-relaxed text-white/40">
          Crafted for premium tour operators. Inspired by WordPress, refined for Nusantara journeys.
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="flex-1 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-72 bg-gradient-to-b from-[#102134] via-[#0b2534] to-[#051320] text-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
              <span className="text-base font-semibold tracking-wide">TournTravel Suite</span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-md p-2 text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">{renderNavItems()}</div>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/10 bg-gradient-to-r from-[#0c1f30] via-[#1a2e45] to-[#0c1f30] px-4 text-gray-100 shadow-sm sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-md border border-white/10 p-2 text-white/70 hover:bg-white/10 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[10px] uppercase tracking-[0.5em] text-gray-300">Control Center</p>
              <h1 className="text-sm font-semibold tracking-wide">TournTravel Admin</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-gray-100 md:flex">
              <Search className="h-3.5 w-3.5" />
              <input
                type="text"
                placeholder="Search content..."
                className="w-36 bg-transparent text-xs text-white placeholder:text-gray-300 focus:outline-none"
              />
            </div>
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <a
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-md border border-orange-400/30 bg-orange-500/20 px-3 py-2 text-xs font-semibold text-orange-100 transition hover:bg-orange-500/30"
            >
              <Eye className="h-4 w-4" />
              Preview
            </a>
            <button
              type="button"
              className="hidden items-center rounded-full border border-white/10 bg-white/10 p-2 text-white/70 hover:bg-white/20 sm:inline-flex"
            >
              <Bell className="h-4 w-4" />
            </button>
            {currentUser && (
              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white sm:flex">
                <UserCircle className="h-4 w-4" />
                {currentUser.displayName}
              </div>
            )}
            <button
              onClick={() => setShowChangePassword(true)}
              className="hidden items-center gap-2 rounded-md border border-yellow-400/30 bg-yellow-500/20 px-3 py-2 text-xs font-semibold text-yellow-100 transition hover:bg-yellow-500/30 sm:inline-flex"
              title="Change Password"
            >
              <Lock className="h-4 w-4" />
            </button>
            <button
              onClick={handleLogout}
              className="hidden items-center gap-2 rounded-md border border-red-400/30 bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-500/30 sm:inline-flex"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 lg:px-10">
          <div className="space-y-8">
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
              <TranslationCoverageDisplay autoRefresh={true} refreshInterval={60} />
            ) : activeTab === 'users' ? (
              <UsersManager />
            ) : activeTab === 'seo' ? (
              <SeoManager />
            ) : activeTab === 'templates' ? (
              <TemplatesManager />
            ) : activeTab === 'api-keys' ? (
              <ApiKeysManager />
            ) : activeTab === 'banners' ? (
              <BannerManager />
            ) : activeTab === 'media' ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <MediaManager
                  isOpen={true}
                  onClose={() => handleNavigate('dashboard')}
                  mode="manage"
                />
              </div>
            ) : activeTab === 'settings' ? (
              renderSettings()
            ) : (
              <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,_3fr)_minmax(0,_1fr)]">
                <div className="space-y-6">
                  {isEditing ? (
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                        <h2 className="text-base font-semibold text-slate-900">
                          {isEditing ? 'Edit' : 'Add New'} {tabs.find((t) => t.id === activeTab)?.name}
                        </h2>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditingItem(null);
                            setFormData({});
                          }}
                          className="text-sm font-medium text-slate-500 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="px-6 py-6">
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
                            activeTab === 'packages'
                              ? 'bromo-ijen-tour-package'
                              : activeTab === 'blogs'
                              ? 'bromo-ijen-blog'
                              : activeTab === 'gallery'
                              ? 'bromo-ijen-gallery'
                              : activeTab === 'testimonials'
                              ? 'bromo-ijen-testimonial'
                              : 'bromo-ijen'
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
                      onToggleStatus={
                        activeTab === 'packages' || activeTab === 'blogs' || activeTab === 'testimonials'
                          ? handleToggleStatus
                          : undefined
                      }
                      searchFields={getSearchFields()}
                      filterOptions={getFilterOptions()}
                      title={`${tabs.find((t) => t.id === activeTab)?.name} List`}
                      loading={loading}
                      onRefresh={fetchAllData}
                      badgeColors={badgeColors}
                    />
                  )}
                </div>
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-base font-semibold text-slate-900">Quick Actions</h3>
                    <div className="mt-4 space-y-2">
                      <button
                        onClick={handleAddNew}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                      >
                        <Plus className="h-4 w-4" />
                        Add New
                      </button>
                      <button
                        onClick={fetchAllData}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Refresh Data
                      </button>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-base font-semibold text-slate-900">Quick Stats</h3>
                    <dl className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <dt className="text-slate-500">Total Packages</dt>
                        <dd className="font-semibold text-slate-900">{stats.totalPackages}</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-slate-500">Total Blogs</dt>
                        <dd className="font-semibold text-slate-900">{stats.totalBlogs}</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-slate-500">Media Files</dt>
                        <dd className="font-semibold text-slate-900">{stats.totalMediaFiles}</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-slate-500">Translation Coverage</dt>
                        <dd className="font-semibold text-slate-900">{stats.translationCoverage}%</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div
            className={`flex items-center gap-3 rounded-lg px-6 py-4 shadow-2xl ${
              toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            <span className="font-medium">{toast.message}</span>
            <button onClick={() => setToast({ ...toast, show: false })} className="text-lg leading-none">
              ×
            </button>
          </div>
        </div>
      )}

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

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100">
                  <Lock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
                  <p className="text-sm text-gray-600">Update your account password</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowChangePassword(false);
                  setPasswordError('');
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{passwordError}</p>
                </div>
              )}

              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-yellow-500 focus:border-transparent placeholder:text-gray-500"
                    required
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-yellow-500 focus:border-transparent placeholder:text-gray-500"
                    required
                    minLength={6}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-yellow-500 focus:border-transparent placeholder:text-gray-500"
                    required
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordError('');
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        show={confirmDialog.show}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, show: false })}
      />
    </div>
  );
};

export default CMSDashboardPage;
