'use client';

import { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { 
  Save, 
  Eye, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Edit,
  Image,
  MapPin,
  Package,
  MessageSquare,
  BookOpen,
  Camera,
  Users,
  Award,
  Shield,
  Settings,
  Star,
  Clock,
  Heart,
  BarChart3,
  Code
} from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import WhoAmISection from '@/components/WhoAmISection';
import DestinasiEksklusifSection from '@/components/DestinasiEksklusifSection';
import TourPackagesSection from '@/components/TourPackagesSection';
import BlogSection from '@/components/BlogSection';
import TestimonialSection from '@/components/TestimonialSection';
import GallerySection from '@/components/GallerySection';
import MediaManager from '@/components/MediaManager';
import LanguageProvider from '@/contexts/LanguageContext';

interface SectionContent {
  id: string;
  sectionId?: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  logo?: string;
  phone?: string;
  email?: string;
  ctaText?: string;
  ctaLink?: string;
  buttonText?: string;
  backgroundVideo?: string;
  destinations?: any[];
  features?: any[];
  stats?: any[];
  packages?: any[];
  testimonials?: any[];
  posts?: any[];
  items?: any[];
  categories?: string[];
  // Display settings (for Tour Packages & Blog sections)
  displayCount?: number;
  featuredOnly?: boolean;
  category?: string;
  sortBy?: string;
  layoutStyle?: string;
  // Gallery-specific settings
  showFilters?: boolean;
  enableLightbox?: boolean;
  // Header-specific settings
  showWhatsApp?: boolean;
  showEmail?: boolean;
  showLanguageSwitcher?: boolean;
  // Animation settings (for Carousel & other animated layouts)
  enableAutoSlide?: boolean;
  autoSlideInterval?: number;
  transitionEffect?: string;
  animationSpeed?: string;
  updatedAt?: string;
}

interface SectionEditorProps {
  sectionId: string; // This can be either sectionId ('hero') or database id
  onSave: (data: any) => void;
  onCancel: () => void;
}

const SectionEditor = ({ sectionId, onSave, onCancel }: SectionEditorProps) => {
  const [content, setContent] = useState<SectionContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [showPreview, setShowPreview] = useState(true);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [uploading, setUploading] = useState<{[key: string]: boolean}>({});
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [hideDestEditor, setHideDestEditor] = useState<boolean>(false);
  const [hideSidebar, setHideSidebar] = useState<boolean>(false);
  const [hideFeatures, setHideFeatures] = useState<boolean>(false);
  const [hideStats, setHideStats] = useState<boolean>(false);
  const [hidePackages, setHidePackages] = useState<boolean>(false);
  const [hideTestimonials, setHideTestimonials] = useState<boolean>(false);
  const [hideBlog, setHideBlog] = useState<boolean>(false);
  const [hideGallery, setHideGallery] = useState<boolean>(false);
  // Local state for merging Why Choose Us into Who Am I editor
  const [whyContent, setWhyContent] = useState<SectionContent | null>(null);
  const [hideWhyBasic, setHideWhyBasic] = useState<boolean>(false);
  const [hideWhyFeatures, setHideWhyFeatures] = useState<boolean>(false);
  const [hideWhySummary, setHideWhySummary] = useState<boolean>(false);

  // Media Manager state
  const [showMediaManager, setShowMediaManager] = useState(false);
  const [currentMediaField, setCurrentMediaField] = useState<string>('');
  const [mediaManagerMode, setMediaManagerMode] = useState<'select' | 'selectMultiple' | 'manage'>('select');

  // Upload feedback state
  const [uploadStatus, setUploadStatus] = useState<{[key: string]: 'idle' | 'uploading' | 'success' | 'error'}>({});
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

  const setUploadingState = (key: string, value: boolean) => {
    setUploading(prev => ({ ...prev, [key]: value }));
  };
  const isAnyUploading = Object.values(uploading).some(Boolean);

  useEffect(() => {
    fetchSectionContent();
    if (sectionId === 'whoAmI') {
      fetchWhyChooseUsContent();
    }
  }, [sectionId]);

  const fetchSectionContent = async () => {
    setLoading(true);
    try {
      // Selalu pakai sectionId yang human-readable (hero, whoAmI, dst.)
      const response = await fetch(`/api/sections?section=${sectionId}`);
      const data = await response.json();

      if (data.success) {
        const incoming = data.data as any;
        // normalize arrays so editor & preview muncul meski kosong
        if (sectionId === 'exclusiveDestinations') {
          if (!Array.isArray(incoming.destinations)) incoming.destinations = [];
        }
        if (sectionId === 'whoAmI') {
          if (!Array.isArray(incoming.features)) incoming.features = [];
          if (!Array.isArray(incoming.stats)) incoming.stats = [];
        }
        if (sectionId === 'hero') {
          if (!Array.isArray(incoming.destinations)) incoming.destinations = [];
        }
        setContent(incoming);
      } else {
        console.error('Section not found:', data.message);
      }
    } catch (error) {
      console.error('Error fetching section content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWhyChooseUsContent = async () => {
    try {
      const response = await fetch(`/api/sections?section=whyChooseUs`);
      const data = await response.json();
      if (data.success) {
        setWhyContent(data.data);
      }
    } catch (err) {
      console.error('Error fetching whyChooseUs content:', err);
    }
  };

  const validateForm = () => {
    if (!content) return false;

    const newErrors: {[key: string]: string} = {};

    // Basic field validation (skip title requirement for hero)
    if (sectionId !== 'hero') {
      if (!content.title?.trim()) {
        newErrors.title = 'Title is required';
      }
    }

    // Section-specific validation
    if (sectionId === 'hero') {
      if (!content.destinations || content.destinations.length === 0) {
        newErrors.destinations = 'At least one destination is required';
      } else {
        content.destinations.forEach((dest: any, index: number) => {
          if (!dest.name?.trim()) {
            newErrors[`destinations.${index}.name`] = 'Destination name is required';
          }
          if (!dest.description?.trim()) {
            newErrors[`destinations.${index}.description`] = 'Destination description is required';
          }
        });
      }
    }

    // Log validation errors for debugging
    if (Object.keys(newErrors).length > 0) {
      console.error('❌ Validation Errors:', newErrors);
    }

    if (sectionId === 'testimonials') {
      if (content.testimonials && content.testimonials.length > 0) {
        content.testimonials.forEach((testimonial: any, index: number) => {
          if (!testimonial.name?.trim()) {
            newErrors[`testimonials.${index}.name`] = 'Customer name is required';
          }
          if (!testimonial.content?.trim()) {
            newErrors[`testimonials.${index}.content`] = 'Testimonial content is required';
          }
        });
      }
    }

    if (sectionId === 'tourPackages') {
      if (content.packages && content.packages.length > 0) {
        content.packages.forEach((pkg: any, index: number) => {
          if (!pkg.title?.trim()) {
            newErrors[`packages.${index}.title`] = 'Package title is required';
          }
          if (!pkg.description?.trim()) {
            newErrors[`packages.${index}.description`] = 'Package description is required';
          }
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!content || !validateForm()) {
      alert('Please fix the errors before saving');
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: content.sectionId || sectionId, // Use content.sectionId if available, otherwise use original sectionId
          data: content
        }),
      });

      if (response.ok) {
        // If editing WhoAmI, also persist WhyChooseUs together
        if (sectionId === 'whoAmI' && whyContent) {
          await fetch('/api/sections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ section: 'whyChooseUs', data: whyContent })
          });
        }
        onSave(content);
        alert('Section content saved successfully!');
        setErrors({});
      } else {
        const errorData = await response.json();
        alert(`Failed to save section content: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving section content:', error);
      alert('Failed to save section content!');
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (field: string, value: any) => {
    if (!content) return;
    setContent({
      ...content,
      [field]: value
    });
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const updateArrayItem = (field: string, index: number, itemField: string, value: any) => {
    if (!content || !content[field as keyof SectionContent]) return;
    
    const array = [...(content[field as keyof SectionContent] as any[])];
    const currentItem = { ...(array[index] || {}) };

    if (itemField.includes('.')) {
      const parts = itemField.split('.');
      let cursor: any = currentItem;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        if (typeof cursor[key] !== 'object' || cursor[key] === null) {
          cursor[key] = {};
        }
        cursor = cursor[key];
      }
      cursor[parts[parts.length - 1]] = value;
    } else {
      (currentItem as any)[itemField] = value;
    }

    array[index] = currentItem;
    
    setContent({
      ...content,
      [field]: array
    });

    // Clear error when field is updated
    const errorKey = `${field}.${index}.${itemField}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // Media Manager handlers
  const handleMediaSelect = (url: string) => {
    console.log('🎯 SectionEditor: Media selected:', { currentMediaField, url });
    if (currentMediaField) {
      if (currentMediaField.startsWith('why.')) {
        const whyField = currentMediaField.replace('why.', '');
        updateWhyField(whyField, url);
      } else if (currentMediaField.includes('.')) {
        // Handle array field format like "destinations.0.media"
        const parts = currentMediaField.split('.');
        if (parts.length === 3) {
          const field = parts[0];
          const index = parseInt(parts[1]);
          const itemField = parts[2];
          updateArrayItem(field, index, itemField, url);
        } else {
          updateContent(currentMediaField, url);
        }
      } else {
        updateContent(currentMediaField, url);
      }
    }
    setShowMediaManager(false);
    setCurrentMediaField('');
  };

  // Why Choose Us updaters (for unified editor)
  const updateWhyField = (field: string, value: any) => {
    if (!whyContent) return;
    setWhyContent({
      ...whyContent,
      [field]: value
    });
  };

  const updateWhyArrayItem = (field: string, index: number, itemField: string, value: any) => {
    if (!whyContent || !(whyContent as any)[field]) return;
    const array = [...((whyContent as any)[field] as any[])];
    const currentItem = { ...(array[index] || {}) };
    if (itemField.includes('.')) {
      const parts = itemField.split('.');
      let cursor: any = currentItem;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        if (typeof cursor[key] !== 'object' || cursor[key] === null) {
          cursor[key] = {};
        }
        cursor = cursor[key];
      }
      cursor[parts[parts.length - 1]] = value;
    } else {
      (currentItem as any)[itemField] = value;
    }
    array[index] = currentItem;
    setWhyContent({
      ...whyContent,
      [field]: array
    });
  };

  const addWhyArrayItem = (field: string, newItem: any) => {
    if (!whyContent) return;
    const currentArray = ((whyContent as any)[field] as any[]) || [];
    setWhyContent({
      ...whyContent,
      [field]: [...currentArray, newItem]
    });
  };

  const removeWhyArrayItem = (field: string, index: number) => {
    if (!whyContent || !(whyContent as any)[field]) return;
    const array = [...((whyContent as any)[field] as any[])];
    array.splice(index, 1);
    setWhyContent({
      ...whyContent,
      [field]: array
    });
  };

  // Hero editable callbacks
  const handleDestinationsChange = (next: any[]) => {
    updateContent('destinations', next);
  };

  const handleAddSpot = (pos: { x: number; y: number }) => {
    if (!content) return;
    const current = (content.destinations as any[]) || [];
    const newSpot = {
      id: `spot-${Date.now()}`,
      name: 'New Spot',
      description: 'Describe this destination...',
      position: { x: Number(pos.x.toFixed(2)), y: Number(pos.y.toFixed(2)) },
      media: ''
    } as any;
    const next = [...current, newSpot];
    updateContent('destinations', next);
    setSelectedIndex(next.length - 1);
  };

  const handleDeleteSpot = (id: string) => {
    if (!content) return;
    const current = (content.destinations as any[]) || [];
    let idx = current.findIndex((d: any) => d.id === id);
    if (idx === -1) {
      const parsed = Number(id);
      if (!Number.isNaN(parsed) && parsed >= 0 && parsed < current.length) {
        idx = parsed;
      }
    }
    if (idx >= 0) {
      const next = [...current];
      next.splice(idx, 1);
      updateContent('destinations', next);
    }
  };

  const addArrayItem = (field: string, newItem: any) => {
    if (!content) return;
    
    const currentArray = content[field as keyof SectionContent] as any[] || [];
    setContent({
      ...content,
      [field]: [...currentArray, newItem]
    });
  };

  const removeArrayItem = (field: string, index: number) => {
    if (!content || !content[field as keyof SectionContent]) return;
    
    const array = [...(content[field as keyof SectionContent] as any[])];
    array.splice(index, 1);
    
    setContent({
      ...content,
      [field]: array
    });
  };

  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'header': return Settings;
      case 'hero': return MapPin;
      case 'whoAmI': return Users;
      case 'whyChooseUs': return Award;
      case 'exclusiveDestinations': return MapPin;
      case 'tourPackages': return Package;
      case 'testimonials': return MessageSquare;
      case 'blog': return BookOpen;
      case 'gallery': return Camera;
      default: return Edit;
    }
  };

  const renderField = (field: string, label: string, type: 'text' | 'textarea' | 'rich-text' | 'url' = 'text', required: boolean = false) => {
    if (!content) return null;

    const value = content[field as keyof SectionContent] || '';
    const error = errors[field];

    return (
      <div className="elementor-control mb-4">
        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
          {label}
          {required && <span className="text-orange-500 ml-1">*</span>}
        </label>
        {type === 'rich-text' ? (
          <div>
            <Editor
              value={value as string}
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              licenseKey="gpl"
              onEditorChange={(content) => updateContent(field, content)}
              init={{
                height: 200,
                menubar: false,
                skin: 'oxide-dark',
                content_css: 'dark',
                skin_url: '/tinymce/skins/ui/oxide-dark',
                content_css_cors: true,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                  'anchor', 'searchreplace', 'visualblocks', 'code',
                  'insertdatetime', 'media', 'table', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist',
                content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; color: #e0e0e0; background: #2c2d30; }',
                placeholder: `Enter ${label.toLowerCase()}...`
              }}
            />
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
          </div>
        ) : type === 'textarea' ? (
          <div>
            <textarea
              value={value as string}
              onChange={(e) => updateContent(field, e.target.value)}
              rows={3}
              placeholder={`Enter ${label.toLowerCase()}...`}
              className={`w-full px-3 py-2 bg-[#2c2d30] border rounded-lg text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-vertical ${
                error ? 'border-red-500' : 'border-gray-700'
              }`}
            />
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
          </div>
        ) : (
          <div>
            <input
              type={type}
              value={value as string}
              onChange={(e) => updateContent(field, e.target.value)}
              placeholder={`Enter ${label.toLowerCase()}...`}
              className={`w-full px-3 py-2 bg-[#2c2d30] border rounded-lg text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                error ? 'border-red-500' : 'border-gray-700'
              }`}
            />
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
          </div>
        )}
      </div>
    );
  };

  // Renderers khusus untuk Why Choose Us (disunting dari Who Am I editor)
  const renderWhyField = (field: string, label: string, type: 'text' | 'textarea' | 'rich-text' | 'url' = 'text', required: boolean = false) => {
    if (!whyContent) return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-2">{label}</label>
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );

    const value = (whyContent as any)[field] || '';

    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {type === 'rich-text' ? (
          <div>
            <Editor
              value={value as string}
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              licenseKey="gpl"
              onEditorChange={(val) => updateWhyField(field, val)}
              init={{
                height: 300,
                menubar: false,
                skin_url: '/tinymce/skins/ui/oxide',
                content_css: '/tinymce/skins/content/default/content.min.css',
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                  'bold italic forecolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | help',
                content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; }',
                placeholder: `Enter ${label.toLowerCase()} here...`
              }}
            />
          </div>
        ) : type === 'textarea' ? (
          <div>
            <textarea
              value={value as string}
              onChange={(e) => updateWhyField(field, e.target.value)}
              rows={4}
              placeholder={`Enter ${label.toLowerCase()} here...`}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical text-gray-900 placeholder:text-gray-400 border-gray-300`}
            />
          </div>
        ) : (
          <div>
            <input
              type={type}
              value={value as string}
              onChange={(e) => updateWhyField(field, e.target.value)}
              placeholder={`Enter ${label.toLowerCase()} here...`}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 border-gray-300`}
            />
          </div>
        )}
      </div>
    );
  };

  const renderWhyUploadField = (
    targetField: string,
    label: string,
    accept: string
  ) => {
    if (!whyContent) return null;
    const value = (whyContent as any)[targetField] || '';
    const key = `why.${targetField}`;

    const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        setUploadingState(key, true);
        setUploadStatus(prev => ({ ...prev, [key]: 'uploading' }));

        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const current = prev[key] || 0;
            if (current >= 90) {
              clearInterval(progressInterval);
              return { ...prev, [key]: 90 };
            }
            return { ...prev, [key]: current + 10 };
          });
        }, 100);

        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const json = await res.json();

        clearInterval(progressInterval);

        if (json.success && json.url) {
          setUploadStatus(prev => ({ ...prev, [key]: 'success' }));
          setUploadProgress(prev => ({ ...prev, [key]: 100 }));
          updateWhyField(targetField, json.url);

          // Auto reset after success
          setTimeout(() => {
            setUploadStatus(prev => ({ ...prev, [key]: 'idle' }));
            setUploadProgress(prev => ({ ...prev, [key]: 0 }));
          }, 2000);
        } else {
          setUploadStatus(prev => ({ ...prev, [key]: 'error' }));
          setTimeout(() => {
            setUploadStatus(prev => ({ ...prev, [key]: 'idle' }));
          }, 3000);
          alert(`Upload failed: ${json.message || 'Unknown error'}`);
        }
      } catch (err) {
        setUploadStatus(prev => ({ ...prev, [key]: 'error' }));
        setTimeout(() => {
          setUploadStatus(prev => ({ ...prev, [key]: 'idle' }));
        }, 3000);
        alert('Upload error: Network or server issue');
      } finally {
        setUploadingState(key, false);
      }
    };

    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-2">{label}</label>

        {/* Browse Library Button (Priority 1) */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => {
              setCurrentMediaField(`why.${targetField}`);
              setMediaManagerMode('select');
              setShowMediaManager(true);
            }}
            className="flex-1 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-orange-600"
          >
            <Image className="w-4 h-4" />
            <span className="text-sm font-medium">Browse Library</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-gray-500">OR</span>
          </div>
        </div>

        {/* Upload Button (Priority 2) */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept={accept}
              onChange={onChange}
              className="text-sm"
              disabled={uploading[key]}
            />
            {value && (
              <span className="text-xs text-gray-600 truncate max-w-[50%]">{value}</span>
            )}
          </div>

          {/* Upload Progress */}
          {uploading[key] && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress[key] || 0}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500">
                {uploadProgress[key] || 0}% uploaded
              </div>
            </div>
          )}

          {/* Upload Status Feedback */}
          {uploadStatus[key] === 'success' && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Upload successful!</span>
            </div>
          )}

          {uploadStatus[key] === 'error' && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Upload failed! Please try again.</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWhyArrayField = (field: string, label: string, fields: { name: string; label: string; type?: string; required?: boolean }[], showHeader: boolean = true) => {
    if (!whyContent || !(whyContent as any)[field]) return null;

    const rawArray = (whyContent as any)[field];
    const array = Array.isArray(rawArray) ? rawArray : [];

    if (array.length === 0) return null;

    return (
      <div className="mb-8">
        {showHeader && (
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
            <button
              onClick={() => addWhyArrayItem(field, fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {}))}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm transition-colors"
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              Add New Item
            </button>
          </div>
        )}

        <div className="space-y-6">
          {array.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700 bg-white px-2 py-1 rounded">
                    Item {index + 1}
                  </span>
                </div>
                <button
                  onClick={() => removeWhyArrayItem(field, index)}
                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((fieldConfig) => {
                  const getValue = () => {
                    if (fieldConfig.name.includes('.')) {
                      const parts = fieldConfig.name.split('.');
                      let cursor: any = item;
                      for (let i = 0; i < parts.length; i++) {
                        cursor = cursor ? cursor[parts[i]] : undefined;
                      }
                      return cursor ?? '';
                    }
                    return item[fieldConfig.name] ?? '';
                  };
                  return (
                    <div key={fieldConfig.name}>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        {fieldConfig.label}
                        {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {fieldConfig.type === 'textarea' ? (
                        <div>
                          <textarea
                            value={getValue()}
                            onChange={(e) => updateWhyArrayItem(field, index, fieldConfig.name, e.target.value)}
                            rows={3}
                            placeholder={`Enter ${fieldConfig.label.toLowerCase()} here...`}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical text-sm text-gray-900 placeholder:text-gray-400 border-gray-300`}
                          />
                        </div>
                      ) : (
                        <div>
                          <input
                            type={fieldConfig.type || 'text'}
                            value={getValue()}
                            onChange={(e) => updateWhyArrayItem(field, index, fieldConfig.name, e.target.value)}
                            placeholder={`Enter ${fieldConfig.label.toLowerCase()} here...`}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400 border-gray-300`}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderUploadField = (
    targetField: string,
    label: string,
    accept: string
  ) => {
    if (!content) return null;
    const value = (content as any)[targetField] || '';
    const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        setUploadingState(targetField, true);
        setUploadStatus(prev => ({ ...prev, [targetField]: 'uploading' }));

        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const current = prev[targetField] || 0;
            if (current >= 90) {
              clearInterval(progressInterval);
              return { ...prev, [targetField]: 90 };
            }
            return { ...prev, [targetField]: current + 10 };
          });
        }, 100);

        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const json = await res.json();

        clearInterval(progressInterval);

        if (json.success && json.url) {
          setUploadStatus(prev => ({ ...prev, [targetField]: 'success' }));
          setUploadProgress(prev => ({ ...prev, [targetField]: 100 }));
          updateContent(targetField, json.url);

          // Auto reset after success
          setTimeout(() => {
            setUploadStatus(prev => ({ ...prev, [targetField]: 'idle' }));
            setUploadProgress(prev => ({ ...prev, [targetField]: 0 }));
          }, 2000);
        } else {
          setUploadStatus(prev => ({ ...prev, [targetField]: 'error' }));
          setTimeout(() => {
            setUploadStatus(prev => ({ ...prev, [targetField]: 'idle' }));
          }, 3000);
          alert(`Upload failed: ${json.message || 'Unknown error'}`);
        }
      } catch (err) {
        setUploadStatus(prev => ({ ...prev, [targetField]: 'error' }));
        setTimeout(() => {
          setUploadStatus(prev => ({ ...prev, [targetField]: 'idle' }));
        }, 3000);
        alert('Upload error: Network or server issue');
      } finally {
        setUploadingState(targetField, false);
      }
    };

    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-2">{label}</label>

        {/* Browse Library Button (Priority 1) */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => {
              setCurrentMediaField(targetField);
              setMediaManagerMode('select');
              setShowMediaManager(true);
            }}
            className="flex-1 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-orange-600"
          >
            <Image className="w-4 h-4" />
            <span className="text-sm font-medium">Browse Library</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-gray-500">OR</span>
          </div>
        </div>

        {/* Upload Button (Priority 2) */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept={accept}
              onChange={onChange}
              className="text-sm"
              disabled={uploading[targetField]}
            />
            {value && (
              <span className="text-xs text-gray-600 truncate max-w-[50%]">{value}</span>
            )}
          </div>

          {/* Upload Progress */}
          {uploading[targetField] && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress[targetField] || 0}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500">
                {uploadProgress[targetField] || 0}% uploaded
              </div>
            </div>
          )}

          {/* Upload Status Feedback */}
          {uploadStatus[targetField] === 'success' && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Upload successful!</span>
            </div>
          )}

          {uploadStatus[targetField] === 'error' && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Upload failed! Please try again.</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderArrayUploadField = (
    field: string,
    index: number,
    targetField: string,
    label: string,
    accept: string
  ) => {
    if (!content) return null;
    const item: any = (content as any)[field]?.[index] || {};
    const value = item[targetField] || '';
    const key = `${field}.${index}.${targetField}`;

    const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        setUploadingState(key, true);
        setUploadStatus(prev => ({ ...prev, [key]: 'uploading' }));

        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const current = prev[key] || 0;
            if (current >= 90) {
              clearInterval(progressInterval);
              return { ...prev, [key]: 90 };
            }
            return { ...prev, [key]: current + 10 };
          });
        }, 100);

        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const json = await res.json();

        clearInterval(progressInterval);

        if (json.success && json.url) {
          setUploadStatus(prev => ({ ...prev, [key]: 'success' }));
          setUploadProgress(prev => ({ ...prev, [key]: 100 }));
          updateArrayItem(field, index, targetField, json.url);

          // Auto reset after success
          setTimeout(() => {
            setUploadStatus(prev => ({ ...prev, [key]: 'idle' }));
            setUploadProgress(prev => ({ ...prev, [key]: 0 }));
          }, 2000);
        } else {
          setUploadStatus(prev => ({ ...prev, [key]: 'error' }));
          setTimeout(() => {
            setUploadStatus(prev => ({ ...prev, [key]: 'idle' }));
          }, 3000);
          alert(`Upload failed: ${json.message || 'Unknown error'}`);
        }
      } catch (err) {
        setUploadStatus(prev => ({ ...prev, [key]: 'error' }));
        setTimeout(() => {
          setUploadStatus(prev => ({ ...prev, [key]: 'idle' }));
        }, 3000);
        alert('Upload error: Network or server issue');
      } finally {
        setUploadingState(key, false);
      }
    };

    return (
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-900 mb-2">{label}</label>

        {/* Browse Library Button (Priority 1) */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => {
              setCurrentMediaField(`${field}.${index}.${targetField}`);
              setMediaManagerMode('select');
              setShowMediaManager(true);
            }}
            className="flex-1 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-orange-600"
          >
            <Image className="w-4 h-4" />
            <span className="text-sm font-medium">Browse Library</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-gray-500">OR</span>
          </div>
        </div>

        {/* Upload Button (Priority 2) */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept={accept}
              onChange={onChange}
              className="text-sm"
              disabled={uploading[key]}
            />
            {value && (
              <span className="text-xs text-gray-600 truncate max-w-[50%]">{value}</span>
            )}
          </div>

          {/* Upload Progress */}
          {uploading[key] && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress[key] || 0}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500">
                {uploadProgress[key] || 0}% uploaded
              </div>
            </div>
          )}

          {/* Upload Status Feedback */}
          {uploadStatus[key] === 'success' && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Upload successful!</span>
            </div>
          )}

          {uploadStatus[key] === 'error' && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Upload failed! Please try again.</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderArrayField = (field: string, label: string, fields: { name: string; label: string; type?: string; required?: boolean; placeholder?: string }[], showHeader: boolean = true, defaultValues: any = {}) => {
    if (!content) return null;

    const rawArray = content[field as keyof SectionContent];
    const array = Array.isArray(rawArray) ? rawArray : [];

    // Always show the form, even if array is empty

    return (
      <div className="mb-8">
        {showHeader && (
          <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
          <button
            onClick={() => addArrayItem(field, { ...fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {}), ...defaultValues })}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm transition-colors"
          >
              <Plus className="w-4 h-4 mr-2 inline" />
              Add New Item
          </button>
        </div>
        )}
        
        <div className="space-y-6">
          {array.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No {field} yet. Click "Add New Item" to get started!</p>
            </div>
          ) : (
            array.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 bg-white px-2 py-1 rounded">
                      Item {index + 1}
                    </span>
                    {field === 'testimonials' && item.rating && (
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeArrayItem(field, index)}
                    className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((fieldConfig, fcIdx) => {
                  const errorKey = `${field}.${index}.${fieldConfig.name}`;
                  const error = errors[errorKey];
                  const getValue = () => {
                    if (fieldConfig.name.includes('.')) {
                      const parts = fieldConfig.name.split('.');
                      let cursor: any = item;
                      for (let i = 0; i < parts.length; i++) {
                        cursor = cursor ? cursor[parts[i]] : undefined;
                      }
                      return cursor ?? '';
                    }
                    return item[fieldConfig.name] ?? '';
                  };
                  return (
                  <div key={fieldConfig.name}>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                      {fieldConfig.label}
                        {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {fieldConfig.type === 'textarea' ? (
                        <div>
                      <textarea
                            value={getValue()}
                        onChange={(e) => updateArrayItem(field, index, fieldConfig.name, e.target.value)}
                            rows={3}
                            placeholder={`Enter ${fieldConfig.label.toLowerCase()} here...`}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical text-sm text-gray-900 placeholder:text-gray-400 ${
                              error ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                        </div>
                      ) : (
                        <div>
                      <input
                        type={fieldConfig.type || 'text'}
                            value={getValue()}
                        onChange={(e) => updateArrayItem(field, index, fieldConfig.name, e.target.value)}
                            placeholder={`Enter ${fieldConfig.label.toLowerCase()} here...`}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400 ${
                              error ? 'border-red-500' : 'border-gray-300'
                            }`}
                      />
                          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                        </div>
                    )}
                      {(fieldConfig.name === 'media' || fieldConfig.name === 'image') && (
                        <div className="mt-2">
                          {fieldConfig.name === 'media'
                            ? renderArrayUploadField(field, index, 'media', 'Upload Media (Image/MP4)', 'image/*,video/mp4')
                            : renderArrayUploadField(field, index, 'image', 'Upload Image', 'image/*')}
                  </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Preview for testimonials */}
              {field === 'testimonials' && item.name && item.content && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {(item.name || 'N').charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{item.name || 'Customer Name'}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600 text-sm">{item.role || 'Customer'}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{item.content || 'Testimonial content...'}</p>
                      {item.rating && (
                        <div className="flex items-center mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                ))}
              </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <span className="ml-3 text-gray-600">Loading section content...</span>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Section content not found</p>
      </div>
    );
  }

  const SectionIcon = getSectionIcon(sectionId);

  const renderPreview = () => {
    if (!content) return null;

    const hasCustomPreview = sectionId === 'header' || sectionId === 'hero' || sectionId === 'whoAmI' || sectionId === 'exclusiveDestinations' || sectionId === 'testimonials' || sectionId === 'blog' || sectionId === 'gallery';

  return (
      <LanguageProvider initialLanguage="id">
      <div className="space-y-8">
        {/* Hero Preview - render komponen asli */}
        {sectionId === 'hero' && (
          <div className="rounded-lg overflow-hidden ring-1 ring-gray-200">
            <HeroSection
              overrideContent={{
                title: content.title,
                subtitle: content.subtitle,
                description: content.description,
                backgroundVideo: content.backgroundVideo,
                destinations: content.destinations as any
              }}
              disableAuto
              editable
              onDestinationsChange={handleDestinationsChange}
              onAddSpot={handleAddSpot}
              onDeleteSpot={handleDeleteSpot}
              selectedIndex={selectedIndex}
              onSelectedIndexChange={setSelectedIndex}
            />
          </div>
        )}

        {/* Header Preview */}
        {sectionId === 'header' && (
          <div className="rounded-lg overflow-hidden ring-1 ring-gray-200">
            {/* Main Header Preview */}
            <div className="bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {content?.logo ? (
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r from-orange-600 to-blue-600">
                      <img 
                        src={content.logo} 
                        alt="Logo Preview" 
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r from-orange-600 to-blue-600">
                      <span className="font-bold text-xl text-white">B</span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                      {content?.title || 'Bromo Ijen'}
                    </span>
                    <span className="text-xs font-medium text-gray-500">
                      {content?.subtitle || 'Adventure Tour'}
                    </span>
                  </div>
                </div>
                
                {/* Language Selector Preview */}
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">🌍</span>
                  <select className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 border border-gray-200">
                    <option>🇮🇩 Indonesia</option>
                    <option>🇺🇸 English</option>
                    <option>🇩🇪 Deutsch</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WhoAmI Preview - render komponen asli */}
        {sectionId === 'whoAmI' && (
          <div className="rounded-lg overflow-hidden ring-1 ring-gray-200">
            <WhoAmISection
              overrideContent={{
                header: content.subtitle,
                mainTitle: content.title,
                description: content.description,
                image: (content as any).image,
                features: (content.features as any) || [],
                stats: (content.stats as any) || [],
                buttonText: (content as any).buttonText,
                ctaText: (content as any).ctaText,
                ctaLink: (content as any).ctaLink
              }}
              whyOverrideContent={whyContent ? {
                header: whyContent.subtitle,
                mainTitle: whyContent.title,
                description: whyContent.description,
                features: (whyContent.features as any) || [],
                image: (whyContent as any).image,
                buttonText: (whyContent as any).buttonText,
                ctaText: (whyContent as any).ctaText,
                ctaLink: (whyContent as any).ctaLink
              } : undefined}
              disableAuto
            />
          </div>
        )}

        {/* Exclusive Destinations Preview - render komponen asli */}
        {sectionId === 'exclusiveDestinations' && (
          <div className="rounded-lg overflow-hidden ring-1 ring-gray-200">
            <DestinasiEksklusifSection
              overrideContent={{
                title: content.title,
                subtitle: content.subtitle,
                description: content.description,
                destinations: (content.destinations as any) || [],
                categories: (content.categories as any) || []
              }}
            />
          </div>
        )}

        {/* Tour Packages Preview - render komponen asli */}
        {sectionId === 'tourPackages' && (
          <div className="rounded-lg overflow-hidden ring-1 ring-gray-200">
            <TourPackagesSection
              overrideContent={{
                title: content.title,
                subtitle: content.subtitle,
                description: content.description,
                displayCount: content.displayCount,
                featuredOnly: content.featuredOnly,
                category: content.category,
                sortBy: content.sortBy
              }}
              publishedOnly={true}
            />
          </div>
        )}

        {/* Blog Preview - render komponen asli */}
        {sectionId === 'blog' && (
          <div className="rounded-lg overflow-hidden ring-1 ring-gray-200">
            <BlogSection
              overrideContent={{
                title: content.title,
                subtitle: content.subtitle,
                description: content.description,
                posts: (content.posts as any) || [],
                layoutStyle: content.layoutStyle,
                displayCount: content.displayCount,
                featuredOnly: content.featuredOnly,
                sortBy: content.sortBy
              }}
            />
          </div>
        )}

        {/* Testimonials Preview - render komponen asli */}
        {sectionId === 'testimonials' && (
          <div className="rounded-lg overflow-hidden ring-1 ring-gray-200">
            <TestimonialSection
              overrideContent={{
                title: content.title,
                subtitle: content.subtitle,
                description: content.description,
                displayCount: content.displayCount,
                featuredOnly: content.featuredOnly,
                sortBy: content.sortBy
              }}
            />
          </div>
        )}

        {/* Gallery Preview - render komponen asli */}
        {sectionId === 'gallery' && (
          <div className="space-y-4">
            {/* Layout Indicator */}
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white/80">Active Layout</p>
                    <p className="text-lg font-bold">
                      {content.layoutStyle === 'grid' 
                        ? '📐 Grid Layout (Equal Height)' 
                        : content.layoutStyle === 'carousel'
                        ? '🎠 Carousel Layout (Horizontal Slider)'
                        : content.layoutStyle === 'bento'
                        ? '🎨 Bento Layout (Modern Asymmetric)'
                        : '🧱 Masonry Layout (Pinterest Style)'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/80">Display Settings</p>
                  <p className="text-sm font-semibold">
                    {content.displayCount || 12} items • {content.category || 'All'} • {content.sortBy || 'Newest'}
                  </p>
                </div>
              </div>
            </div>

            {/* Gallery Component */}
            <div className="rounded-lg overflow-hidden ring-1 ring-gray-200">
              <GallerySection
                overrideContent={{
                  title: content.title,
                  subtitle: content.subtitle,
                  description: content.description,
                  ctaText: content.ctaText,
                  ctaLink: content.ctaLink,
                  layoutStyle: content.layoutStyle,
                  displayCount: content.displayCount,
                  category: content.category,
                  sortBy: content.sortBy,
                  showFilters: content.showFilters,
                  enableLightbox: content.enableLightbox,
                  enableAutoSlide: content.enableAutoSlide,
                  autoSlideInterval: content.autoSlideInterval,
                  transitionEffect: content.transitionEffect,
                  animationSpeed: content.animationSpeed
                }}
              />
            </div>
          </div>
        )}

        {/* Old Testimonial Preview (remove this) */}
        {/* {false && sectionId === 'testimonials' && content?.testimonials && Array.isArray(content.testimonials) && content.testimonials.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Testimonials Preview</h3>
            {content.testimonials.map((testimonial: any, idx: number) => (
              <div key={idx} className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {(testimonial.name || 'N').charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{testimonial.name || 'Customer Name'}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-600 text-sm">{testimonial.role || 'Customer'}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{testimonial.content || 'Testimonial content...'}</p>
                    {testimonial.rating && (
                      <div className="flex items-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )} */}

        {/* Generic Preview */}
        {!hasCustomPreview && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {content.title || `${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)} Section`}
            </h3>
            {content.subtitle && <p className="text-gray-600 mb-2">{content.subtitle}</p>}
            {content.description && <p className="text-gray-700">{content.description}</p>}
          </div>
        )}
      </div>
      </LanguageProvider>
    );
  };

  return (
    <div className="elementor-wrapper fixed inset-0 z-50 flex flex-col bg-[#0a0e14] overflow-hidden">
      {/* Top Toolbar - Elementor Style */}
      <div className="elementor-topbar flex items-center justify-between border-b border-gray-800 bg-[#1c1d1f] px-4 py-2.5 shadow-lg">
        {/* Left: Logo & Section Info */}
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2c2d30] text-gray-400 transition hover:bg-[#3c3d40] hover:text-white"
            title="Back to Dashboard"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3 border-l border-gray-700 pl-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-pink-500">
              <SectionIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Editing Section</div>
              <div className="text-sm font-semibold text-white">
                {sectionId.replace(/([A-Z])/g, ' $1').trim()}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Device Preview Switcher */}
        <div className="flex items-center gap-1 rounded-lg bg-[#2c2d30] p-1">
          <button className="flex h-8 items-center gap-2 rounded px-3 bg-[#93003c] text-white text-xs font-medium">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Desktop
          </button>
          <button className="flex h-8 items-center gap-2 rounded px-3 text-gray-400 text-xs font-medium hover:bg-[#3c3d40] hover:text-white transition" disabled>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Mobile
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-medium transition ${
              showPreview
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-[#2c2d30] text-gray-400 hover:bg-[#3c3d40] hover:text-white'
            }`}
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          
          <div className="w-px h-6 bg-gray-700 mx-1"></div>
          
          <button
            onClick={() => {
              const next = !hideSidebar;
              setHideSidebar(next);
              if (next) setShowPreview(true);
            }}
            className="flex h-9 items-center gap-2 rounded-lg bg-[#2c2d30] px-4 text-xs font-medium text-gray-400 transition hover:bg-[#3c3d40] hover:text-white"
          >
            <Settings className="h-4 w-4" />
            {hideSidebar ? 'Show' : 'Hide'} Panel
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving || isAnyUploading}
            className="flex h-9 items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-6 text-xs font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:from-orange-400 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : isAnyUploading ? 'Uploading...' : 'Update'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="elementor-main flex flex-1 overflow-hidden">
        {/* Left Panel - Elementor Style */}
        {!hideSidebar && (
          <div className="elementor-panel flex w-[420px] flex-col border-r border-gray-800 bg-[#1c1d1f]">
            {/* Panel Header with Tabs */}
            <div className="elementor-panel-header border-b border-gray-800">
              <div className="flex">
                {['content', 'style', 'advanced'].map((tabKey) => (
                  <button
                    key={tabKey}
                    type="button"
                    onClick={() => setActiveTab(tabKey)}
                    className={`flex-1 px-4 py-3 text-xs font-medium uppercase tracking-wider transition ${
                      activeTab === tabKey
                        ? 'bg-[#2c2d30] text-white border-b-2 border-orange-500'
                        : 'text-gray-400 hover:text-white hover:bg-[#25262a]'
                    }`}
                  >
                    {tabKey === 'content' ? (
                      <span className="flex items-center gap-2 justify-center">
                        <Edit className="h-3.5 w-3.5" />
                        Content
                      </span>
                    ) : tabKey === 'style' ? (
                      <span className="flex items-center gap-2 justify-center">
                        <Settings className="h-3.5 w-3.5" />
                        Style
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 justify-center">
                        <Code className="h-3.5 w-3.5" />
                        Advanced
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Panel Content - Scrollable */}
            <div className="elementor-panel-content flex-1 overflow-y-auto">
              {activeTab === 'content' ? (
                <div className="space-y-1">
                  {/* Upload Status */}
                  {isAnyUploading && (
                    <div className="mx-4 mt-4 bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading file...</span>
                    </div>
                  )}

                  {/* Collapsible Section: Basic Information */}
                  <div className="elementor-control-section border-b border-gray-800">
                    <button
                      type="button"
                      onClick={() => setHideSidebar(!hideSidebar)}
                      className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-[#25262a] transition"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                        📝 Basic Information
                      </span>
                      <svg
                        className={`h-4 w-4 text-gray-400 transition-transform ${hideSidebar ? '' : 'rotate-180'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {!hideSidebar && (
                      <div className="px-5 py-4 space-y-3 bg-[#1a1b1e]">
                        {renderField('title', 'Title', 'text', true)}
                        {renderField('subtitle', 'Subtitle')}
                        {renderField('description', 'Description', 'rich-text')}
              {sectionId === 'hero' && (
                <div className="mt-4">
                  {renderField('backgroundVideo', 'Background Video URL', 'url')}
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">
                      💡 <strong>Tips:</strong> Upload video/image via Media Manager, then paste the URL here. 
                      Supported formats: MP4, WebM, OGG for videos; JPG, PNG, WebP for images.
                    </p>
                  </div>
                </div>
              )}
              {sectionId === 'header' && (
                <div className="mt-4 space-y-6">
                  {/* Logo Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Logo Settings</h4>
                    {renderUploadField('logo', 'Upload Logo', 'image/*')}
                    {content?.logo && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-900 mb-2">Logo Preview</label>
                        <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                          <img 
                            src={content.logo} 
                            alt="Logo Preview" 
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="w-full h-full flex items-center justify-center text-gray-500">
                                    <div class="text-center">
                                      <svg class="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
                                      </svg>
                                      <div class="text-sm">Logo failed to load</div>
                                    </div>
                                  </div>
                                `;
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">
                        💡 <strong>Tips:</strong> Upload logo via Media Manager. Recommended size: 200x200px or higher. Supported formats: PNG, JPG, SVG.
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-blue-900">Header Settings Moved</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Header configuration (WhatsApp, Email, Language, Title) has been moved to the <strong>Navigation Manager</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {sectionId === 'whoAmI' && (
                <div className="mt-2">
                  {renderField('buttonText', 'Button Text', 'text')}
                  <p className="text-xs text-gray-500 mt-1 mb-4">
                    💡 Text untuk button navigasi (e.g., "Tentang Saya", "About Me")
                  </p>
                  {renderField('ctaText', 'CTA Button Text', 'text')}
                  {renderField('ctaLink', 'CTA Button Link', 'url')}
                  <div className="mb-4"></div>
                  {renderUploadField('image', 'Upload Image', 'image/*')}
                  {content?.image && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-900 mb-2">Image Preview</label>
                      <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={content.image} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center text-gray-500">
                                  <div class="text-center">
                                    <svg class="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                      <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
                                    </svg>
                                    <div class="text-sm">Image failed to load</div>
                                  </div>
                                </div>
                              `;
                            }
                          }}
                        />
                      </div>
                        <p className="text-xs text-gray-500 mt-1">Current image: {content.image}</p>
                      </div>
                    )}
                  </div>
                )}
                      </div>
                    )}
                  </div>

                  {/* More Collapsible Sections - Old Style sections below, will be refactored later */}
                  {sectionId === 'hero' && (
              <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900">Destinations</h3>
                  <button
                    onClick={() => setHideDestEditor(!hideDestEditor)}
                    className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    {hideDestEditor ? 'Show Editor' : 'Hide Editor'}
                  </button>
                </div>
                {!hideDestEditor && (
                  <div>
                    {renderArrayField('destinations', '', [
                      { name: 'name', label: 'Name', required: true },
                      { name: 'description', label: 'Description', type: 'textarea', required: true },
                      { name: 'position.x', label: 'Position X' },
                      { name: 'position.y', label: 'Position Y' },
                      { name: 'media', label: 'Media URL', type: 'url' }
                    ], true, {
                      name: 'New Destination',
                      description: 'Description here...',
                      'position.x': 50,
                      'position.y': 50
                    })}
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800">
                        💡 <strong>Tips:</strong> 
                        <br />• Position X/Y: 0-100 (percentage from top-left corner)
                        <br />• Media URL: Optional image/video for each destination hotspot
                        <br />• Click "Preview" to see and drag hotspots on the hero background
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(sectionId === 'whoAmI' || sectionId === 'whyChooseUs') && (
              <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900">Features</h3>
                  <button onClick={() => setHideFeatures(!hideFeatures)} className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50">{hideFeatures ? 'Show' : 'Hide'}</button>
                </div>
                {!hideFeatures && renderArrayField('features', '', [
                  { name: 'icon', label: 'Icon Name' },
                  { name: 'title', label: 'Title', required: true },
                  { name: 'description', label: 'Description', type: 'textarea', required: true }
                ], true)}
              </div>
            )}

            {sectionId === 'exclusiveDestinations' && (
              <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900">Destinations</h3>
                  <button onClick={() => setHideDestEditor(!hideDestEditor)} className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50">{hideDestEditor ? 'Show' : 'Hide'}</button>
                </div>
                {!hideDestEditor && (
                  <div>
                    {renderArrayField('destinations', '', [
                      { name: 'name', label: 'Name', required: true },
                      { name: 'location', label: 'Location' },
                      { name: 'description', label: 'Description', type: 'textarea' },
                      { name: 'image', label: 'Image URL', type: 'url' },
                      { name: 'tours', label: 'Tours', type: 'number' },
                      { name: 'featured', label: 'Featured' }
                    ], true)}
                  </div>
                )}

                {/* Categories Editor */}
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900">Categories</h3>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Manage the filter categories displayed in this section.
                    </p>
                    {renderArrayField('categories', '', [
                      { name: 'id', label: 'ID (e.g., volcano)', required: true },
                      { name: 'label', label: 'Label (e.g., Volcanoes)', required: true }
                    ], true, { id: '', label: '' })}
                  </div>
                </div>
              </div>
            )}

            {sectionId === 'tourPackages' && (
              <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Display Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Featured Only</label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={content?.featuredOnly || false}
                        onChange={(e) => updateContent('featuredOnly', e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Show only featured packages
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Display Count</label>
                    <input
                      type="number"
                      value={content?.displayCount || 4}
                      onChange={(e) => updateContent('displayCount', parseInt(e.target.value) || 4)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 border-gray-300"
                      placeholder="Number of packages to display"
                      min="1"
                      max="10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Sort By</label>
                    <select
                      value={content?.sortBy || 'rating'}
                      onChange={(e) => updateContent('sortBy', e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 border-gray-300"
                    >
                      <option value="rating">Rating</option>
                      <option value="popular">Most Popular</option>
                      <option value="newest">Newest</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Category Filter</label>
                    <select
                      value={content?.category || 'all'}
                      onChange={(e) => updateContent('category', e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 border-gray-300"
                    >
                      <option value="all">All Categories</option>
                      <option value="adventure">Adventure</option>
                      <option value="culture">Culture</option>
                      <option value="nature">Nature</option>
                      <option value="beach">Beach</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {sectionId === 'whoAmI' && (
              <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900">Statistics</h3>
                  <button onClick={() => setHideStats(!hideStats)} className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50">{hideStats ? 'Show' : 'Hide'}</button>
                </div>
                {!hideStats && renderArrayField('stats', '', [
                  { name: 'value', label: 'Value', required: true },
                  { name: 'label', label: 'Label', required: true }
                ], true)}
              </div>
            )}

            {/* Why Choose Us merged editor (only when editing whoAmI) */}
            {sectionId === 'whoAmI' && (
              <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Why Choose Us (Merged)</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-800">Basic Information</h4>
                      <button onClick={() => setHideWhyBasic(!hideWhyBasic)} className="text-xs px-2 py-1 rounded-lg border border-gray-300 hover:bg-gray-50">{hideWhyBasic ? 'Show' : 'Hide'}</button>
                    </div>
                    {!hideWhyBasic && (
                      <div>
                        {renderWhyField('title', 'Title', 'text', true)}
                        {renderWhyField('subtitle', 'Subtitle')}
                        {renderWhyField('description', 'Description', 'rich-text')}
                        {renderWhyField('buttonText', 'Button Text', 'text')}
                        <p className="text-xs text-gray-500 mt-1 mb-4">
                          💡 Text untuk button navigasi (e.g., "Keunggulan", "Why Us")
                        </p>
                        {renderWhyField('ctaText', 'CTA Button Text', 'text')}
                        {renderWhyField('ctaLink', 'CTA Button Link', 'url')}
                        <div className="mb-4"></div>
                        {renderWhyUploadField('image', 'Upload Image', 'image/*')}
                        {whyContent?.image && (
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-900 mb-2">Why Choose Us Image Preview</label>
                            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                              <img 
                                src={whyContent.image} 
                                alt="Why Choose Us Preview" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `
                                      <div class="w-full h-full flex items-center justify-center text-gray-500">
                                        <div class="text-center">
                                          <svg class="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
                                          </svg>
                                          <div class="text-sm">Image failed to load</div>
                                        </div>
                                      </div>
                                    `;
                                  }
                                }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Current image: {whyContent.image}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-800">Features</h4>
                      <button onClick={() => setHideWhyFeatures(!hideWhyFeatures)} className="text-xs px-2 py-1 rounded-lg border border-gray-300 hover:bg-gray-50">{hideWhyFeatures ? 'Show' : 'Hide'}</button>
                    </div>
                    {!hideWhyFeatures && renderWhyArrayField('features', '', [
                      { name: 'icon', label: 'Icon Name' },
                      { name: 'title', label: 'Title', required: true },
                      { name: 'description', label: 'Description', type: 'textarea', required: true }
                    ], true)}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-800">Summary Stats</h4>
                      <button onClick={() => setHideWhySummary(!hideWhySummary)} className="text-xs px-2 py-1 rounded-lg border border-gray-300 hover:bg-gray-50">{hideWhySummary ? 'Show' : 'Hide'}</button>
                    </div>
                    {!hideWhySummary && renderWhyArrayField('summary', '', [
                      { name: 'value', label: 'Value', required: true },
                      { name: 'label', label: 'Label', required: true }
                    ], true)}
                  </div>
                </div>
              </div>
            )}

            {sectionId === 'tourPackages' && (
              <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900">Tour Packages</h3>
                  <button onClick={() => setHidePackages(!hidePackages)} className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50">{hidePackages ? 'Show' : 'Hide'}</button>
                </div>
                {!hidePackages && renderArrayField('packages', '', [
                  { name: 'title', label: 'Title', required: true },
          { name: 'duration', label: 'Duration' },
          { name: 'price', label: 'Price' },
          { name: 'rating', label: 'Rating' },
                  { name: 'description', label: 'Description', type: 'textarea', required: true },
          { name: 'image', label: 'Image URL', type: 'url' }
                ], false)}
              </div>
            )}

            {sectionId === 'testimonials' && (
              <>
                <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>ℹ️ Note:</strong> Testimonials are managed in the <strong>Testimonials</strong> tab. 
                      This section controls display settings for the homepage.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Display Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Number of Testimonials to Display</label>
                      <input
                        type="number"
                        value={content?.displayCount || 3}
                        onChange={(e) => updateContent('displayCount', parseInt(e.target.value) || 3)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 border-gray-300"
                        placeholder="e.g., 3"
                        min="1"
                        max="12"
                      />
                      <p className="text-xs text-gray-500 mt-1">How many testimonial cards to show on the landing page (1-12)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Show Featured Testimonials Only</label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={content?.featuredOnly || false}
                          onChange={(e) => updateContent('featuredOnly', e.target.checked)}
                          className="h-4 w-4 text-orange-600 focus:ring-2 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Only display featured testimonials
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Sort By</label>
                      <select
                        value={content?.sortBy || 'newest'}
                        onChange={(e) => updateContent('sortBy', e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 border-gray-300"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="rating">Highest Rating</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {sectionId === 'blog' && (
              <>
                <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>ℹ️ Note:</strong> Blog posts are managed in the <strong>Blogs</strong> tab. 
                      This section controls display settings for the homepage.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Display Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Number of Posts to Display</label>
                      <input
                        type="number"
                        value={content?.displayCount || 3}
                        onChange={(e) => updateContent('displayCount', parseInt(e.target.value) || 3)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 border-gray-300"
                        placeholder="e.g., 3"
                        min="1"
                        max="12"
                      />
                      <p className="text-xs text-gray-500 mt-1">How many blog cards to show on the landing page (1-12)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Show Featured Posts Only</label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={content?.featuredOnly || false}
                          onChange={(e) => updateContent('featuredOnly', e.target.checked)}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Only display featured blog posts
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Layout Style</label>
                      <select
                        value={content?.layoutStyle || 'grid'}
                        onChange={(e) => updateContent('layoutStyle', e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 border-gray-300"
                      >
                        <option value="grid">📰 Grid (3 columns)</option>
                        <option value="list">📋 List View (Vertical Cards)</option>
                        <option value="masonry">🧱 Masonry (Pinterest Style)</option>
                        <option value="featured">⭐ Featured (Hero + Grid)</option>
                        <option value="spotlight">🎯 Spotlight (Hero + List)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Choose how blog posts are displayed on homepage</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Sort By</label>
                      <select
                        value={content?.sortBy || 'newest'}
                        onChange={(e) => updateContent('sortBy', e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 border-gray-300"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="featured">Featured First</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {sectionId === 'gallery' && (
              <>
                <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>ℹ️ Note:</strong> Gallery items are managed in the <strong>Gallery</strong> tab. 
                      This section controls display settings for the homepage gallery.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Display Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Layout Style</label>
                      <select
                        value={content?.layoutStyle || 'masonry'}
                        onChange={(e) => updateContent('layoutStyle', e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 border-gray-300"
                      >
                        <option value="masonry">🧱 Masonry (Pinterest Style)</option>
                        <option value="grid">📐 Grid (Equal Height)</option>
                        <option value="carousel">🎠 Carousel (Horizontal Slider)</option>
                        <option value="bento">🎨 Bento (Modern Asymmetric)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Choose how gallery items are displayed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Number of Items to Display</label>
                      <input
                        type="number"
                        value={content?.displayCount || 12}
                        onChange={(e) => updateContent('displayCount', parseInt(e.target.value) || 12)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 border-gray-300"
                        placeholder="e.g., 12"
                        min="6"
                        max="24"
                      />
                      <p className="text-xs text-gray-500 mt-1">How many gallery items to show (6-24)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Default Category Filter</label>
                      <select
                        value={content?.category || 'all'}
                        onChange={(e) => updateContent('category', e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 border-gray-300"
                      >
                        <option value="all">All Categories</option>
                        <option value="bromo">Bromo</option>
                        <option value="ijen">Ijen</option>
                        <option value="culture">Culture</option>
                        <option value="nature">Nature</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Default filter when page loads</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Sort By</label>
                      <select
                        value={content?.sortBy || 'newest'}
                        onChange={(e) => updateContent('sortBy', e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 border-gray-300"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="popular">Most Popular (Views)</option>
                        <option value="liked">Most Liked</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Show Category Filters</label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={content?.showFilters !== false}
                          onChange={(e) => updateContent('showFilters', e.target.checked)}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Display category filter buttons
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Enable Lightbox</label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={content?.enableLightbox !== false}
                          onChange={(e) => updateContent('enableLightbox', e.target.checked)}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Allow clicking images to open full-screen view
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Animation Settings (For Carousel & Animated Layouts) */}
                <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">⚡ Animation Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Enable Auto-Slide (Carousel)</label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={content?.enableAutoSlide || false}
                          onChange={(e) => updateContent('enableAutoSlide', e.target.checked)}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Automatically slide through items in Carousel layout
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">💡 Only works for Carousel layout</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Auto-Slide Interval (seconds)</label>
                      <input
                        type="number"
                        value={content?.autoSlideInterval || 5}
                        onChange={(e) => updateContent('autoSlideInterval', parseInt(e.target.value) || 5)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 border-gray-300"
                        placeholder="5"
                        min="2"
                        max="10"
                        disabled={!content?.enableAutoSlide}
                      />
                      <p className="text-xs text-gray-500 mt-1">How long each slide stays visible (2-10 seconds)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Transition Effect</label>
                      <select
                        value={content?.transitionEffect || 'smooth'}
                        onChange={(e) => updateContent('transitionEffect', e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 border-gray-300"
                      >
                        <option value="smooth">🌊 Smooth (Ease-in-out)</option>
                        <option value="instant">⚡ Instant (Snap)</option>
                        <option value="slow">🐢 Slow (Ease)</option>
                        <option value="bounce">🎾 Bounce</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Animation easing curve for transitions</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Animation Speed</label>
                      <select
                        value={content?.animationSpeed || 'normal'}
                        onChange={(e) => updateContent('animationSpeed', e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 border-gray-300"
                      >
                        <option value="fast">🚀 Fast (300ms)</option>
                        <option value="normal">⏱️ Normal (500ms)</option>
                        <option value="slow">🕐 Slow (700ms)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Duration of hover/transition animations</p>
                    </div>

                    {/* Visual Preview */}
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">🎬</div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 mb-1">Animation Preview</p>
                          <p className="text-xs text-gray-700 leading-relaxed">
                            <strong>Auto-slide:</strong> {content?.enableAutoSlide ? '✅ Enabled' : '❌ Disabled'} 
                            {content?.enableAutoSlide && ` (${content?.autoSlideInterval || 5}s interval)`}
                            <br />
                            <strong>Effect:</strong> {content?.transitionEffect || 'smooth'}
                            <br />
                            <strong>Speed:</strong> {content?.animationSpeed || 'normal'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
              ) : activeTab === 'style' ? (
                <div className="px-5 py-12 text-center">
                  <Settings className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Style Controls</h3>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                    Pengaturan style lanjutan (spacing, colors, typography) akan segera hadir.
                  </p>
                </div>
              ) : (
                <div className="px-5 py-12 text-center">
                  <Code className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Advanced Settings</h3>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                    Fitur advanced seperti custom CSS dan conditional display akan tersedia pada update berikutnya.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview Canvas - Elementor Style */}
        <div className="elementor-preview flex-1 overflow-auto bg-[#e8eaed]">
          {showPreview ? (
            <div className="min-h-full w-full">
              {renderPreview()}
            </div>
          ) : (
            <div className="flex h-full min-h-full items-center justify-center p-12">
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-400 bg-white/50 backdrop-blur-sm p-16 text-center max-w-lg">
                <Eye className="h-20 w-20 text-gray-400 mb-6" />
                <p className="text-xl font-semibold text-gray-700 mb-2">Preview Disabled</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Enable <strong className="text-orange-500">Preview</strong> from the toolbar to see your changes in real-time.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Media Manager Modal */}
      <MediaManager
        isOpen={showMediaManager}
        onClose={() => {
          setShowMediaManager(false);
          setCurrentMediaField('');
        }}
        onSelect={handleMediaSelect}
        mode={mediaManagerMode}
      />
    </div>
  );
};

export default SectionEditor;
