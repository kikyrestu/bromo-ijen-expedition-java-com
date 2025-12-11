'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Edit,
  Eye,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Filter,
  Package,
  BookOpen,
  Layout,
  Home,
  FileText,
  X,
  Save,
  ExternalLink,
  Copy,
  Trash2,
  Download,
  Upload,
  CheckSquare,
  Square,
  Eye as EyeIcon,
  Search as SearchIcon,
  Image as ImageIcon
} from 'lucide-react';
import Toast from '@/components/Toast';

interface SeoItem {
  id: string;
  pageType: string;
  pageSlug: string;
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl: string;
  ogImage?: string;
  ogType: string;
  noIndex: boolean;
  status: 'complete' | 'missing' | 'needs-update';
  contentTitle?: string; // Title dari content asli
  contentDescription?: string; // Description dari content asli
  updatedAt?: string;
}

interface SeoManagementListProps {
  onRefresh?: () => void;
}

const SeoManagementList = ({ onRefresh }: SeoManagementListProps) => {
  const [seoItems, setSeoItems] = useState<SeoItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<SeoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<SeoItem | null>(null);
  const [editForm, setEditForm] = useState<Partial<SeoItem>>({});
  const [saving, setSaving] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkEditForm, setBulkEditForm] = useState<Partial<SeoItem>>({});
  const [previewItem, setPreviewItem] = useState<SeoItem | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error' | 'warning' | 'info'; message: string }>({
    show: false,
    type: 'success',
    message: ''
  });

  useEffect(() => {
    fetchAllSeoData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, filterType, filterStatus, seoItems]);

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const fetchAllSeoData = async () => {
    setLoading(true);
    try {
      // Fetch semua data
      const [packagesRes, blogsRes, seoDataRes] = await Promise.all([
        fetch('/api/packages?includeAll=true'),
        fetch('/api/blogs?includeAll=true'),
        fetch('/api/seo?all=true')
      ]);

      // Fetch sections separately (need to fetch each section individually)
      const sectionIds = ['hero', 'whoAmI', 'whyChooseUs', 'exclusiveDestinations', 'tourPackages', 'testimonials', 'blog', 'gallery'];
      const sectionsData = await Promise.all(
        sectionIds.map(id => fetch(`/api/sections?section=${id}`).then(r => r.json()))
      );

      const packagesData = await packagesRes.json();
      const blogsData = await blogsRes.json();
      const seoDataJson = await seoDataRes.json();

      const existingSeo = seoDataJson.success ? seoDataJson.data : [];
      const seoMap = new Map();
      existingSeo.forEach((seo: any) => {
        seoMap.set(`${seo.pageType}:${seo.pageSlug}`, seo);
      });

      const items: SeoItem[] = [];

      // Add packages
      if (packagesData.success && packagesData.data) {
        packagesData.data.forEach((pkg: any) => {
          const key = `package:${pkg.slug}`;
          const existing = seoMap.get(key);
          items.push({
            id: `package-${pkg.id}`,
            pageType: 'package',
            pageSlug: pkg.slug || pkg.id,
            title: existing?.title || pkg.title || '',
            description: existing?.description || pkg.description?.substring(0, 160) || '',
            keywords: existing?.keywords || '',
            canonicalUrl: existing?.canonicalUrl || '',
            ogImage: existing?.ogImage || pkg.image || '',
            ogType: existing?.ogType || 'product',
            noIndex: existing?.noIndex || false,
            status: existing ? 'complete' : 'missing',
            contentTitle: pkg.title,
            contentDescription: pkg.description,
            updatedAt: existing?.updatedAt
          });
        });
      }

      // Add blogs
      if (blogsData.success && blogsData.data) {
        blogsData.data.forEach((blog: any) => {
          const key = `blog:${blog.slug}`;
          const existing = seoMap.get(key);
          items.push({
            id: `blog-${blog.id}`,
            pageType: 'blog',
            pageSlug: blog.slug || blog.id,
            title: existing?.title || blog.title || '',
            description: existing?.description || blog.excerpt?.substring(0, 160) || '',
            keywords: existing?.keywords || '',
            canonicalUrl: existing?.canonicalUrl || '',
            ogImage: existing?.ogImage || blog.image || '',
            ogType: existing?.ogType || 'article',
            noIndex: existing?.noIndex || false,
            status: existing ? 'complete' : 'missing',
            contentTitle: blog.title,
            contentDescription: blog.excerpt,
            updatedAt: existing?.updatedAt
          });
        });
      }

      // Add sections
      sectionIds.forEach((sectionId, index) => {
        const key = `section:${sectionId}`;
        const existing = seoMap.get(key);
        const sectionResponse = sectionsData[index];
        const sectionData = sectionResponse?.success ? sectionResponse.data : null;
        items.push({
          id: `section-${sectionId}`,
          pageType: 'section',
          pageSlug: sectionId,
          title: existing?.title || sectionData?.title || sectionId,
          description: existing?.description || sectionData?.description?.substring(0, 160) || '',
          keywords: existing?.keywords || '',
          canonicalUrl: existing?.canonicalUrl || '',
          ogImage: existing?.ogImage || sectionData?.image || '',
          ogType: existing?.ogType || 'website',
          noIndex: existing?.noIndex || false,
          status: existing ? 'complete' : 'missing',
          contentTitle: sectionData?.title,
          contentDescription: sectionData?.description,
          updatedAt: existing?.updatedAt
        });
      });

      // Add home page
      const homeKey = 'home:home';
      const homeSeo = seoMap.get(homeKey);
      items.push({
        id: 'home-home',
        pageType: 'home',
        pageSlug: 'home',
        title: homeSeo?.title || 'Bromo Ijen Tour & Travel',
        description: homeSeo?.description || 'Experience the best volcanic adventures in East Java',
        keywords: homeSeo?.keywords || '',
        canonicalUrl: homeSeo?.canonicalUrl || '',
        ogImage: homeSeo?.ogImage || '',
        ogType: homeSeo?.ogType || 'website',
        noIndex: homeSeo?.noIndex || false,
        status: homeSeo ? 'complete' : 'missing',
        updatedAt: homeSeo?.updatedAt
      });

      setSeoItems(items);
    } catch (error) {
      console.error('Error fetching SEO data:', error);
      showToast('error', 'Failed to fetch SEO data');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...seoItems];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.pageType === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.pageSlug.toLowerCase().includes(query) ||
        item.pageType.toLowerCase().includes(query)
      );
    }

    setFilteredItems(filtered);
  };

  const handleEdit = (item: SeoItem) => {
    setEditingItem(item);
    setEditForm({
      title: item.title,
      description: item.description,
      keywords: item.keywords || '',
      canonicalUrl: item.canonicalUrl,
      ogImage: item.ogImage || '',
      ogType: item.ogType,
      noIndex: item.noIndex
    });
  };

  const handleSave = async () => {
    if (!editingItem) return;

    // Validation
    if (!editForm.title || !editForm.description) {
      showToast('error', 'Title and Description are required');
      return;
    }

    if (editForm.title!.length > 60) {
      showToast('error', 'Title must be 60 characters or less');
      return;
    }

    if (editForm.description!.length > 160) {
      showToast('error', 'Description must be 160 characters or less');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageType: editingItem.pageType,
          pageSlug: editingItem.pageSlug,
          title: editForm.title,
          description: editForm.description,
          keywords: editForm.keywords,
          canonicalUrl: editForm.canonicalUrl,
          ogImage: editForm.ogImage,
          ogType: editForm.ogType,
          noIndex: editForm.noIndex
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast('success', 'SEO data saved successfully!');
        setEditingItem(null);
        fetchAllSeoData();
        if (onRefresh) onRefresh();
      } else {
        showToast('error', data.error || 'Failed to save SEO data');
      }
    } catch (error) {
      console.error('Error saving SEO data:', error);
      showToast('error', 'Failed to save SEO data');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkGenerate = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/seo/bulk-generate', {
        method: 'POST'
      });

      const data = await res.json();
      if (data.success) {
        showToast('success', 'SEO data generated for all content!');
        fetchAllSeoData();
        if (onRefresh) onRefresh();
      } else {
        showToast('error', data.error || 'Failed to generate SEO data');
      }
    } catch (error) {
      console.error('Error generating SEO data:', error);
      showToast('error', 'Failed to generate SEO data');
    } finally {
      setSaving(false);
    }
  };

  // Bulk Edit Functions
  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkEdit = () => {
    if (selectedItems.size === 0) {
      showToast('warning', 'Please select at least one item to edit');
      return;
    }
    setBulkEditMode(true);
    setBulkEditForm({});
  };

  const handleBulkSave = async () => {
    if (selectedItems.size === 0) {
      showToast('warning', 'Please select at least one item to edit');
      return;
    }

    // Validation
    if (bulkEditForm.title && bulkEditForm.title.length > 60) {
      showToast('error', 'Title must be 60 characters or less');
      return;
    }

    if (bulkEditForm.description && bulkEditForm.description.length > 160) {
      showToast('error', 'Description must be 160 characters or less');
      return;
    }

    setSaving(true);
    try {
      const selectedItemsList = Array.from(selectedItems);
      const itemsToUpdate = filteredItems.filter(item => selectedItemsList.includes(item.id));

      // Update each selected item
      const updatePromises = itemsToUpdate.map(item => {
        const updateData = {
          pageType: item.pageType,
          pageSlug: item.pageSlug,
          title: bulkEditForm.title || item.title,
          description: bulkEditForm.description || item.description,
          keywords: bulkEditForm.keywords !== undefined ? bulkEditForm.keywords : item.keywords,
          canonicalUrl: bulkEditForm.canonicalUrl || item.canonicalUrl,
          ogImage: bulkEditForm.ogImage !== undefined ? bulkEditForm.ogImage : item.ogImage,
          ogType: bulkEditForm.ogType || item.ogType,
          noIndex: bulkEditForm.noIndex !== undefined ? bulkEditForm.noIndex : item.noIndex
        };

        return fetch('/api/seo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });
      });

      const results = await Promise.all(updatePromises);
      const allSuccess = results.every(res => res.ok);

      if (allSuccess) {
        showToast('success', `Successfully updated ${selectedItems.size} item(s)!`);
        setBulkEditMode(false);
        setSelectedItems(new Set());
        setBulkEditForm({});
        fetchAllSeoData();
        if (onRefresh) onRefresh();
      } else {
        showToast('error', 'Some items failed to update');
      }
    } catch (error) {
      console.error('Error bulk updating SEO data:', error);
      showToast('error', 'Failed to update SEO data');
    } finally {
      setSaving(false);
    }
  };

  // Export/Import Functions
  const handleExport = () => {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      totalItems: seoItems.length,
      items: seoItems.map(item => ({
        pageType: item.pageType,
        pageSlug: item.pageSlug,
        title: item.title,
        description: item.description,
        keywords: item.keywords,
        canonicalUrl: item.canonicalUrl,
        ogImage: item.ogImage,
        ogType: item.ogType,
        noIndex: item.noIndex
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('success', 'SEO data exported successfully!');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      if (!importData.items || !Array.isArray(importData.items)) {
        showToast('error', 'Invalid import file format');
        return;
      }

      setSaving(true);
      let successCount = 0;
      let failCount = 0;

      for (const item of importData.items) {
        try {
          const res = await fetch('/api/seo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pageType: item.pageType,
              pageSlug: item.pageSlug,
              title: item.title,
              description: item.description,
              keywords: item.keywords || '',
              canonicalUrl: item.canonicalUrl,
              ogImage: item.ogImage || '',
              ogType: item.ogType || 'website',
              noIndex: item.noIndex || false
            })
          });

          if (res.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }
      }

      showToast(
        'success',
        `Import completed! ${successCount} items imported, ${failCount} failed.`
      );
      setShowImportModal(false);
      fetchAllSeoData();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error importing SEO data:', error);
      showToast('error', 'Failed to import SEO data. Please check file format.');
    } finally {
      setSaving(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'package': return <Package className="w-4 h-4" />;
      case 'blog': return <BookOpen className="w-4 h-4" />;
      case 'section': return <Layout className="w-4 h-4" />;
      case 'home': return <Home className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center space-x-1"><CheckCircle className="w-3 h-3" /><span>Complete</span></span>;
      case 'missing':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center space-x-1"><AlertCircle className="w-3 h-3" /><span>Missing</span></span>;
      case 'needs-update':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center space-x-1"><AlertCircle className="w-3 h-3" /><span>Needs Update</span></span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Unknown</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading SEO data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">SEO Content Management</h3>
          <p className="text-sm text-gray-600 mt-1">Manage SEO settings for all pages in one place</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedItems.size > 0 && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
              <span>{selectedItems.size} selected</span>
              <button
                onClick={() => setSelectedItems(new Set())}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {selectedItems.size > 0 && !bulkEditMode && (
            <button
              onClick={handleBulkEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Edit className="w-4 h-4" />
              <span>Bulk Edit ({selectedItems.size})</span>
            </button>
          )}
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <label className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          <button
            onClick={handleBulkGenerate}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
            <span>Generate All Missing SEO</span>
          </button>
          <button
            onClick={fetchAllSeoData}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* Filter by Type */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 appearance-none bg-white"
            >
              <option value="all">All Types</option>
              <option value="package">Packages</option>
              <option value="blog">Blogs</option>
              <option value="section">Sections</option>
              <option value="home">Home</option>
            </select>
          </div>

          {/* Filter by Status */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="complete">Complete</option>
              <option value="missing">Missing</option>
              <option value="needs-update">Needs Update</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Pages</p>
          <p className="text-2xl font-bold text-gray-900">{seoItems.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Complete</p>
          <p className="text-2xl font-bold text-green-600">
            {seoItems.filter(i => i.status === 'complete').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Missing</p>
          <p className="text-2xl font-bold text-red-600">
            {seoItems.filter(i => i.status === 'missing').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Filtered Results</p>
          <p className="text-2xl font-bold text-gray-900">{filteredItems.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-12">
                  {bulkEditMode ? (
                    <button
                      onClick={handleSelectAll}
                      className="text-gray-600 hover:text-gray-900"
                      title="Select All"
                    >
                      {selectedItems.size === filteredItems.length ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  ) : null}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Page</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    No pages found. Try adjusting your filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className={`hover:bg-gray-50 ${selectedItems.has(item.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-3">
                      {bulkEditMode && (
                        <button
                          onClick={() => handleSelectItem(item.id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {selectedItems.has(item.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(item.pageType)}
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">{item.pageType}</p>
                          <p className="text-xs text-gray-500">{item.pageSlug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900 max-w-xs truncate" title={item.title}>
                        {item.title || <span className="text-gray-400 italic">No title</span>}
                      </p>
                      {item.title && (
                        <p className="text-xs text-gray-500 mt-1">{item.title.length}/60 chars</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600 max-w-md truncate" title={item.description}>
                        {item.description || <span className="text-gray-400 italic">No description</span>}
                      </p>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-1">{item.description.length}/160 chars</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setPreviewItem(item)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Preview SEO"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit SEO"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <a
                          href={`/${item.pageType === 'home' ? '' : item.pageType}/${item.pageSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="View Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Edit SEO: {editingItem.pageType}/{editingItem.pageSlug}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Meta Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  placeholder="Enter meta title (max 60 chars)"
                  maxLength={60}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(editForm.title || '').length}/60 characters
                  {editForm.title && editForm.title.length < 30 && (
                    <span className="text-yellow-600 ml-2">⚠️ Too short (optimal: 50-60)</span>
                  )}
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Meta Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  placeholder="Enter meta description (max 160 chars)"
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(editForm.description || '').length}/160 characters
                  {editForm.description && editForm.description.length < 100 && (
                    <span className="text-yellow-600 ml-2">⚠️ Too short (optimal: 120-160)</span>
                  )}
                </p>
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  value={editForm.keywords || ''}
                  onChange={(e) => setEditForm({ ...editForm, keywords: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  placeholder="bromo tour, ijen tour, volcano tour"
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
                  value={editForm.canonicalUrl || ''}
                  onChange={(e) => setEditForm({ ...editForm, canonicalUrl: e.target.value })}
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
                  value={editForm.ogImage || ''}
                  onChange={(e) => setEditForm({ ...editForm, ogImage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  placeholder="/og-default.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: 1200x630px</p>
              </div>

              {/* No Index */}
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.noIndex || false}
                    onChange={(e) => setEditForm({ ...editForm, noIndex: e.target.checked })}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-900">No Index (Hide from search engines)</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !editForm.title || !editForm.description}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save SEO Data'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Edit Modal */}
      {bulkEditMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Bulk Edit SEO ({selectedItems.size} items)
              </h3>
              <button
                onClick={() => {
                  setBulkEditMode(false);
                  setBulkEditForm({});
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Update fields below to apply to all selected items. Leave empty to keep existing values.
              </p>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Meta Title (optional)
                </label>
                <input
                  type="text"
                  value={bulkEditForm.title || ''}
                  onChange={(e) => setBulkEditForm({ ...bulkEditForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  placeholder="Leave empty to keep existing"
                  maxLength={60}
                />
                {bulkEditForm.title && (
                  <p className="text-xs text-gray-500 mt-1">
                    {bulkEditForm.title.length}/60 characters
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Meta Description (optional)
                </label>
                <textarea
                  value={bulkEditForm.description || ''}
                  onChange={(e) => setBulkEditForm({ ...bulkEditForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  placeholder="Leave empty to keep existing"
                  maxLength={160}
                />
                {bulkEditForm.description && (
                  <p className="text-xs text-gray-500 mt-1">
                    {bulkEditForm.description.length}/160 characters
                  </p>
                )}
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Meta Keywords (optional)
                </label>
                <input
                  type="text"
                  value={bulkEditForm.keywords || ''}
                  onChange={(e) => setBulkEditForm({ ...bulkEditForm, keywords: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  placeholder="Leave empty to keep existing"
                />
              </div>

              {/* No Index */}
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkEditForm.noIndex !== undefined}
                    onChange={(e) => setBulkEditForm({ 
                      ...bulkEditForm, 
                      noIndex: e.target.checked ? true : undefined 
                    })}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-900">Update No Index setting</span>
                </label>
                {bulkEditForm.noIndex !== undefined && (
                  <label className="flex items-center space-x-2 cursor-pointer mt-2 ml-6">
                    <input
                      type="checkbox"
                      checked={bulkEditForm.noIndex}
                      onChange={(e) => setBulkEditForm({ ...bulkEditForm, noIndex: e.target.checked })}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">No Index (Hide from search engines)</span>
                  </label>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setBulkEditMode(false);
                    setBulkEditForm({});
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkSave}
                  disabled={saving}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : `Save to ${selectedItems.size} items`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <SearchIcon className="w-5 h-5" />
                <span>SEO Preview: {previewItem.pageType}/{previewItem.pageSlug}</span>
              </h3>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Google Search Result Preview */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Google Search Result Preview</h4>
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="mb-2">
                    <div className="text-xs text-gray-500 mb-1">
                      {previewItem.canonicalUrl || 'https://bromoijen.com'}
                    </div>
                    <div className="text-xl text-blue-600 hover:underline cursor-pointer mb-1">
                      {previewItem.title || 'Page Title'}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {previewItem.description || 'Page description will appear here...'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Open Graph Preview */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Social Media Preview (Open Graph)</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white max-w-md">
                  {previewItem.ogImage ? (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <img 
                        src={previewItem.ogImage.startsWith('http') ? previewItem.ogImage : `/${previewItem.ogImage.replace(/^\//, '')}`}
                        alt="OG Image"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="text-xs text-gray-500 mb-1 uppercase">{previewItem.ogType || 'website'}</div>
                    <div className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                      {previewItem.title || 'Page Title'}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {previewItem.description || 'Page description...'}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      {previewItem.canonicalUrl || 'bromoijen.com'}
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO Details */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase">SEO Details</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Page Type:</span>
                    <span className="font-medium text-gray-900 capitalize">{previewItem.pageType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Page Slug:</span>
                    <span className="font-medium text-gray-900">{previewItem.pageSlug}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Title Length:</span>
                    <span className={`font-medium ${previewItem.title.length > 60 ? 'text-red-600' : previewItem.title.length < 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {previewItem.title.length}/60
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Description Length:</span>
                    <span className={`font-medium ${previewItem.description.length > 160 ? 'text-red-600' : previewItem.description.length < 100 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {previewItem.description.length}/160
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Keywords:</span>
                    <span className="font-medium text-gray-900">{previewItem.keywords || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">No Index:</span>
                    <span className="font-medium text-gray-900">{previewItem.noIndex ? 'Yes (Hidden)' : 'No (Indexed)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Canonical URL:</span>
                    <span className="font-medium text-gray-900 text-xs truncate max-w-xs">{previewItem.canonicalUrl || 'Not set'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setPreviewItem(null);
                    handleEdit(previewItem);
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit SEO</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default SeoManagementList;

