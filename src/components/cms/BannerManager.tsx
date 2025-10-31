'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  LayoutDashboard,
  Image as ImageIcon,
  MonitorSmartphone,
  Wand2,
  Calendar,
  Globe,
  Layers,
  X,
  Save,
  Loader2,
  Upload,
  LayoutList
} from 'lucide-react';
import Toast from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import MediaManager from '@/components/MediaManager';

interface BannerTranslationForm {
  id?: string;
  language: string;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaUrl?: string;
  imageUrl?: string;
}

interface BannerPlacementForm {
  id?: string;
  location: string;
  position: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

interface BannerForm {
  id?: string;
  name: string;
  slug: string;
  title?: string;
  subtitle?: string;
  description?: string;
  displayType: 'image' | 'custom';
  imageUrl?: string;
  backgroundColor?: string;
  overlayColor?: string;
  ctaText?: string;
  ctaUrl?: string;
  isActive: boolean;
  customHtml?: string;
  translations: BannerTranslationForm[];
  placements: BannerPlacementForm[];
}

interface BannerItem extends BannerForm {
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_FORM: BannerForm = {
  name: '',
  slug: '',
  title: '',
  subtitle: '',
  description: '',
  displayType: 'image',
  imageUrl: '',
  backgroundColor: '#0f172a',
  overlayColor: 'rgba(15,23,42,0.65)',
  ctaText: '',
  ctaUrl: '',
  isActive: true,
  customHtml: '',
  translations: [],
  placements: [
    {
      location: 'landing.hero',
      position: 0,
      isActive: true,
    }
  ],
};

const SUPPORTED_LANGUAGES = [
  { value: 'id', label: 'Indonesia' },
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'nl', label: 'Dutch' },
  { value: 'zh', label: '中文' },
];

const BANNER_LOCATIONS = [
  { value: 'landing.hero', label: 'Landing - Hero Section' },
  { value: 'landing.abovePackages', label: 'Landing - Above Tour Packages' },
  { value: 'landing.belowPackages', label: 'Landing - Below Tour Packages' },
  { value: 'landing.belowTestimonials', label: 'Landing - Below Testimonials' },
  { value: 'landing.footerPromo', label: 'Landing - Footer Promo' },
  { value: 'blog.hero', label: 'Blog - Hero Slot' },
  { value: 'blog.sidebar', label: 'Blog - Sidebar' },
  { value: 'blog.postFooter', label: 'Blog - Post Footer' },
];

const LOCATION_LABEL_MAP = BANNER_LOCATIONS.reduce(
  (acc, item) => {
    acc[item.value] = item.label;
    return acc;
  },
  {} as Record<string, string>
);

export default function BannerManager() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [formData, setFormData] = useState<BannerForm>(DEFAULT_FORM);
  const [showMediaManager, setShowMediaManager] = useState(false);
  const [currentImageField, setCurrentImageField] = useState<keyof BannerForm | ''>('');

  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error' | 'warning' | 'info'; message: string }>(
    { show: false, type: 'success', message: '' }
  );
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({ show: false, title: '', message: '', onConfirm: () => {}, type: 'warning' });

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setToast({ show: true, type, message });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' | 'info' = 'warning') => {
    setConfirmDialog({ show: true, title, message, onConfirm, type });
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cms/banners');
      const data = await res.json();

      if (data.success) {
        setBanners(data.data);
      } else {
        showToast('error', data.error || 'Gagal nge-load banner');
      }
    } catch (error) {
      console.error('Failed to fetch banners:', error);
      showToast('error', 'Error pas ngambil data banner');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ ...DEFAULT_FORM, placements: [...DEFAULT_FORM.placements] });
    setEditingBanner(null);
  };

  const openDrawer = (banner?: BannerItem) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        id: banner.id,
        name: banner.name,
        slug: banner.slug,
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        description: banner.description || '',
        displayType: (banner.displayType as 'image' | 'custom') || 'image',
        imageUrl: banner.imageUrl || '',
        backgroundColor: banner.backgroundColor || '',
        overlayColor: banner.overlayColor || '',
        ctaText: banner.ctaText || '',
        ctaUrl: banner.ctaUrl || '',
        isActive: banner.isActive,
        customHtml: banner.customHtml || '',
        translations: banner.translations || [],
        placements: banner.placements?.map((placement) => ({
          id: placement.id,
          location: placement.location,
          position: placement.position ?? 0,
          isActive: placement.isActive ?? true,
          startDate: placement.startDate ? placement.startDate.slice(0, 10) : undefined,
          endDate: placement.endDate ? placement.endDate.slice(0, 10) : undefined,
        })) || [],
      });
    } else {
      resetForm();
    }
    setShowDrawer(true);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
    resetForm();
  };

  const handleFieldChange = (field: keyof BannerForm, value: any) => {
    setFormData((prev) => {
      if (field === 'displayType') {
        const nextType = value as BannerForm['displayType'];
        if (nextType === 'custom') {
          return {
            ...prev,
            displayType: nextType,
            imageUrl: '',
            backgroundColor: prev.backgroundColor,
            overlayColor: prev.overlayColor,
          };
        }
      }

      return { ...prev, [field]: value };
    });
  };

  const openMediaManager = (field: keyof BannerForm) => {
    setCurrentImageField(field);
    setShowMediaManager(true);
  };

  const handlePlacementChange = (index: number, field: keyof BannerPlacementForm, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.placements];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, placements: updated };
    });
  };

  const handleAddPlacement = () => {
    setFormData((prev) => ({
      ...prev,
      placements: [
        ...prev.placements,
        {
          location: 'landing.hero',
          position: prev.placements.length,
          isActive: true,
        },
      ],
    }));
  };

  const handleRemovePlacement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      placements: prev.placements.filter((_, i) => i !== index),
    }));
  };

  const handleTranslationChange = (index: number, field: keyof BannerTranslationForm, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.translations];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, translations: updated };
    });
  };

  const handleAddTranslation = () => {
    setFormData((prev) => ({
      ...prev,
      translations: [
        ...prev.translations,
        {
          language: 'en',
        },
      ],
    }));
  };

  const handleRemoveTranslation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      translations: prev.translations.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      showToast('error', 'Nama banner wajib diisi');
      return;
    }

    try {
      setSaving(true);
      const endpoint = '/api/cms/banners';
      const method = editingBanner ? 'PUT' : 'POST';

      const payload: BannerForm = {
        ...formData,
        placements: formData.placements.map((placement) => ({
          ...placement,
          startDate: placement.startDate || null,
          endDate: placement.endDate || null,
        })),
      };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        showToast('success', `Banner ${editingBanner ? 'berhasil diupdate' : 'berhasil dibuat'}`);
        closeDrawer();
        fetchBanners();
      } else {
        showToast('error', data.error || 'Gagal nyimpen banner');
      }
    } catch (error) {
      console.error('Failed to save banner:', error);
      showToast('error', 'Error pas nyimpen banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (banner: BannerItem) => {
    showConfirm(
      'Hapus Banner',
      `Yakin mau hapus banner "${banner.name}"?`,
      async () => {
        try {
          setLoading(true);
          const res = await fetch(`/api/cms/banners?id=${banner.id}`, { method: 'DELETE' });
          const data = await res.json();

          if (data.success) {
            showToast('success', 'Banner berhasil dihapus');
            fetchBanners();
          } else {
            showToast('error', data.error || 'Gagal hapus banner');
          }
        } catch (error) {
          console.error('Failed to delete banner:', error);
          showToast('error', 'Error pas hapus banner');
        } finally {
          setLoading(false);
          setConfirmDialog((prev) => ({ ...prev, show: false }));
        }
      },
      'danger'
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-orange-500" />
            Banner Management
          </h2>
          <p className="text-gray-600 max-w-2xl">
            Atur banner promosi, hero image, atau konten custom yang bisa dipasang di landing page maupun halaman blog.
          </p>
        </div>

        <button
          onClick={() => openDrawer()}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-white font-semibold shadow-lg hover:from-orange-600 hover:to-amber-600 transition"
        >
          <Plus className="w-5 h-5" />
          Banner Baru
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-10 h-10 rounded-full bg-orange-50 p-2 text-orange-500" />
            <div>
              <p className="text-sm text-gray-500">Total Banner</p>
              <p className="text-2xl font-bold text-gray-900">{banners.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-cyan-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <MonitorSmartphone className="w-10 h-10 rounded-full bg-cyan-50 p-2 text-cyan-500" />
            <div>
              <p className="text-sm text-gray-500">Aktif</p>
              <p className="text-2xl font-bold text-gray-900">{banners.filter((banner) => banner.isActive).length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Wand2 className="w-10 h-10 rounded-full bg-purple-50 p-2 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Placement</p>
              <p className="text-2xl font-bold text-gray-900">
                {banners.reduce((acc, banner) => acc + (banner.placements?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            Loading banners...
          </div>
        ) : banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <Layers className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Belum ada banner</h3>
            <p className="text-gray-500 mt-1 max-w-lg">
              Tambah banner baru untuk promosi paket, highlight konten blog, atau CTA custom di landing page dan blog.
            </p>
            <button
              onClick={() => openDrawer()}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-white font-semibold hover:bg-orange-600"
            >
              <Plus className="w-5 h-5" />
              Banner Baru
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {banners.map((banner) => (
              <div key={banner.id} className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                      banner.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <span className="block h-2 w-2 rounded-full bg-current" />
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-400">Slug: {banner.slug}</span>
                  </div>

                  <h3 className="mt-2 text-xl font-semibold text-gray-900">
                    {banner.title || banner.name}
                  </h3>
                  {banner.subtitle && (
                    <p className="text-sm text-gray-500 mt-1">{banner.subtitle}</p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-orange-600">
                      <LayoutList className="w-4 h-4" />
                      {banner.displayType === 'custom' ? 'Custom HTML' : 'Image Banner'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      {banner.translations?.length || 0} translations
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Update: {new Date(banner.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {banner.placements?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                      {banner.placements.map((placement) => (
                        <span
                          key={placement.id}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1"
                        >
                          <span className="font-semibold text-gray-700">
                            {LOCATION_LABEL_MAP[placement.location] ?? placement.location}
                          </span>
                          <span className="text-gray-400">#{placement.position}</span>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openDrawer(banner)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-orange-400 hover:text-orange-600"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(banner)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:border-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex">
          <div className="hidden flex-1 bg-black/30 backdrop-blur-sm lg:block" onClick={closeDrawer} />
          <div className="h-full w-full max-w-3xl overflow-y-auto bg-white shadow-2xl">
            <form onSubmit={handleSubmit} className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingBanner ? 'Edit Banner' : 'Banner Baru'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {editingBanner ? 'Update konfigurasi banner' : 'Isi detail banner untuk landing page atau blog'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="rounded-full border border-gray-200 p-2 text-gray-500 hover:text-gray-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
                {/* Basic Info */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Informasi Utama</h4>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nama Banner</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        placeholder="Promo Bromo Sunrise"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Slug</label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => handleFieldChange('slug', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        placeholder="promo-bromo-sunrise"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Judul</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleFieldChange('title', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        placeholder="Jelajah Bromo Sunrise"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Sub Judul</label>
                      <input
                        type="text"
                        value={formData.subtitle}
                        onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        placeholder="Diskon 20% bulan ini"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Deskripsi</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleFieldChange('description', e.target.value)}
                        rows={3}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        placeholder="Highlight detail promonya..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">CTA Text</label>
                      <input
                        type="text"
                        value={formData.ctaText}
                        onChange={(e) => handleFieldChange('ctaText', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        placeholder="Pesan Sekarang"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">CTA URL</label>
                      <input
                        type="text"
                        value={formData.ctaUrl}
                        onChange={(e) => handleFieldChange('ctaUrl', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        placeholder="/packages/bromo"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Jenis Banner</label>
                      <select
                        value={formData.displayType}
                        onChange={(e) => handleFieldChange('displayType', e.target.value as 'image' | 'custom')}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                      >
                        <option value="image">Image Banner</option>
                        <option value="custom">Custom HTML</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="banner-is-active"
                        checked={formData.isActive}
                        onChange={(e) => handleFieldChange('isActive', e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                      />
                      <label htmlFor="banner-is-active" className="text-sm font-medium text-gray-700">
                        Banner Aktif
                      </label>
                    </div>
                  </div>
                </div>

                {/* Asset */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Asset Visual</h4>
                  {formData.displayType === 'image' ? (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Image URL</label>
                        <div className="mt-1 flex items-center gap-3">
                          <input
                            type="text"
                            value={formData.imageUrl}
                            onChange={(e) => handleFieldChange('imageUrl', e.target.value)}
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                            placeholder="https://..."
                          />
                          <button
                            type="button"
                            onClick={() => openMediaManager('imageUrl')}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:border-orange-400 hover:text-orange-600"
                          >
                            <Upload className="w-4 h-4" />
                            Browse
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Background Color</label>
                          <input
                            type="text"
                            value={formData.backgroundColor}
                            onChange={(e) => handleFieldChange('backgroundColor', e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                            placeholder="#0f172a"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Overlay Color</label>
                          <input
                            type="text"
                            value={formData.overlayColor}
                            onChange={(e) => handleFieldChange('overlayColor', e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                            placeholder="rgba(15,23,42,0.65)"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-700">Custom HTML</label>
                      <textarea
                        value={formData.customHtml}
                        onChange={(e) => handleFieldChange('customHtml', e.target.value)}
                        rows={8}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        placeholder="<div class='flex flex-col'>..."
                      />
                      <p className="mt-2 text-xs text-gray-400">
                        Bisa buat layout kompleks pakai Tailwind classes atau embed komponen lain.
                      </p>
                    </div>
                  )}
                </div>

                {/* Placements */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                        Placement & Jadwal
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">Atur posisi banner di halaman dan urutan tampilnya.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPlacement}
                      className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-600 hover:border-orange-300"
                    >
                      <Plus className="w-4 h-4" />
                      Placement Baru
                    </button>
                  </div>

                  <div className="mt-4 space-y-4">
                    {formData.placements.map((placement, index) => (
                      <div key={index} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                            <div>
                              <label className="text-xs font-semibold text-gray-600">Lokasi</label>
                              <select
                                value={placement.location}
                                onChange={(e) => handlePlacementChange(index, 'location', e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                              >
                                {BANNER_LOCATIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-600">Urutan</label>
                              <input
                                type="number"
                                value={placement.position}
                                onChange={(e) => handlePlacementChange(index, 'position', Number(e.target.value))}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-600">Start Date</label>
                              <input
                                type="date"
                                value={placement.startDate || ''}
                                onChange={(e) => handlePlacementChange(index, 'startDate', e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-600">End Date</label>
                              <input
                                type="date"
                                value={placement.endDate || ''}
                                onChange={(e) => handlePlacementChange(index, 'endDate', e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={placement.isActive}
                                onChange={(e) => handlePlacementChange(index, 'isActive', e.target.checked)}
                                className="h-5 w-5 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                              />
                              <span className="text-sm text-gray-600">Aktif</span>
                            </div>
                          </div>

                          {formData.placements.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePlacement(index)}
                              className="rounded-lg border border-red-100 bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:border-red-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Preview */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Live Preview</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Visual pratinjau sesuai konfigurasi saat ini sebelum disimpan.
                      </p>
                    </div>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                      {formData.displayType === 'custom' ? 'Custom HTML' : 'Image Layout'}
                    </span>
                  </div>

                  <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
                    {formData.displayType === 'custom' ? (
                      formData.customHtml?.trim() ? (
                        <div
                          className="rounded-lg bg-white shadow-sm"
                          dangerouslySetInnerHTML={{ __html: formData.customHtml }}
                        />
                      ) : (
                        <div className="flex h-48 items-center justify-center text-sm text-gray-400">
                          Masukkan HTML custom untuk melihat preview.
                        </div>
                      )
                    ) : (
                      <div
                        className="relative overflow-hidden rounded-lg"
                        style={{
                          background: formData.backgroundColor || '#0f172a',
                          minHeight: '220px'
                        }}
                      >
                        {formData.imageUrl ? (
                          <img
                            src={formData.imageUrl}
                            alt={formData.title || formData.name || 'Banner preview'}
                            className="absolute inset-0 h-full w-full object-cover opacity-60"
                          />
                        ) : null}
                        <div
                          className="absolute inset-0"
                          style={{ background: formData.overlayColor || 'rgba(15,23,42,0.65)' }}
                        />
                        <div className="relative z-10 flex h-full flex-col justify-center gap-3 p-8 text-white">
                          <p className="text-xs uppercase tracking-wide text-white/70">
                            {LOCATION_LABEL_MAP[formData.placements?.[0]?.location ?? ''] ?? 'Banner Preview'}
                          </p>
                          <h3 className="text-2xl font-bold md:text-3xl">
                            {formData.title || formData.name || 'Judul Banner Belum Diisi'}
                          </h3>
                          {formData.subtitle ? (
                            <p className="text-sm text-white/80 md:text-base">{formData.subtitle}</p>
                          ) : null}
                          {formData.description ? (
                            <p className="text-sm text-white/70 md:text-base line-clamp-3">
                              {formData.description}
                            </p>
                          ) : null}
                          <div className="mt-2 flex flex-wrap items-center gap-3">
                            {formData.ctaText ? (
                              <span className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                                {formData.ctaText}
                              </span>
                            ) : null}
                            {formData.ctaUrl ? (
                              <span className="text-xs text-white/60">{formData.ctaUrl}</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Translations */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Translations</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Isi translasi khusus buat CTA/title/subtitle per bahasa.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTranslation}
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 hover:border-blue-300"
                    >
                      <Plus className="w-4 h-4" />
                      Translation
                    </button>
                  </div>

                  {formData.translations.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-500">
                      Belum ada translasi tambahan. Tambah kalo mau override teks CTA/title per bahasa.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-4">
                      {formData.translations.map((translation, index) => (
                        <div key={index} className="rounded-lg border border-gray-200 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                              <div>
                                <label className="text-xs font-semibold text-gray-600">Language</label>
                                <select
                                  value={translation.language}
                                  onChange={(e) => handleTranslationChange(index, 'language', e.target.value)}
                                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                >
                                  {SUPPORTED_LANGUAGES.map((lang) => (
                                    <option key={lang.value} value={lang.value}>
                                      {lang.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-600">Judul</label>
                                <input
                                  type="text"
                                  value={translation.title || ''}
                                  onChange={(e) => handleTranslationChange(index, 'title', e.target.value)}
                                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-600">Sub Judul</label>
                                <input
                                  type="text"
                                  value={translation.subtitle || ''}
                                  onChange={(e) => handleTranslationChange(index, 'subtitle', e.target.value)}
                                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-gray-600">Deskripsi</label>
                                <textarea
                                  value={translation.description || ''}
                                  onChange={(e) => handleTranslationChange(index, 'description', e.target.value)}
                                  rows={3}
                                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-600">CTA Text</label>
                                <input
                                  type="text"
                                  value={translation.ctaText || ''}
                                  onChange={(e) => handleTranslationChange(index, 'ctaText', e.target.value)}
                                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-600">CTA URL</label>
                                <input
                                  type="text"
                                  value={translation.ctaUrl || ''}
                                  onChange={(e) => handleTranslationChange(index, 'ctaUrl', e.target.value)}
                                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-600">Image URL Override</label>
                                <input
                                  type="text"
                                  value={translation.imageUrl || ''}
                                  onChange={(e) => handleTranslationChange(index, 'imageUrl', e.target.value)}
                                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                  placeholder="Opsional"
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveTranslation(index)}
                              className="rounded-lg border border-red-100 bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:border-red-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Simpan Banner
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast.show && (
        <Toast
          show={toast.show}
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <MediaManager
        isOpen={showMediaManager}
        mode="select"
        onClose={() => {
          setShowMediaManager(false);
          setCurrentImageField('');
        }}
        onSelect={(url) => {
          if (currentImageField) {
            handleFieldChange(currentImageField, url);
          }
          setShowMediaManager(false);
          setCurrentImageField('');
        }}
      />

      <ConfirmDialog
        show={confirmDialog.show}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}
