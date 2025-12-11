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
  ChevronUp,
  ChevronRight,
  Save,
  X,
  Eye,
  EyeOff,
  Layout
} from 'lucide-react';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';

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
  const [activeTab, setActiveTab] = useState<'menus' | 'header' | 'topbar' | 'mobile' | 'language'>('menus');
  const [menus, setMenus] = useState<NavigationMenu[]>([]);
  const [settings, setSettings] = useState<{
    topbar?: TopbarSettings;
    mobile?: MobileMenuSettings;
    language?: LanguageSettings;
  }>({});
  const [loading, setLoading] = useState(true);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  
  // Define a type for the language object
  interface LanguageOption {
    code: string;
    name: string;
    flag: string;
  }
  
  const languages: LanguageOption[] = [
    { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' }
  ];
  
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Form states
  const [itemForm, setItemForm] = useState<{
    title: string;
    url: string;
    iconType: string;
    iconName: string;
    iconUrl: string;
    isExternal: boolean;
    target: string;
    backgroundColor: string;
    textColor: string;
    hoverColor: string;
    activeColor: string;
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    parentId: string | null;
    translations: Array<{
      id: string;
      itemId: string;
      language: string;
      title: string;
      url: string;
    }>;
  }>({
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

  const [headerForm, setHeaderForm] = useState({
    showWhatsApp: true,
    showEmail: true,
    showLanguageSwitcher: true,
    title: '',
    subtitle: '',
    whatsappNumber: '',
    enableMultiLanguage: true
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

  // Toast and Confirm Dialog state
  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error' | 'warning' | 'info'; message: string }>({
    show: false,
    type: 'success',
    message: ''
  });

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

  // Toast helper
  const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setToast({ show: true, type, message });
  };

  const handleMoveItem = async (itemId: string, direction: 'up' | 'down') => {
    const mainMenu = menus.find(m => m.location === 'header');
    if (!mainMenu) return;

    const reorderItems = (items: NavigationItem[]): { items: NavigationItem[]; changed: boolean } => {
      const index = items.findIndex(item => item.id === itemId);
      if (index !== -1) {
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= items.length) {
          return { items, changed: false };
        }
        const newItems = items.slice();
        [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];
        return { items: newItems, changed: true };
      }

      let changed = false;
      const newItems = items.map(item => {
        if (item.children && item.children.length > 0) {
          const result = reorderItems(item.children);
          if (result.changed) {
            changed = true;
            return { ...item, children: result.items };
          }
        }
        return item;
      });

      return { items: newItems, changed };
    };

    const result = reorderItems(mainMenu.items);
    if (!result.changed) return;

    const previousMenus = menus;
    const newMenus = menus.map(menu =>
      menu.location === 'header' ? { ...menu, items: result.items } : menu
    );

    setMenus(newMenus);

    try {
      const response = await fetch('/api/navigation/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, direction })
      });

      const data = await response.json();
      if (data.success) {
        showToast('success', `Menu item moved ${direction}`);
        await fetchData({ showLoading: false });
      } else {
        setMenus(previousMenus);
        showToast('error', data.error || 'Failed to move item');
      }
    } catch (error) {
      console.error('Error moving item:', error);
      setMenus(previousMenus);
      showToast('error', 'Error moving item');
    }
  };

  // Confirm helper
  const showConfirm = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' | 'info' = 'warning') => {
    setConfirmDialog({ show: true, title, message, onConfirm, type });
  };

  const fontAwesomeIcons = [
    'home', 'package', 'blog', 'images', 'phone', 'mail', 'user', 'search',
    'mountain', 'fire', 'route', 'camera', 'star', 'heart', 'share', 'download',
    'upload', 'edit', 'trash', 'save', 'settings', 'menu', 'close', 'check'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (options?: { showLoading?: boolean }) => {
    const showLoading = options?.showLoading ?? true;
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      // Fetch items directly from items API (returns hierarchical structure)
      const itemsResponse = await fetch('/api/navigation/items?location=header');
      const itemsData = await itemsResponse.json();
      if (itemsData.success && itemsData.data) {
        const menuMeta = itemsData.meta?.menu;
        const structuredMenu: NavigationMenu = {
          id: menuMeta?.id || 'header',
          name: menuMeta?.name || 'Main Menu',
          location: menuMeta?.location || 'header',
          isActive: menuMeta?.isActive ?? true,
          items: itemsData.data
        };
        setMenus([structuredMenu]);
      } else {
        // Fallback: fetch from menus API
        const menusResponse = await fetch('/api/navigation/menus?includeItems=true');
        const menusData = await menusResponse.json();
        if (menusData.success) {
          const menusArray = Array.isArray(menusData.data) ? menusData.data : [];
          setMenus(menusArray);
        }
      }

      // Fetch header settings
      const headerResponse = await fetch('/api/sections?section=header');
      const headerData = await headerResponse.json();
      if (headerData.success && headerData.data) {
        setHeaderForm({
          showWhatsApp: headerData.data.showWhatsApp !== false,
          showEmail: headerData.data.showEmail !== false,
          showLanguageSwitcher: headerData.data.showLanguageSwitcher !== false,
          title: headerData.data.title || '',
          subtitle: headerData.data.subtitle || '',
          whatsappNumber: headerData.data.whatsappNumber || '',
          enableMultiLanguage: true // Default value
        });

        // Fetch routing settings
        try {
          const routingRes = await fetch('/api/settings/routing');
          const routingData = await routingRes.json();
          setHeaderForm(prev => ({
            ...prev,
            enableMultiLanguage: routingData.enableMultiLanguage !== false
          }));
        } catch (e) {
          console.error('Failed to fetch routing settings', e);
        }
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
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleSaveItem = async () => {
    try {
      const mainMenu = menus.find(m => m.location === 'header');
      if (!mainMenu) return;

      // Convert simple title/url to translations array if translations is empty
      const defaultLanguageCode = languages[0]?.code ?? 'id';
      let translations = itemForm.translations;

      if (!translations || translations.length === 0) {
        // If user filled title and url directly, create translations for all languages
        if (itemForm.title && itemForm.url) {
          translations = languages.map(lang => ({
            id: `${Date.now()}-${lang.code}`,
            itemId: editingItem?.id || '',
            language: lang.code,
            title: itemForm.title,
            url: itemForm.url
          }));
        }
      } else {
        let hasDefaultTranslation = false;

        translations = translations.map(translation => {
          if ((translation?.language ?? '') === defaultLanguageCode) {
            hasDefaultTranslation = true;
            return {
              ...translation,
              title: itemForm.title || translation.title,
              url: itemForm.url || translation.url
            };
          }
          return translation;
        });

        if (!hasDefaultTranslation && itemForm.title && itemForm.url) {
          translations = [
            ...translations,
            {
              id: `${Date.now()}-${defaultLanguageCode}`,
              itemId: editingItem?.id || '',
              language: defaultLanguageCode,
              title: itemForm.title,
              url: itemForm.url
            }
          ];
        }
      }

      const itemData = {
        id: editingItem?.id,
        menuId: mainMenu.id,
        location: mainMenu.location,
        parentId: itemForm.parentId || null,
        order: editingItem?.order || undefined,
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
        translations: translations
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
        showToast('success', editingItem ? 'Menu item updated successfully!' : 'Menu item created successfully!');
      } else {
        showToast('error', 'Error saving item: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving item:', error);
      showToast('error', 'Error saving item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    showConfirm(
      'Delete Menu Item',
      'Are you sure you want to delete this menu item? This action cannot be undone.',
      async () => {
        try {
          const response = await fetch(`/api/navigation/items?id=${itemId}`, {
            method: 'DELETE'
          });

          const data = await response.json();
          if (data.success) {
            await fetchData();
            showToast('success', 'Menu item deleted successfully!');
          } else {
            showToast('error', 'Error deleting item: ' + data.error);
          }
        } catch (error) {
          console.error('Error deleting item:', error);
          showToast('error', 'Error deleting item');
        }
        setConfirmDialog({ ...confirmDialog, show: false });
      },
      'danger'
    );
  };

  const handleSaveSettings = async (type: 'header' | 'topbar' | 'mobile' | 'language') => {
    try {
      let data: any;
      
      if (type === 'header') {
        const response = await fetch('/api/sections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            section: 'header',
            data: headerForm
          })
        });

        // Save routing settings
        await fetch('/api/settings/routing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enableMultiLanguage: headerForm.enableMultiLanguage
          })
        });
        
        const result = await response.json();
        if (result.success) {
          await fetchData();
          showToast('success', 'Header settings saved successfully!');
        } else {
          showToast('error', 'Error saving header settings');
        }
        return;
      }
      
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
        showToast('success', 'Settings saved successfully!');
      } else {
        showToast('error', 'Error saving settings: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('error', 'Error saving settings');
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
      if (parentItemId) {
        setItemForm(prev => ({ ...prev, parentId: parentItemId }));
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
            <div className="flex items-center space-x-1 mr-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveItem(item.id, 'up');
                }}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded"
                title="Move Up"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveItem(item.id, 'down');
                }}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded"
                title="Move Down"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
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
            { id: 'header', label: 'Header Settings', icon: Layout },
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
      {activeTab === 'header' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-white border rounded-lg p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Header Configuration</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="font-medium text-gray-900">Show WhatsApp Button</label>
                  <p className="text-sm text-gray-500">Display WhatsApp contact button in header</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={headerForm.showWhatsApp}
                    onChange={(e) => setHeaderForm({ ...headerForm, showWhatsApp: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {headerForm.showWhatsApp && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                  <input
                    type="text"
                    value={headerForm.whatsappNumber}
                    onChange={(e) => setHeaderForm({ ...headerForm, whatsappNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="6281234567890"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: Country code + Number (e.g., 6281234567890). No '+' or spaces.</p>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="font-medium text-gray-900">Show Email Button</label>
                  <p className="text-sm text-gray-500">Display Email contact button in header</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={headerForm.showEmail}
                    onChange={(e) => setHeaderForm({ ...headerForm, showEmail: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="font-medium text-gray-900">Enable Multi-language URLs</label>
                  <p className="text-sm text-gray-500">If disabled, the site will only use the default language (Indonesian) at the root URL.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={headerForm.enableMultiLanguage}
                    onChange={(e) => setHeaderForm({ ...headerForm, enableMultiLanguage: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="font-medium text-gray-900">Show Language Switcher</label>
                  <p className="text-sm text-gray-500">Display language selector dropdown</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={headerForm.showLanguageSwitcher}
                    onChange={(e) => setHeaderForm({ ...headerForm, showLanguageSwitcher: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Title</label>
                    <input
                      type="text"
                      value={headerForm.title}
                      onChange={(e) => setHeaderForm({ ...headerForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                      placeholder="Bromo Ijen"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Subtitle</label>
                    <input
                      type="text"
                      value={headerForm.subtitle}
                      onChange={(e) => setHeaderForm({ ...headerForm, subtitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                      placeholder="Adventure Tour"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => handleSaveSettings('header')}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                <span>Save Header Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
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

export default NavigationManager;
