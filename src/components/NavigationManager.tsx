'use client';

import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical, 
  Settings, 
  Globe, 
  Palette,
  Smartphone,
  Monitor,
  ChevronDown,
  ChevronRight,
  Save,
  X,
  Eye,
  EyeOff
} from 'lucide-react';

interface NavigationMenu {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  items: NavigationItem[];
}

interface NavigationItem {
  id: string;
  menuId: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  isExternal: boolean;
  target: string;
  iconType: string;
  iconName?: string;
  iconUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  hoverColor?: string;
  activeColor?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  children?: NavigationItem[];
  translations: NavigationItemTranslation[];
}

interface NavigationItemTranslation {
  id: string;
  itemId: string;
  language: string;
  title: string;
  url: string;
}

interface TopbarSettings {
  id: string;
  isEnabled: boolean;
  phone: string;
  email: string;
  announcement: string;
  showLanguage: boolean;
  showSocial: boolean;
  socialLinks: string;
  backgroundColor: string;
  textColor: string;
}

interface MobileMenuSettings {
  id: string;
  menuType: string;
  position: string;
  animation: string;
  backgroundColor: string;
  textColor: string;
  iconColor: string;
}

interface LanguageSettings {
  id: string;
  defaultLanguage: string;
  supportedLanguages: string;
  showLanguageSwitcher: boolean;
  languageSwitcherPosition: string;
}

const NavigationManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'menus' | 'topbar' | 'mobile' | 'language'>('menus');
  const [menus, setMenus] = useState<NavigationMenu[]>([]);
  const [settings, setSettings] = useState<{
    topbar?: TopbarSettings;
    mobile?: MobileMenuSettings;
    language?: LanguageSettings;
  }>({});
  const [loading, setLoading] = useState(true);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Form states
  const [itemForm, setItemForm] = useState({
    title: '',
    url: '',
    iconType: 'fontawesome',
    iconName: '',
    iconUrl: '',
    isExternal: false,
    target: '_self',
    backgroundColor: '',
    textColor: '',
    hoverColor: '',
    activeColor: '',
    fontFamily: '',
    fontSize: '',
    fontWeight: '',
    parentId: null as string | null,
    translations: [] as any[]
  });

  const [topbarForm, setTopbarForm] = useState({
    isEnabled: true,
    phone: '',
    email: '',
    announcement: '',
    showLanguage: true,
    showSocial: true,
    socialLinks: { facebook: '', instagram: '', twitter: '' },
    backgroundColor: '#f8f9fa',
    textColor: '#333333'
  });

  const [mobileForm, setMobileForm] = useState({
    menuType: 'hamburger',
    position: 'top-right',
    animation: 'slide',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    iconColor: '#333333'
  });

  const [languageForm, setLanguageForm] = useState({
    defaultLanguage: 'id',
    supportedLanguages: ['id', 'en'],
    showLanguageSwitcher: true,
    languageSwitcherPosition: 'topbar'
  });

  const languages = [
    { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'cn', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' }
  ];

  const fontAwesomeIcons = [
    'home', 'package', 'blog', 'images', 'phone', 'mail', 'user', 'search',
    'mountain', 'fire', 'route', 'camera', 'star', 'heart', 'share', 'download',
    'upload', 'edit', 'trash', 'save', 'settings', 'menu', 'close', 'check'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch menus
      const menusResponse = await fetch('/api/navigation/menus?includeItems=true');
      const menusData = await menusResponse.json();
      if (menusData.success) {
        // Ensure menus is always an array
        const menusArray = Array.isArray(menusData.data) ? menusData.data : [];
        setMenus(menusArray);
      }

      // Fetch settings
      const settingsResponse = await fetch('/api/navigation/settings?type=all');
      const settingsData = await settingsResponse.json();
      
      if (settingsData.success) {
        setSettings(settingsData.data);
        
        // Populate forms
        if (settingsData.data.topbar) {
          const topbar = settingsData.data.topbar;
          setTopbarForm({
            ...topbar,
            socialLinks: typeof topbar.socialLinks === 'string' 
              ? JSON.parse(topbar.socialLinks) 
              : topbar.socialLinks
          });
        }
        
        if (settingsData.data.mobile) {
          setMobileForm(settingsData.data.mobile);
        }
        
        if (settingsData.data.language) {
          const lang = settingsData.data.language;
          setLanguageForm({
            ...lang,
            supportedLanguages: typeof lang.supportedLanguages === 'string'
              ? JSON.parse(lang.supportedLanguages)
              : lang.supportedLanguages
          });
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async () => {
    try {
      const mainMenu = menus.find(m => m.location === 'header');
      if (!mainMenu) return;

      const itemData = {
        id: editingItem?.id,
        menuId: mainMenu.id,
        parentId: itemForm.parentId || null,
        order: editingItem?.order || 0,
        isActive: true,
        isExternal: itemForm.isExternal,
        target: itemForm.target,
        iconType: itemForm.iconType,
        iconName: itemForm.iconName,
        iconUrl: itemForm.iconUrl,
        backgroundColor: itemForm.backgroundColor,
        textColor: itemForm.textColor,
        hoverColor: itemForm.hoverColor,
        activeColor: itemForm.activeColor,
        fontFamily: itemForm.fontFamily,
        fontSize: itemForm.fontSize,
        fontWeight: itemForm.fontWeight,
        translations: itemForm.translations
      };

      const url = editingItem ? '/api/navigation/items' : '/api/navigation/items';
      const method = editingItem ? 'PUT' : 'POST';
      
      if (editingItem) {
        itemData.id = editingItem.id;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });

      const data = await response.json();
      if (data.success) {
        await fetchData();
        setShowItemModal(false);
        setEditingItem(null);
        resetItemForm();
      } else {
        alert('Error saving item: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error saving item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/navigation/items?id=${itemId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        await fetchData();
      } else {
        alert('Error deleting item: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item');
    }
  };

  const handleSaveSettings = async (type: 'topbar' | 'mobile' | 'language') => {
    try {
      let data: any;
      
      switch (type) {
        case 'topbar':
          data = topbarForm;
          break;
        case 'mobile':
          data = mobileForm;
          break;
        case 'language':
          data = languageForm;
          break;
      }

      const response = await fetch('/api/navigation/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data })
      });

      const result = await response.json();
      if (result.success) {
        await fetchData();
        alert('Settings saved successfully!');
      } else {
        alert('Error saving settings: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
  };

  const resetItemForm = () => {
    setItemForm({
      title: '',
      url: '',
      iconType: 'fontawesome',
      iconName: '',
      iconUrl: '',
      isExternal: false,
      target: '_self',
      backgroundColor: '',
      textColor: '',
      hoverColor: '',
      activeColor: '',
      fontFamily: '',
      fontSize: '',
      fontWeight: '',
      parentId: null,
      translations: []
    });
  };

  const openItemModal = (item?: NavigationItem, parentItemId?: string) => {
    if (item) {
      setEditingItem(item);
      const translation = item.translations.find(t => t.language === 'id') || item.translations[0];
      setItemForm({
        title: translation?.title || '',
        url: translation?.url || '',
        iconType: item.iconType,
        iconName: item.iconName || '',
        iconUrl: item.iconUrl || '',
        isExternal: item.isExternal,
        target: item.target,
        backgroundColor: item.backgroundColor || '',
        textColor: item.textColor || '',
        hoverColor: item.hoverColor || '',
        activeColor: item.activeColor || '',
        fontFamily: item.fontFamily || '',
        fontSize: item.fontSize || '',
        fontWeight: item.fontWeight || '',
        parentId: item.parentId || null,
        translations: item.translations
      });
    } else {
      setEditingItem(null);
      resetItemForm();
      // Set parent ID if creating a submenu
      if (parentItemId) {
        setItemForm({ ...itemForm, parentId: parentItemId });
      }
    }
    setShowItemModal(true);
  };

  const toggleItemExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const renderMenuItem = (item: NavigationItem, level = 0) => {
    const translation = item.translations.find(t => t.language === 'id') || item.translations[0];
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);

    return (
      <div key={item.id} className={`border rounded-lg p-3 mb-2 ${level > 0 ? 'ml-6 bg-gray-50' : 'bg-white'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
            
            {hasChildren && (
              <button
                onClick={() => toggleItemExpansion(item.id)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}
            
            <div className="flex items-center space-x-2">
              {item.iconType === 'fontawesome' && item.iconName && (
                <span className="text-sm">🔹</span>
              )}
              <span className="font-medium text-gray-900">{translation?.title || 'Untitled'}</span>
              <span className="text-sm text-gray-600">({translation?.url || '#'})</span>
            </div>
            
            <div className="flex items-center space-x-1">
              {item.isActive ? (
                <Eye className="w-4 h-4 text-green-500" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
              {item.isExternal && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">External</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openItemModal(undefined, item.id);
              }}
              className="p-2 text-green-600 hover:bg-green-50 rounded"
              title="Add Submenu"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => openItemModal(item)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteItem(item.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-3 space-y-2">
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">🧭 Navigation Manager</h1>
        <p className="text-gray-600">Manage your website navigation menus, topbar, mobile menu, and language settings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'menus', label: 'Menu Management', icon: Menu },
            { id: 'topbar', label: 'Topbar Settings', icon: Monitor },
            { id: 'mobile', label: 'Mobile Menu', icon: Smartphone },
            { id: 'language', label: 'Language Settings', icon: Globe }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'menus' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Menu Items</h2>
            <button
              onClick={() => openItemModal()}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Menu Item</span>
            </button>
          </div>

          <div className="space-y-4">
            {Array.isArray(menus) && menus.length > 0 ? (
              menus.map(menu => (
                <div key={menu.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">{menu.name}</h3>
                    <span className="text-sm text-gray-500 capitalize">{menu.location}</span>
                  </div>
                  
                  {menu.items && menu.items.length > 0 ? (
                    <div className="space-y-2">
                      {menu.items.map(item => renderMenuItem(item))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Menu className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No menu items yet</p>
                      <p className="text-sm">Click "Add Menu Item" to get started</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Menu className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No menus available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'topbar' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Topbar Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enable Topbar
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={topbarForm.isEnabled}
                    onChange={(e) => setTopbarForm({ ...topbarForm, isEnabled: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Show topbar on website</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={topbarForm.phone}
                  onChange={(e) => setTopbarForm({ ...topbarForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+62 812-3456-7890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={topbarForm.email}
                  onChange={(e) => setTopbarForm({ ...topbarForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="info@bromotour.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Announcement Message
                </label>
                <textarea
                  value={topbarForm.announcement}
                  onChange={(e) => setTopbarForm({ ...topbarForm, announcement: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="🎉 Special Offer: 20% OFF Bromo Tours! Book Now!"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={topbarForm.backgroundColor}
                    onChange={(e) => setTopbarForm({ ...topbarForm, backgroundColor: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={topbarForm.backgroundColor}
                    onChange={(e) => setTopbarForm({ ...topbarForm, backgroundColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={topbarForm.textColor}
                    onChange={(e) => setTopbarForm({ ...topbarForm, textColor: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={topbarForm.textColor}
                    onChange={(e) => setTopbarForm({ ...topbarForm, textColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={topbarForm.showLanguage}
                    onChange={(e) => setTopbarForm({ ...topbarForm, showLanguage: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Show Language Switcher</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={topbarForm.showSocial}
                    onChange={(e) => setTopbarForm({ ...topbarForm, showSocial: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Show Social Media Links</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => handleSaveSettings('topbar')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              <span>Save Topbar Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile and Language tabs content would go here - simplified for now */}
      {activeTab === 'mobile' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Mobile Menu Settings</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">Mobile menu settings coming soon!</p>
          </div>
        </div>
      )}

      {activeTab === 'language' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Language Settings</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">Language settings coming soon!</p>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </h3>
              <button
                onClick={() => setShowItemModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={itemForm.title}
                    onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Menu Item Title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL
                  </label>
                  <input
                    type="text"
                    value={itemForm.url}
                    onChange={(e) => setItemForm({ ...itemForm, url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="/page-url"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Menu (Optional - for submenu)
                </label>
                <select
                  value={itemForm.parentId || ''}
                  onChange={(e) => setItemForm({ ...itemForm, parentId: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">None (Top Level Menu)</option>
                  {Array.isArray(menus) && menus.flatMap(menu => 
                    menu.items?.filter(item => item.isActive && item.id !== editingItem?.id).map(item => {
                      const translation = item.translations?.find(t => t.language === 'id') || item.translations?.[0];
                      return (
                        <option key={item.id} value={item.id}>
                          {translation?.title || 'Untitled'}
                        </option>
                      );
                    }) || []
                  )}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select a parent menu to make this a submenu
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon Type
                  </label>
                  <select
                    value={itemForm.iconType}
                    onChange={(e) => setItemForm({ ...itemForm, iconType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="fontawesome">FontAwesome</option>
                    <option value="custom">Custom SVG</option>
                    <option value="none">No Icon</option>
                  </select>
                </div>

                {itemForm.iconType === 'fontawesome' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon Name
                    </label>
                    <select
                      value={itemForm.iconName}
                      onChange={(e) => setItemForm({ ...itemForm, iconName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Icon</option>
                      {fontAwesomeIcons.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={itemForm.isExternal}
                      onChange={(e) => setItemForm({ ...itemForm, isExternal: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">External Link</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target
                  </label>
                  <select
                    value={itemForm.target}
                    onChange={(e) => setItemForm({ ...itemForm, target: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="_self">Same Tab</option>
                    <option value="_blank">New Tab</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowItemModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveItem}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                <span>{editingItem ? 'Update' : 'Create'} Item</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationManager;
