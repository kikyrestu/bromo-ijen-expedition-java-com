'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  BarChart3, 
  Clock, 
  MessageSquare, 
  Package, 
  BookOpen, 
  Camera, 
  Users,
  TrendingUp,
  DollarSign,
  Eye,
  CheckCircle,
  AlertCircle,
  Globe,
  Languages,
  FileText,
  Image,
  Star,
  Activity,
  Zap,
  Target,
  Award
} from 'lucide-react';
import LocalizedUrlManager from './LocalizedUrlManager';

interface DashboardStats {
  totalPackages: number;
  totalBlogs: number;
  totalGalleryItems: number;
  totalTestimonials: number;
  totalSections: number;
  totalTranslations: number;
  totalMediaFiles: number;
  recentActivity: number;
  translationCoverage: number;
  seoScore: number;
}

interface RecentActivity {
  id: string | number;
  type: 'package' | 'blog' | 'testimonial' | 'gallery' | 'section' | 'translation' | 'media';
  title: string;
  description: string;
  timestamp: string;
  status: 'created' | 'updated' | 'published' | 'translated';
  language?: string;
}

interface CMSDashboardProps {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  onQuickAction: (action: string) => void;
}

const CMSDashboard = ({ stats, recentActivity, onQuickAction }: CMSDashboardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showLocalizedUrlManager, setShowLocalizedUrlManager] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const statCards = [
    {
      title: 'Tour Packages',
      value: stats.totalPackages || 0,
      icon: Package,
      color: 'orange',
      change: '+2 this week',
      changeType: 'positive',
      description: 'Active tour packages'
    },
    {
      title: 'Blog Posts',
      value: stats.totalBlogs || 0,
      icon: BookOpen,
      color: 'blue',
      change: '+1 this week',
      changeType: 'positive',
      description: 'Published articles'
    },
    {
      title: 'Gallery Items',
      value: stats.totalGalleryItems || 0,
      icon: Camera,
      color: 'purple',
      change: '+5 this week',
      changeType: 'positive',
      description: 'Photos & videos'
    },
    {
      title: 'Testimonials',
      value: stats.totalTestimonials || 0,
      icon: MessageSquare,
      color: 'green',
      change: '+3 this week',
      changeType: 'positive',
      description: 'Customer reviews'
    },
    {
      title: 'Media Files',
      value: stats.totalMediaFiles || 0,
      icon: Image,
      color: 'indigo',
      change: '+8 this week',
      changeType: 'positive',
      description: 'Uploaded files'
    },
    {
      title: 'Translation Coverage',
      value: `${stats.translationCoverage || 0}%`,
      icon: Languages,
      color: 'teal',
      change: 'Multi-language',
      changeType: 'neutral',
      description: 'Content translated'
    }
  ];

  const quickActions = [
    {
      title: 'Create Package',
      description: 'Add new tour package',
      icon: Package,
      color: 'orange',
      action: 'add-package'
    },
    {
      title: 'Write Blog',
      description: 'Create new blog post',
      icon: BookOpen,
      color: 'blue',
      action: 'add-blog'
    },
    {
      title: 'Upload Media',
      description: 'Add photos & videos',
      icon: Camera,
      color: 'purple',
      action: 'add-gallery'
    },
    {
      title: 'Manage Sections',
      description: 'Edit landing page',
      icon: FileText,
      color: 'green',
      action: 'manage-sections'
    },
    {
      title: 'Translate Content',
      description: 'Multi-language support',
      icon: Languages,
      color: 'teal',
      action: 'translate-content'
    },
    {
      title: 'SEO Settings',
      description: 'Optimize for search',
      icon: Target,
      color: 'red',
      action: 'seo-settings'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return 'text-green-600 bg-green-100';
      case 'updated': return 'text-blue-600 bg-blue-100';
      case 'published': return 'text-purple-600 bg-purple-100';
      case 'translated': return 'text-teal-600 bg-teal-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'package': return Package;
      case 'blog': return BookOpen;
      case 'testimonial': return MessageSquare;
      case 'gallery': return Camera;
      case 'section': return FileText;
      case 'translation': return Languages;
      case 'media': return Image;
      default: return Activity;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome to CMS Dashboard</h1>
            <p className="text-orange-100 mt-1">Manage your Bromo Ijen travel website content</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.totalPackages + stats.totalBlogs + stats.totalGalleryItems}</div>
            <div className="text-orange-100">Total Content Items</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Zap className="w-5 h-5 text-orange-500 mr-2" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => onQuickAction(action.action)}
                className={`p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-${action.color}-400 hover:bg-${action.color}-50 transition-all group`}
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg bg-${action.color}-100 group-hover:bg-${action.color}-200 transition-colors`}>
                    <Icon className={`w-5 h-5 text-${action.color}-600`} />
                  </div>
                  <div className="ml-3 text-left">
                    <p className="font-medium text-gray-900">{action.title}</p>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
          
          {/* Localized URL Management */}
          <button
            onClick={() => setShowLocalizedUrlManager(true)}
            className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50 transition-all group"
          >
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                <Globe className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3 text-left">
                <p className="font-medium text-gray-900">Manage URLs</p>
                <p className="text-sm text-gray-500">Localized URL settings</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 text-blue-500 mr-2" />
          Recent Activity
        </h2>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.slice(0, 5).map((activity, index) => {
              const Icon = getTypeIcon(activity.type);
              return (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                    <p className="text-sm text-gray-500 truncate">{activity.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                    {activity.language && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                        {activity.language.toUpperCase()}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{activity.timestamp}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No recent activity</p>
              <p className="text-sm">Start creating content to see activity here</p>
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Globe className="w-5 h-5 text-green-500 mr-2" />
            Website Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SEO Score</span>
              <div className="flex items-center">
                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.seoScore || 85}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.seoScore || 85}/100</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Translation Coverage</span>
              <div className="flex items-center">
                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${stats.translationCoverage || 75}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.translationCoverage || 75}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Content Sections</span>
              <span className="text-sm font-medium text-gray-900">{stats.totalSections || 8}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="w-5 h-5 text-yellow-500 mr-2" />
            Content Quality
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Published Packages</span>
              <span className="text-sm font-medium text-green-600">{stats.totalPackages || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Blog Posts</span>
              <span className="text-sm font-medium text-blue-600">{stats.totalBlogs || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Customer Reviews</span>
              <span className="text-sm font-medium text-purple-600">{stats.totalTestimonials || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Media Files</span>
              <span className="text-sm font-medium text-indigo-600">{stats.totalMediaFiles || 0}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Localized URL Manager Modal */}
      {showLocalizedUrlManager && (
        <LocalizedUrlManager onClose={() => setShowLocalizedUrlManager(false)} />
      )}
    </div>
  );
};

export default CMSDashboard;
