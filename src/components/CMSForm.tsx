'use client';

import { useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Save, Upload, Image, FileText, Calendar, Mail, MapPin, Package, MessageSquare, Camera, Trash2, Plus, GripVertical, HelpCircle, FolderOpen } from 'lucide-react';
import SeoForm from '@/components/SeoForm';
import MediaManager from '@/components/MediaManager';
import AutoTranslateButton from '@/components/AutoTranslateButton';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'date' | 'email' | 'url' | 'rich-text' | 'image' | 'gallery' | 'array' | 'itinerary' | 'faq' | 'mapEmbed';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  rows?: number;
}

interface CMSFormProps {
  formData: any;
  setFormData: (data: any) => void;
  fields: FormField[];
  onSubmit: () => void;
  loading?: boolean;
  submitText?: string;
  // SEO Integration
  showSeoForm?: boolean;
  seoPageType?: string;
  seoPageSlug?: string;
  // Image SEO
  imageContext?: string; // Context for SEO-friendly filenames: 'package', 'blog', 'gallery', etc.
}

const CMSForm = ({ 
  formData, 
  setFormData, 
  fields, 
  onSubmit, 
  loading = false, 
  submitText = 'Save',
  showSeoForm = false,
  seoPageType = '',
  seoPageSlug = '',
  imageContext = 'general'
}: CMSFormProps) => {
  const [uploading, setUploading] = useState(false);
  const [showMediaManager, setShowMediaManager] = useState(false);
  const [currentImageField, setCurrentImageField] = useState<string>('');
  const [currentGalleryField, setCurrentGalleryField] = useState<string>('');
  const [mediaManagerMode, setMediaManagerMode] = useState<'select' | 'selectMultiple' | 'manage'>('select');

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value });
  };

  const handleImageUpload = async (fieldName: string, file: File, context?: string, altText?: string) => {
    if (!file) return;

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      
      // Add context for SEO-friendly filename (e.g., 'package', 'blog', 'gallery')
      if (context) {
        uploadFormData.append('context', context);
      }
      
      // Add alt text for image SEO
      if (altText) {
        uploadFormData.append('altText', altText);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();

      if (data.success) {
        handleFieldChange(fieldName, data.url);
        // Log SEO metadata for debugging
        console.log('📸 Image uploaded with SEO:', data.seoMetadata);
      } else {
        alert('Upload failed: ' + data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed!');
    } finally {
      setUploading(false);
    }
  };

  const handleMediaSelectMultiple = (urls: string[]) => {
    if (currentGalleryField) {
      const currentImages = Array.isArray(formData[currentGalleryField])
        ? formData[currentGalleryField]
        : [];
      handleFieldChange(currentGalleryField, [...currentImages, ...urls]);
    }
  };

  const renderField = (field: FormField) => {
    const commonClasses = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder:text-gray-400";
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
      case 'number':
        return (
          <input
            type={field.type}
            value={formData[field.name] || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className={commonClasses}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={formData[field.name] || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className={commonClasses}
            required={field.required}
          />
        );
      
      case 'textarea':
        return (
          <div className="space-y-3">
            <textarea
              value={formData[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              rows={field.rows || 4}
              className={commonClasses}
              placeholder={field.placeholder}
              required={field.required}
            />
            {/* Auto Translate Buttons */}
            <div className="flex gap-2 flex-wrap">
              <AutoTranslateButton
                text={formData[field.name] || ''}
                contentType={formData.id ? 'blog' : undefined}
                contentId={formData.id}
                from="id"
                to="en"
                onTranslate={(translatedText) => handleFieldChange(field.name, translatedText)}
                className="text-xs"
              >
                🇬🇧 English
              </AutoTranslateButton>
              <AutoTranslateButton
                text={formData[field.name] || ''}
                contentType={formData.id ? 'blog' : undefined}
                contentId={formData.id}
                from="id"
                to="de"
                onTranslate={(translatedText) => handleFieldChange(field.name, translatedText)}
                className="text-xs"
              >
                🇩🇪 Deutsch
              </AutoTranslateButton>
            </div>
          </div>
        );
      
      case 'select':
        return (
          <select
            value={formData[field.name] || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className={commonClasses}
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData[field.name] || false}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-900">{field.label}</span>
          </label>
        );
      
      case 'rich-text':
        return (
          <div className="space-y-3">
            <Editor
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              licenseKey="gpl"
              value={formData[field.name] || ''}
              onEditorChange={(content) => handleFieldChange(field.name, content)}
              init={{
                height: 400,
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
                placeholder: `Enter ${field.label.toLowerCase()} here...`
              }}
            />
            {/* Auto Translate Buttons */}
            <div className="flex gap-2 flex-wrap">
              <AutoTranslateButton
                text={formData[field.name] || ''}
                contentType={formData.id ? 'blog' : undefined}
                contentId={formData.id}
                from="id"
                to="en"
                onTranslate={(translatedText) => handleFieldChange(field.name, translatedText)}
                className="text-xs"
              >
                🇬🇧 English
              </AutoTranslateButton>
              <AutoTranslateButton
                text={formData[field.name] || ''}
                contentType={formData.id ? 'blog' : undefined}
                contentId={formData.id}
                from="id"
                to="de"
                onTranslate={(translatedText) => handleFieldChange(field.name, translatedText)}
                className="text-xs"
              >
                🇩🇪 Deutsch
              </AutoTranslateButton>
            </div>
          </div>
        );
      
      case 'image':
        return (
          <div className="space-y-3">
            {/* SEO Mode Toggle */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-blue-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData[`${field.name}_seoMode`] !== false}
                      onChange={(e) => handleFieldChange(`${field.name}_seoMode`, e.target.checked)}
                      className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                    />
                    🎯 Auto SEO Mode (Recommended)
                  </label>
                  <p className="text-xs text-blue-700 mt-1 ml-6">
                    {formData[`${field.name}_seoMode`] !== false 
                      ? '✅ Filename will be auto-optimized for SEO (e.g., bromo-ijen-tour-package-sunset-view.jpg)'
                      : '❌ Original filename will be kept (not recommended for SEO)'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const useSeoMode = formData[`${field.name}_seoMode`] !== false;
                    const altText = formData.title || formData.name || field.label;
                    handleImageUpload(
                      field.name, 
                      file, 
                      useSeoMode ? imageContext : undefined, 
                      useSeoMode ? altText : undefined
                    );
                  }
                }}
                className="flex-1 text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                disabled={uploading}
              />
              {uploading && (
                <div className="flex items-center text-sm text-gray-600">
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </div>
              )}
            </div>
            {formData[field.name] && (
              <div className="relative w-full h-48 border border-gray-300 rounded-lg overflow-hidden">
                <img
                  src={formData[field.name]}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleFieldChange(field.name, '')}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {/* Show filename */}
                {formData[field.name] && (
                  <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded truncate">
                    {formData[field.name].split('/').pop()}
                  </div>
                )}
              </div>
            )}
            
            {/* Browse Library or Paste URL */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setCurrentImageField(field.name);
                  setShowMediaManager(true);
                }}
                className="flex-1 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-orange-600"
              >
                <FolderOpen className="w-4 h-4" />
                <span className="text-sm font-medium">Browse Library</span>
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">OR</span>
              </div>
            </div>
            
            <input
              type="text"
              value={formData[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder="Paste image URL"
              className={commonClasses}
            />
          </div>
        );
      
      case 'gallery':
        const galleryImages = Array.isArray(formData[field.name]) 
          ? formData[field.name] 
          : (formData[field.name] || '').split('\n').filter((url: string) => url.trim());
        
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length === 0) return;

                  setUploading(true);
                  try {
                    const altTextBase = formData.title || formData.name || 'gallery';
                    
                    const uploadPromises = files.map(async (file, index) => {
                      const uploadFormData = new FormData();
                      uploadFormData.append('file', file);
                      uploadFormData.append('context', imageContext);
                      uploadFormData.append('altText', `${altTextBase} - Image ${index + 1}`);
                      
                      const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: uploadFormData,
                      });
                      const data = await response.json();
                      if (data.success) {
                        console.log('📸 Gallery image uploaded:', data.seoMetadata);
                      }
                      return data.success ? data.url : null;
                    });

                    const uploadedUrls = await Promise.all(uploadPromises);
                    const validUrls = uploadedUrls.filter(url => url !== null);
                    
                    if (validUrls.length > 0) {
                      const currentImages = Array.isArray(formData[field.name]) 
                        ? formData[field.name] 
                        : [];
                      handleFieldChange(field.name, [...currentImages, ...validUrls]);
                    }
                  } catch (error) {
                    console.error('Upload error:', error);
                    alert('Upload failed!');
                  } finally {
                    setUploading(false);
                  }
                }}
                className="flex-1 text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                disabled={uploading}
              />
              {uploading && (
                <div className="flex items-center text-sm text-gray-600">
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </div>
              )}
            </div>
            
            {/* Gallery Preview Grid */}
            {galleryImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {galleryImages.map((url: string, index: number) => (
                  <div key={index} className="relative aspect-square border border-gray-300 rounded-lg overflow-hidden group">
                    <img
                      src={url}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = galleryImages.filter((_: any, i: number) => i !== index);
                        handleFieldChange(field.name, newImages);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Browse Library or URL Input */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentGalleryField(field.name);
                    setMediaManagerMode('selectMultiple');
                    setShowMediaManager(true);
                  }}
                  className="flex-1 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-orange-600"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span className="text-sm font-medium">Browse Library</span>
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-gray-500">OR</span>
                </div>
              </div>

              <textarea
                value={Array.isArray(formData[field.name]) ? formData[field.name].join('\n') : formData[field.name] || ''}
                onChange={(e) => {
                  const urls = e.target.value.split('\n').filter(url => url.trim());
                  handleFieldChange(field.name, urls);
                }}
                placeholder="Or paste image URLs (one per line)"
                rows={3}
                className={commonClasses}
              />
            </div>
          </div>
        );
      
      case 'array':
        const arrayItems = Array.isArray(formData[field.name]) 
          ? formData[field.name] 
          : (formData[field.name] || '').split('\n').filter((item: string) => item.trim());
        
        return (
          <div className="space-y-2">
            {arrayItems.map((item: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newItems = [...arrayItems];
                    newItems[index] = e.target.value;
                    handleFieldChange(field.name, newItems);
                  }}
                  className={`flex-1 ${commonClasses}`}
                  placeholder={field.placeholder || `Item ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newItems = arrayItems.filter((_: any, i: number) => i !== index);
                    handleFieldChange(field.name, newItems);
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                handleFieldChange(field.name, [...arrayItems, '']);
              }}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-500 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add {field.label}
            </button>
          </div>
        );

      case 'itinerary':
        const itineraryItems = Array.isArray(formData[field.name])
          ? formData[field.name]
          : [];
        
        return (
          <div className="space-y-4">
            {itineraryItems.map((item: any, index: number) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4 space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">Day {index + 1}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = itineraryItems.filter((_: any, i: number) => i !== index);
                      handleFieldChange(field.name, newItems);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={item.day || ''}
                    onChange={(e) => {
                      const newItems = [...itineraryItems];
                      newItems[index] = { ...newItems[index], day: e.target.value };
                      handleFieldChange(field.name, newItems);
                    }}
                    placeholder="e.g., Day 1"
                    className={commonClasses}
                  />
                  <input
                    type="text"
                    value={item.date || ''}
                    onChange={(e) => {
                      const newItems = [...itineraryItems];
                      newItems[index] = { ...newItems[index], date: e.target.value };
                      handleFieldChange(field.name, newItems);
                    }}
                    placeholder="e.g., 25 May 2025"
                    className={commonClasses}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => {
                      const newItems = [...itineraryItems];
                      newItems[index] = { ...newItems[index], title: e.target.value };
                      handleFieldChange(field.name, newItems);
                    }}
                    placeholder="e.g., Arrival & Check-in"
                    className={commonClasses}
                  />
                  <input
                    type="text"
                    value={item.time || ''}
                    onChange={(e) => {
                      const newItems = [...itineraryItems];
                      newItems[index] = { ...newItems[index], time: e.target.value };
                      handleFieldChange(field.name, newItems);
                    }}
                    placeholder="e.g., 04:45 AM"
                    className={commonClasses}
                  />
                </div>
                
                <textarea
                  value={item.description || ''}
                  onChange={(e) => {
                    const newItems = [...itineraryItems];
                    newItems[index] = { ...newItems[index], description: e.target.value };
                    handleFieldChange(field.name, newItems);
                  }}
                  placeholder="Description of the activity..."
                  rows={2}
                  className={commonClasses}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                handleFieldChange(field.name, [
                  ...itineraryItems,
                  { day: `Day ${itineraryItems.length + 1}`, title: '', date: '', time: '', description: '' }
                ]);
              }}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-500 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Day
            </button>
          </div>
        );

      case 'faq':
        const faqItems = Array.isArray(formData[field.name])
          ? formData[field.name]
          : [];
        
        return (
          <div className="space-y-4">
            {faqItems.map((item: any, index: number) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4 space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-gray-900">FAQ #{index + 1}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = faqItems.filter((_: any, i: number) => i !== index);
                      handleFieldChange(field.name, newItems);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <input
                  type="text"
                  value={item.question || ''}
                  onChange={(e) => {
                    const newItems = [...faqItems];
                    newItems[index] = { ...newItems[index], question: e.target.value };
                    handleFieldChange(field.name, newItems);
                  }}
                  placeholder="Question?"
                  className={commonClasses}
                />
                
                <textarea
                  value={item.answer || ''}
                  onChange={(e) => {
                    const newItems = [...faqItems];
                    newItems[index] = { ...newItems[index], answer: e.target.value };
                    handleFieldChange(field.name, newItems);
                  }}
                  placeholder="Answer..."
                  rows={3}
                  className={commonClasses}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                handleFieldChange(field.name, [
                  ...faqItems,
                  { question: '', answer: '' }
                ]);
              }}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-500 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add FAQ
            </button>
          </div>
        );

      case 'mapEmbed':
        const embedUrl = formData[field.name] || '';
        const isValidEmbed = embedUrl && embedUrl.includes('google.com/maps/embed');
        
        return (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">How to get Google Maps Embed URL:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Open Google Maps and search for your location</li>
                  <li>Click "Share" button</li>
                  <li>Select "Embed a map" tab</li>
                  <li>Copy the URL from <code className="bg-blue-100 px-1 rounded">src="..."</code></li>
                  <li>Paste it below</li>
                </ol>
              </div>
            </div>
            
            <textarea
              value={embedUrl}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              rows={3}
              className={commonClasses}
              placeholder={field.placeholder || 'https://www.google.com/maps/embed?pb=...'}
            />
            
            {/* Live Map Preview */}
            {isValidEmbed && (
              <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-white" />
                  <span className="text-sm font-semibold text-white">Map Preview</span>
                </div>
                <div className="relative w-full h-64 md:h-96">
                  <iframe
                    src={embedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                  />
                </div>
              </div>
            )}
            
            {embedUrl && !isValidEmbed && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-sm text-red-800">
                  ⚠️ Invalid Google Maps embed URL. Please make sure you copied the correct URL from the embed code.
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {fields.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderField(field)}
        </div>
      ))}

      {/* SEO Form Integration */}
      {showSeoForm && seoPageType && seoPageSlug && (
        <div className="pt-6 border-t border-gray-200">
          <SeoForm 
            pageType={seoPageType} 
            pageSlug={seoPageSlug}
          />
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          onClick={onSubmit}
          disabled={loading}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving...' : submitText}</span>
        </button>
      </div>

      {/* Media Manager Modal */}
      <MediaManager
        isOpen={showMediaManager}
        onClose={() => {
          setShowMediaManager(false);
          setCurrentImageField('');
          setCurrentGalleryField('');
          setMediaManagerMode('select');
        }}
        onSelect={(url) => {
          handleFieldChange(currentImageField, url);
          setShowMediaManager(false);
          setCurrentImageField('');
        }}
        onSelectMultiple={handleMediaSelectMultiple}
        mode={mediaManagerMode}
      />
    </div>
  );
};

export default CMSForm;
