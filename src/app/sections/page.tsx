'use client';

import { useState, useEffect } from 'react';
import { 
  Edit, 
  Eye, 
  RefreshCw, 
  MapPin,
  Users,
  Award,
  Package,
  MessageSquare,
  BookOpen,
  Camera,
  Settings,
  BarChart3
} from 'lucide-react';

import SectionEditor from '@/components/SectionEditor';
import LanguageProvider from '@/contexts/LanguageContext';

interface SectionContent {
  id: string; // sectionId seperti 'hero', 'whoAmI', dst.
  dbId?: string; // optional: id database
  title: string;
  subtitle?: string;
  description?: string;
  updatedAt?: string;
}

const SectionContentManagerInner = () => {
  const [sections, setSections] = useState<SectionContent[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sections');
      const data = await response.json();
      if (data.success) {
        const sectionsArray = (Array.isArray(data.data) ? data.data : Object.values(data.data))
          .map((section: any) => ({
            id: section.sectionId,      // gunakan sectionId agar user-friendly (hero, whoAmI, ...)
            dbId: section.id,           // simpan id DB kalau perlu
            title: section.title,
            subtitle: section.subtitle,
            description: section.description,
            updatedAt: section.updatedAt
          }))
          .filter((s: SectionContent) => (s.id || '').toLowerCase().trim() !== 'whychooseus'); // sembunyikan Why Choose Us (sudah merged)
        setSections(sectionsArray);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSection = (sectionId: string) => {
    setSelectedSection(sectionId);
  };

  const handleSaveSection = (content: any) => {
    setSelectedSection(null);
    fetchSections(); // Refresh the list
  };

  const handleCancelEdit = () => {
    setSelectedSection(null);
  };

  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'hero': return MapPin;
      case 'whoAmI': return Users;
      case 'whyChooseUs': return Award;
      case 'exclusiveDestinations': return MapPin;
      case 'tourPackages': return Package;
      case 'testimonials': return MessageSquare;
      case 'blog': return BookOpen;
      case 'gallery': return Camera;
      default: return Settings;
    }
  };

  const getSectionDescription = (sectionId: string) => {
    switch (sectionId) {
      case 'hero': return 'Main hero section with title, subtitle, and CTA button';
      case 'whoAmI': return 'About us section with company information and features';
      case 'whyChooseUs': return 'Why choose us section with key benefits';
      case 'exclusiveDestinations': return 'Featured destinations showcase';
      case 'tourPackages': return 'Tour packages listing and details';
      case 'testimonials': return 'Customer testimonials and reviews';
      case 'blog': return 'Latest blog posts and articles';
      case 'gallery': return 'Photo gallery and visual content';
      default: return 'Section content management';
    }
  };

  const getSectionLabel = (sectionId: string) => {
    switch (sectionId) {
      case 'hero': return 'Hero';
      case 'whoAmI': return 'Who Am I';
      case 'whyChooseUs': return 'Why Choose Us';
      case 'exclusiveDestinations': return 'Exclusive Destinations';
      case 'tourPackages': return 'Tour Packages';
      case 'testimonials': return 'Testimonials';
      case 'blog': return 'Blog';
      case 'gallery': return 'Gallery';
      default: return sectionId;
    }
  };

  if (selectedSection) {
    return (
      <SectionEditor
        sectionId={selectedSection}
        onSave={handleSaveSection}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Section Content Manager</h1>
              <p className="text-gray-600 mt-2">Manage content for each section of your landing page</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={fetchSections}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <Settings className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Content Management Instructions
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Click on any section below to edit its content. You can modify text, images, 
                  and other content without changing the layout or design. Changes will be 
                  reflected on the live website immediately.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.filter(s => (s.id || '').toLowerCase().trim() !== 'whychooseus').map((section) => {
            const SectionIcon = getSectionIcon(section.id);
            return (
              <div
                key={section.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleEditSection(section.id)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <SectionIcon className="w-6 h-6 text-orange-600" />
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {getSectionLabel(section.id)}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {getSectionDescription(section.id)}
                  </p>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-gray-500">Title:</span>
                      <p className="text-sm text-gray-900 truncate">{section.title}</p>
                    </div>
                    
                    {section.subtitle && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">Subtitle:</span>
                        <p className="text-sm text-gray-900 truncate">{section.subtitle}</p>
                      </div>
                    )}
                    
                    {section.description && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">Description:</span>
                        <p className="text-sm text-gray-900 line-clamp-2">{section.description}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Last updated</span>
                      <span>
                        {section.updatedAt 
                          ? new Date(section.updatedAt).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.open('/', '_blank')}
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Eye className="w-6 h-6 text-blue-600 mr-3" />
              <div className="text-left">
                <h4 className="font-semibold text-blue-900">Preview Site</h4>
                <p className="text-sm text-blue-700">View your changes live</p>
              </div>
            </button>
            
            <button
              onClick={fetchSections}
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <RefreshCw className="w-6 h-6 text-green-600 mr-3" />
              <div className="text-left">
                <h4 className="font-semibold text-green-900">Refresh Data</h4>
                <p className="text-sm text-green-700">Reload all section data</p>
              </div>
            </button>
            
            <button
              onClick={() => window.open('/cms', '_blank')}
              className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <BarChart3 className="w-6 h-6 text-orange-600 mr-3" />
              <div className="text-left">
                <h4 className="font-semibold text-orange-900">Admin Dashboard</h4>
                <p className="text-sm text-orange-700">Access full admin panel</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionContentManager = () => {
  return (
    <LanguageProvider initialLanguage="id">
      <SectionContentManagerInner />
    </LanguageProvider>
  );
};

export default SectionContentManager;
