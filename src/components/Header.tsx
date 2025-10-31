'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Mail, ChevronDown, Globe } from 'lucide-react';
import { useLanguage, type Language } from '@/contexts/LanguageContext';

interface NavItem {
  id: string;
  title?: string;
  label?: string;
  url: string;
  isExternal?: boolean;
  target?: string;
  children?: NavItem[];
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [headerSettings, setHeaderSettings] = useState<any>(null);
  const [brandSettings, setBrandSettings] = useState<any>(null);
  const [navigationItems, setNavigationItems] = useState<NavItem[]>([]);
  const { currentLanguage, setLanguage } = useLanguage();

  const languages = [
    { code: 'id', name: 'Bahasa Indonesia', flag: 'ID' },
    { code: 'en', name: 'English', flag: 'EN' },
    { code: 'de', name: 'Deutsch', flag: 'DE' },
    { code: 'zh', name: '中文', flag: 'CN' },
    { code: 'nl', name: 'Nederlands', flag: 'NL' }
  ];

  useEffect(() => {
    const fetchHeaderSettings = async () => {
      try {
        const response = await fetch('/api/sections?section=header');
        const data = await response.json();

        if (data.success) {
          setHeaderSettings(data.data);
        }
      } catch (error) {
        console.error('Error fetching header settings:', error);
      }
    };

    fetchHeaderSettings();
  }, []);

  // NEW: Fetch branding settings (logo, brand name, etc)
  useEffect(() => {
    const fetchBrandSettings = async () => {
      try {
        const response = await fetch('/api/settings', { cache: 'no-store' }); // Force no cache
        const data = await response.json();

        console.log('🔥 HEADER: Fetched brand settings:', data.data); // DEBUG

        if (data.success && data.data) {
          setBrandSettings(data.data);
          console.log('✅ HEADER: Brand settings updated to state'); // DEBUG
        }
      } catch (error) {
        console.error('❌ HEADER: Error fetching brand settings:', error);
      }
    };

    fetchBrandSettings();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const normalizeNav = (item: any): NavItem => ({
      id: item.id,
      title: item.title ?? '',
      url: item.url ?? '#',
      isExternal: item.isExternal ?? false,
      target: item.target ?? '_self',
      children: Array.isArray(item.children) ? item.children.map(normalizeNav) : [],
    });
    const loadNavigation = async () => {
      try {
        const response = await fetch(
          `/api/navigation/items?location=header&language=${currentLanguage}`,
          { cache: 'no-store', signal: controller.signal }
        );
        const data = await response.json();
        if (data?.success && Array.isArray(data.data)) {
          setNavigationItems(data.data.map(normalizeNav));
        } else {
          setNavigationItems([]);
        }
      } catch (error) {
        if ((error as any)?.name !== 'AbortError') {
          console.error('Error fetching navigation items:', error);
          setNavigationItems([]);
        }
      }
    };

    loadNavigation();
    return () => controller.abort();
  }, [currentLanguage]);

  const getLocalizedUrl = (path: string) => {
    if (currentLanguage === 'id') return path;
    return `/${currentLanguage}${path}`;
  };

  const fallbackNavItems: NavItem[] = [
    { id: 'home', title: currentLanguage === 'id' ? 'Beranda' : 'Home', url: getLocalizedUrl('/'), isExternal: false, target: '_self', children: [] },
    { id: 'packages', title: currentLanguage === 'id' ? 'Paket' : 'Packages', url: getLocalizedUrl('/packages'), isExternal: false, target: '_self', children: [] },
    { id: 'blog', title: 'Blog', url: getLocalizedUrl('/blog'), isExternal: false, target: '_self', children: [] },
    { id: 'contact', title: currentLanguage === 'id' ? 'Kontak' : 'Contact', url: getLocalizedUrl('/contact'), isExternal: false, target: '_self', children: [] },
  ];

  const resolvedNavigation = navigationItems.length > 0 ? navigationItems : fallbackNavItems;

  // DEBUG: Log when brandSettings changes
  useEffect(() => {
    if (brandSettings) {
      console.log('🎨 HEADER RENDER: Brand settings loaded:', {
        brandName: brandSettings.brandName,
        siteLogo: brandSettings.siteLogo,
        siteTagline: brandSettings.siteTagline
      });
    }
  }, [brandSettings]);

  const contactEmail = headerSettings?.contactEmail || brandSettings?.contactEmail || 'info@example.com';

  const getItemTitle = (item: NavItem) => item.title ?? item.label ?? '';

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto mt-4 bg-transparent backdrop-blur-lg border border-white/20 rounded-full shadow-xl">
          <div className="flex items-center justify-between h-16 sm:h-20 px-4 sm:px-6 lg:px-8">
            {/* Left: Logo & title */}
            <div className="flex items-center gap-3">
              <Link href={getLocalizedUrl('/')} className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-900/70 shadow-lg">
                  {brandSettings?.siteLogo || headerSettings?.logo ? (
                    <img
                      src={brandSettings?.siteLogo || headerSettings?.logo}
                      alt={brandSettings?.brandName || headerSettings?.title || 'Logo'}
                      className="w-9 h-9 object-contain rounded-full"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">T</span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col leading-tight">
                  <span className="text-base font-semibold text-white drop-shadow-md">
                    {brandSettings?.brandName || headerSettings?.title || 'Tour & Travel'}
                  </span>
                  <span className="text-[10px] text-gray-200/90 drop-shadow-sm">
                    {brandSettings?.siteTagline || headerSettings?.subtitle || 'Explore Bromo & Ijen — Authentic trips'}
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: navigation (desktop) */}
            <nav className="hidden md:flex items-center gap-4 relative">
              {resolvedNavigation.map((item) => {
                const title = getItemTitle(item);
                if (!title) return null;
                const isOpen = openDropdown === title;
                const hasChildren = Array.isArray(item.children) && item.children.length > 0;

                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => hasChildren && setOpenDropdown(title)}
                    onMouseLeave={() => hasChildren && setOpenDropdown(null)}
                  >
                    {hasChildren ? (
                      <button
                        onClick={() => setOpenDropdown((prev) => (prev === title ? null : title))}
                        className="flex items-center gap-1 text-gray-100 hover:text-white transition-colors text-sm font-medium px-3 py-1.5 rounded-full hover:bg-white/10 backdrop-blur-sm"
                      >
                        {title}
                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                    ) : item.isExternal ? (
                      <a
                        href={item.url ?? '#'}
                        target={item.target ?? '_self'}
                        rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                        className="flex items-center gap-1 text-gray-100 hover:text-white transition-colors text-sm font-medium px-3 py-1.5 rounded-full hover:bg-white/10 backdrop-blur-sm"
                      >
                        {title}
                      </a>
                    ) : (
                      <Link
                        href={item.url ?? '#'}
                        target={item.target && item.target !== '_self' ? item.target : undefined}
                        className="flex items-center gap-1 text-gray-100 hover:text-white transition-colors text-sm font-medium px-3 py-1.5 rounded-full hover:bg-white/10 backdrop-blur-sm"
                      >
                        {title}
                      </Link>
                    )}

                    {hasChildren && (
                      <div
                        className={`absolute left-0 top-full mt-1 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl py-2 min-w-[180px] transition-all duration-150 z-[9999] ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
                      >
                        {item.children?.map((child) => {
                          const childTitle = getItemTitle(child);
                          if (!childTitle) return null;

                          return child.isExternal ? (
                            <a
                              key={child.id || childTitle}
                              href={child.url ?? '#'}
                              target={child.target ?? '_self'}
                              rel={child.target === '_blank' ? 'noopener noreferrer' : undefined}
                              className="block px-4 py-1.5 text-gray-100 hover:bg-white/10 rounded-lg text-sm whitespace-nowrap"
                            >
                              {childTitle}
                            </a>
                          ) : (
                            <Link
                              key={child.id || childTitle}
                              href={child.url ?? '#'}
                              target={child.target && child.target !== '_self' ? child.target : undefined}
                              className="block px-4 py-1.5 text-gray-100 hover:bg-white/10 rounded-lg text-sm whitespace-nowrap"
                            >
                              {childTitle}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Right: contact & language toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden lg:flex items-center space-x-2">
                <Globe className="w-4 h-4 text-white/80" />
                <select
                  value={currentLanguage}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium text-white outline-none hover:bg-white/20"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code} className="text-gray-900">
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <a
                href={`mailto:${contactEmail}`}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 text-xs sm:text-sm font-medium shadow-sm hover:shadow-lg transition-shadow bg-white/10 text-white hover:bg-white/20"
                aria-label="Contact us"
              >
                <Mail className="w-4 h-4" />
                <span>{currentLanguage === 'id' ? 'Kontak' : 'Contact'}</span>
              </a>

              <button
                className="md:hidden p-2 rounded-full hover:bg-white/10"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div
            className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden border-t border-white/20 bg-black/50 backdrop-blur-xl rounded-b-[32px]`}
          >
            <div className="px-4 pt-4 pb-6 space-y-4">
              <div className="flex flex-col gap-3">
                {resolvedNavigation.map((item) => {
                  const title = getItemTitle(item);
                  if (!title) return null;
                  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
                  const isDropdownOpen = openDropdown === title;

                  return (
                    <div key={item.id}>
                      {hasChildren ? (
                        <button
                          onClick={() => setOpenDropdown((prev) => (prev === title ? null : title))}
                          className="w-full flex items-center justify-between gap-2 px-4 py-2 rounded-full font-medium text-white hover:bg-white/10"
                        >
                          {title}
                          <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                      ) : item.isExternal ? (
                        <a
                          href={item.url ?? '#'}
                          target={item.target ?? '_self'}
                          rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                          className="w-full flex items-center justify-between gap-2 px-4 py-2 rounded-full font-medium text-white hover:bg-white/10"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {title}
                        </a>
                      ) : (
                        <Link
                          href={item.url ?? '#'}
                          target={item.target && item.target !== '_self' ? item.target : undefined}
                          className="w-full flex items-center justify-between gap-2 px-4 py-2 rounded-full font-medium text-white hover:bg-white/10"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {title}
                        </Link>
                      )}

                      {hasChildren && isDropdownOpen && (
                        <div className="ml-4 mt-2 space-y-2">
                          {item.children?.map((child) => {
                            const childTitle = getItemTitle(child);
                            if (!childTitle) return null;

                            return child.isExternal ? (
                              <a
                                key={child.id || childTitle}
                                href={child.url ?? '#'}
                                target={child.target ?? '_self'}
                                rel={child.target === '_blank' ? 'noopener noreferrer' : undefined}
                                className="block px-4 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-full"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {childTitle}
                              </a>
                            ) : (
                              <Link
                                key={child.id || childTitle}
                                href={child.url ?? '#'}
                                target={child.target && child.target !== '_self' ? child.target : undefined}
                                className="block px-4 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-full"
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
                })}
              </div>

              <div className="pt-2 border-t border-white/10">
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-white hover:bg-white/10"
                >
                  <Mail className="w-4 h-4" />
                  <span>{currentLanguage === 'id' ? 'Hubungi kami' : 'Contact us'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
