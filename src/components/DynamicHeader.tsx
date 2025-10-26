'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const DynamicHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerSettings, setHeaderSettings] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const { currentLanguage, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'id', name: 'Bahasa Indonesia', flag: 'ID' },
    { code: 'en', name: 'English', flag: 'EN' },
    { code: 'de', name: 'Deutsch', flag: 'DE' },
    { code: 'zh', name: '中文', flag: 'CN' },
    { code: 'nl', name: 'Nederlands', flag: 'NL' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch header settings with current language
        const response = await fetch(`/api/sections?section=header&language=${currentLanguage}`);
        const data = await response.json();
        
        if (data.success) {
          setHeaderSettings(data.data);
        }

        // Fetch navigation menus
        const navResponse = await fetch('/api/navigation/menus?includeItems=true&location=header');
        const navData = await navResponse.json();
        
        if (navData.success && navData.data && navData.data.length > 0) {
          const headerMenu = navData.data[0];
          if (headerMenu.items) {
            setMenuItems(headerMenu.items);
          }
        }
      } catch (error) {
        console.error('Error fetching header data:', error);
      }
    };

    fetchData();
  }, [currentLanguage]);

  const getLocalizedUrl = (path: string) => {
    if (currentLanguage === 'id') return path;
    return `/${currentLanguage}${path}`;
  };

  const getMenuTranslation = (item: any, field: 'title' | 'url') => {
    const translation = item.translations?.find((t: any) => t.language === currentLanguage);
    if (translation && field === 'title') return translation.title;
    if (translation && field === 'url') return translation.url;
    
    // Fallback to first translation
    if (item.translations && item.translations[0]) {
      return item.translations[0][field];
    }
    
    return field === 'title' ? 'Menu' : '/';
  };

  // Get translated header text from CMS or use defaults
  const getHeaderTitle = () => {
    // Get from database via headerSettings (which is fetched with language param)
    if (headerSettings?.title) return headerSettings.title;
    // Fallback translations by language
    const fallbacks: Record<string, string> = {
      id: 'Bromo Ijen',
      en: 'Bromo Ijen',
      de: 'Bromo Ijen',
      nl: 'Bromo Ijen',
      zh: 'Bromo Ijen'
    };
    return fallbacks[currentLanguage] || 'Bromo Ijen';
  };

  const getHeaderSubtitle = () => {
    // Get from database via headerSettings (which is fetched with language param)
    if (headerSettings?.subtitle) return headerSettings.subtitle;
    // Fallback translations by language
    const fallbacks: Record<string, string> = {
      id: 'Adventure Tour',
      en: 'Adventure Tour',
      de: 'Abenteuer Tour',
      nl: 'Avontuur Tour',
      zh: '冒险之旅'
    };
    return fallbacks[currentLanguage] || 'Adventure Tour';
  };

  return (
    <>
      {/* Main Header */}
      <header 
        className="fixed left-0 right-0 z-50 bg-white border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href={getLocalizedUrl('/')} className="flex items-center space-x-3 group">
                {headerSettings?.logo ? (
                  <img 
                    src={headerSettings.logo} 
                    alt="Logo" 
                    className="h-10 w-auto object-contain"
                  />
                ) : (
                  <div className="h-10 w-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-lg text-white">B</span>
                  </div>
                )}
                <div className="hidden sm:block">
                  <div className="font-semibold text-lg text-gray-900">{getHeaderTitle()}</div>
                  <div className="text-xs text-gray-500">{getHeaderSubtitle()}</div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              {menuItems.length > 0 ? (
                menuItems
                  .filter(item => item.isActive && !item.parentId)
                  .filter((item, index, self) => {
                    // Remove duplicates based on id
                    return index === self.findIndex(i => i.id === item.id);
                  })
                  .map((item, index) => {
                    // Use translated title from database, fallback to translation key
                    const dbTitle = getMenuTranslation(item, 'title');
                    const title = dbTitle !== 'Menu' ? dbTitle : t(`nav.${item.slug || 'home'}`);
                    const url = getMenuTranslation(item, 'url');
                    const hasChildren = item.children && item.children.length > 0;

                    if (hasChildren) {
                      return (
                        <div key={item.id} className="relative group">
                          <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1 py-2">
                            <span>{title}</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {/* Dropdown submenu */}
                          <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div className="py-1">
                              {item.children.map((child: any) => {
                                const childTitle = getMenuTranslation(child, 'title');
                                const childUrl = getMenuTranslation(child, 'url');
                                return (
                                  <Link
                                    key={child.id}
                                    href={childUrl || '#'}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                  >
                                    {childTitle}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.id}
                        href={url || '/'}
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors py-2"
                      >
                        {title}
                      </Link>
                    );
                  })
              ) : (
                // Fallback to static menu
                <>
                  <Link href={getLocalizedUrl('/')} className="font-medium transition-all duration-300 hover:scale-105 text-gray-700 hover:text-orange-600">
                    Home
                  </Link>
                  <Link href={getLocalizedUrl('/packages')} className="font-medium transition-all duration-300 hover:scale-105 text-gray-700 hover:text-orange-600">
                    Packages
                  </Link>
                  <Link href={getLocalizedUrl('/blog')} className="font-medium transition-all duration-300 hover:scale-105 text-gray-700 hover:text-orange-600">
                    Blog
                  </Link>
                  <Link href={getLocalizedUrl('/contact')} className="font-medium transition-all duration-300 hover:scale-105 text-gray-700 hover:text-orange-600">
                    Contact
                  </Link>
                </>
              )}
            </nav>

            {/* Language Selector & CTA Button */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Language Selector */}
              <select
                value={currentLanguage}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="text-sm text-gray-600 border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>

              {/* CTA Button */}
              <Link href={getLocalizedUrl('/packages')} className="px-5 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors">
                {t('nav.bookNow')}
              </Link>
            </div>

            {/* Mobile Menu Button */}
              <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg transition-colors duration-300 text-gray-700 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden transition-all duration-300 bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {menuItems.length > 0 ? (
                menuItems
                  .filter(item => item.isActive && !item.parentId)
                  .filter((item, index, self) => {
                    // Remove duplicates based on id
                    return index === self.findIndex(i => i.id === item.id);
                  })
                  .map((item) => {
                    const title = getMenuTranslation(item, 'title');
                    const url = getMenuTranslation(item, 'url');
                    const hasChildren = item.children && item.children.length > 0;

                    return (
                      <div key={item.id}>
                        <Link
                          href={url || '#'}
                          className="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 text-gray-700 hover:bg-gray-100 hover:text-orange-600"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {title}
                        </Link>
                        {hasChildren && (
                          <div className="pl-4 space-y-1">
                            {item.children.map((child: any) => {
                              const childTitle = getMenuTranslation(child, 'title');
                              const childUrl = getMenuTranslation(child, 'url');
                              return (
                                <Link
                                  key={child.id}
                                  href={childUrl || '#'}
                                  className={`block px-3 py-2 rounded-md text-sm transition-colors duration-300 ${
                                    isScrolled
                                      ? 'text-gray-600 hover:bg-gray-100 hover:text-orange-600'
                                      : 'text-white/80 hover:bg-white/10 hover:text-orange-200'
                                  }`}
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  {childTitle}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
              ) : (
                // Fallback to static menu
                <>
                  <Link
                    href={getLocalizedUrl('/')}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
            isScrolled 
                        ? 'text-gray-700 hover:bg-gray-100 hover:text-orange-600'
                        : 'text-white hover:bg-white/10 hover:text-orange-200'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                <Link
                  href={getLocalizedUrl('/packages')}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                      isScrolled
                        ? 'text-gray-700 hover:bg-gray-100 hover:text-orange-600'
                        : 'text-white hover:bg-white/10 hover:text-orange-200'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Packages
                  </Link>
                  <Link
                    href={getLocalizedUrl('/blog')}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                      isScrolled
                        ? 'text-gray-700 hover:bg-gray-100 hover:text-orange-600'
                        : 'text-white hover:bg-white/10 hover:text-orange-200'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Blog
                  </Link>
                  <Link
                    href={getLocalizedUrl('/contact')}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                    isScrolled
                        ? 'text-gray-700 hover:bg-gray-100 hover:text-orange-600'
                        : 'text-white hover:bg-white/10 hover:text-orange-200'
                  }`}
                    onClick={() => setIsMenuOpen(false)}
                >
                    Contact
                </Link>
                </>
              )}
              
              {/* Mobile Language Selector */}
              <div className="px-3 py-2">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-600" />
                    <select
                      value={currentLanguage}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-100 text-gray-700 border border-gray-200"
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code} className="text-gray-900">
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

              {/* Mobile CTA Button */}
              <div className="px-3 py-2">
                <Link
                  href={getLocalizedUrl('/packages')}
                  className="block w-full text-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl bg-gradient-to-r from-orange-600 to-blue-600 text-white hover:from-orange-700 hover:to-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.bookNow')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default DynamicHeader;