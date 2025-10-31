'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Mail, ChevronDown, Globe } from 'lucide-react';
import { useLanguage, type Language } from '@/contexts/LanguageContext';

type NormalizedNavItem = {
  id: string;
  title: string;
  url: string;
  target?: string;
  isExternal?: boolean;
  children: NormalizedNavItem[];
};

const DynamicHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerSettings, setHeaderSettings] = useState<any>(null);
  const [brandSettings, setBrandSettings] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const { currentLanguage, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'id', name: 'Bahasa Indonesia', flag: 'ID' },
    { code: 'en', name: 'English', flag: 'EN' },
    { code: 'de', name: 'Deutsch', flag: 'DE' },
    { code: 'zh', name: '中文', flag: 'CN' },
    { code: 'nl', name: 'Nederlands', flag: 'NL' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/sections?section=header&language=${currentLanguage}`);
        const data = await response.json();
        if (data.success) {
          setHeaderSettings(data.data);
        }

        const navResponse = await fetch('/api/navigation/menus?includeItems=true&location=header');
        const navData = await navResponse.json();
        if (navData.success && navData.data?.length) {
          const headerMenu = navData.data[0];
          if (headerMenu?.items) {
            setMenuItems(headerMenu.items);
          }
        }
      } catch (error) {
        console.error('Error fetching header data:', error);
      }
    };

    fetchData();
  }, [currentLanguage]);

  useEffect(() => {
    const fetchBrandSettings = async () => {
      try {
        const response = await fetch('/api/settings', { cache: 'no-store' });
        const data = await response.json();
        if (data.success && data.data) {
          setBrandSettings(data.data);
        }
      } catch (error) {
        console.error('Error fetching brand settings:', error);
      }
    };

    fetchBrandSettings();
  }, []);

  useEffect(() => {
    const getHeroThreshold = () => {
      const hero = document.querySelector('[data-hero-section]') as HTMLElement | null;
      if (hero) {
        return Math.max(hero.offsetHeight * 0.6, 160);
      }
      return 160;
    };

    const handleScroll = () => {
      const threshold = getHeroThreshold();
      setIsScrolled(window.scrollY > threshold);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const getLocalizedUrl = (path: string) => {
    if (currentLanguage === 'id') return path;
    return `/${currentLanguage}${path}`;
  };

  const getMenuTranslation = (item: any, field: 'title' | 'url') => {
    const translation = item.translations?.find((tr: any) => tr.language === currentLanguage);
    if (translation) {
      return translation[field] ?? (field === 'title' ? 'Menu' : '#');
    }

    if (item.translations?.length) {
      return item.translations[0][field] ?? (field === 'title' ? 'Menu' : '#');
    }

    if (field === 'title') return item.title ?? item.label ?? 'Menu';
    return item.url ?? '#';
  };

  const getHeaderTitle = () => {
    if (brandSettings?.brandName) return brandSettings.brandName;
    if (headerSettings?.title) return headerSettings.title;
    const fallbacks: Record<string, string> = {
      id: 'Bromo Ijen',
      en: 'Bromo Ijen',
      de: 'Bromo Ijen',
      nl: 'Bromo Ijen',
      zh: 'Bromo Ijen',
    };
    return fallbacks[currentLanguage] || 'Bromo Ijen';
  };

  const getHeaderSubtitle = () => {
    if (brandSettings?.siteTagline) return brandSettings.siteTagline;
    if (headerSettings?.subtitle) return headerSettings.subtitle;
    const fallbacks: Record<string, string> = {
      id: 'Adventure Tour',
      en: 'Adventure Tour',
      de: 'Abenteuer Tour',
      nl: 'Avontuur Tour',
      zh: '冒险之旅',
    };
    return fallbacks[currentLanguage] || 'Adventure Tour';
  };

  const contactEmail = headerSettings?.contactEmail || brandSettings?.contactEmail || 'info@example.com';

  const normalizeNavItem = (item: any): NormalizedNavItem => {
    const rawTitle = getMenuTranslation(item, 'title') || 'Menu';
    const title = String(rawTitle).trim() || 'Menu';
    const rawUrl = getMenuTranslation(item, 'url') || '#';
    const url = String(rawUrl).trim() || '#';
    const isExternal = item.isExternal ?? /^https?:\/\//.test(url);
    const target = item.target ?? (isExternal ? '_blank' : '_self');

    const children = Array.isArray(item.children)
      ? item.children
          .filter((child: any) => child && child.isActive !== false)
          .map((child: any) => normalizeNavItem(child))
      : [];

    return {
      id: String(item.id ?? item.slug ?? title ?? Math.random().toString(36).slice(2)),
      title,
      url,
      target,
      isExternal,
      children,
    };
  };

  const normalizeMenuItems = (items: any[]): NormalizedNavItem[] =>
    items
      .filter((item) => item && item.isActive && !item.parentId)
      .filter((item, index, self) => index === self.findIndex((candidate) => candidate?.id === item?.id))
      .map((item) => normalizeNavItem(item));

  const fallbackNavItems: NormalizedNavItem[] = [
    { id: 'home', title: currentLanguage === 'id' ? 'Beranda' : 'Home', url: getLocalizedUrl('/'), children: [] },
    { id: 'packages', title: currentLanguage === 'id' ? 'Paket' : 'Packages', url: getLocalizedUrl('/packages'), children: [] },
    { id: 'blog', title: 'Blog', url: getLocalizedUrl('/blog'), children: [] },
    { id: 'contact', title: currentLanguage === 'id' ? 'Kontak' : 'Contact', url: getLocalizedUrl('/contact'), children: [] },
  ];

  const topNavigation: NormalizedNavItem[] =
    menuItems.length > 0 ? normalizeMenuItems(menuItems) : fallbackNavItems;

  const desktopLinkClass =
    'flex items-center gap-1 text-gray-100 hover:text-white transition-colors text-sm font-medium px-3 py-1.5 rounded-full hover:bg-white/10 backdrop-blur-sm';

  const renderNavChild = (node: NormalizedNavItem, onNavigate?: () => void) =>
    node.isExternal ? (
      <a
        key={node.id}
        href={node.url}
        target={node.target || '_self'}
        rel={node.target === '_blank' ? 'noopener noreferrer' : undefined}
        className="block px-4 py-1.5 text-gray-100 hover:bg-white/10 rounded-lg text-sm whitespace-nowrap"
        onClick={onNavigate}
      >
        {node.title}
      </a>
    ) : (
      <Link
        key={node.id}
        href={node.url}
        target={node.target && node.target !== '_self' ? node.target : undefined}
        className="block px-4 py-1.5 text-gray-100 hover:bg-white/10 rounded-lg text-sm whitespace-nowrap"
        onClick={onNavigate}
      >
        {node.title}
      </Link>
    );

  const handleNavigate = () => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
  };

  const contactTranslation = t?.('nav.contact');
  const contactLabel = contactTranslation && contactTranslation !== 'nav.contact'
    ? contactTranslation
    : currentLanguage === 'id'
      ? 'Kontak'
      : 'Contact';
  const contactMobileLabel = contactTranslation && contactTranslation !== 'nav.contact'
    ? contactTranslation
    : currentLanguage === 'id'
      ? 'Hubungi kami'
      : 'Contact us';

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-4 sm:px-6 lg:px-8">
        <div
          className={`max-w-7xl w-full mx-auto mt-4 rounded-full overflow-visible px-6 sm:px-8 lg:px-12 backdrop-blur-lg border transition-all duration-300 ${
            isScrolled ? 'bg-black/80 border-white/30 shadow-2xl' : 'bg-transparent border-white/20 shadow-xl'
          }`}
        >
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <Link href={getLocalizedUrl('/')} className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 shadow-lg">
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
                  <span className="text-base font-semibold text-white drop-shadow-md">{getHeaderTitle()}</span>
                  <span className="text-[10px] text-gray-200/90 drop-shadow-sm">{getHeaderSubtitle()}</span>
                </div>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-4 relative">
              {topNavigation.map((item) => {
                const hasChildren = item.children.length > 0;
                const isOpen = openDropdown === item.id;

                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => hasChildren && setOpenDropdown(item.id)}
                    onMouseLeave={() => hasChildren && setOpenDropdown(null)}
                  >
                    {hasChildren ? (
                      <button
                        type="button"
                        onClick={() => setOpenDropdown((prev) => (prev === item.id ? null : item.id))}
                        className={desktopLinkClass}
                      >
                        {item.title}
                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                    ) : item.isExternal ? (
                      <a
                        href={item.url}
                        target={item.target || '_self'}
                        rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                        className={desktopLinkClass}
                      >
                        {item.title}
                      </a>
                    ) : (
                      <Link
                        href={item.url}
                        target={item.target && item.target !== '_self' ? item.target : undefined}
                        className={desktopLinkClass}
                      >
                        {item.title}
                      </Link>
                    )}

                    {hasChildren && (
                      <div
                        className={`absolute left-0 top-full mt-1 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl py-2 min-w-[180px] transition-all duration-150 z-[9999] ${
                          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
                        }`}
                      >
                        {item.children.map((child) => renderNavChild(child))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

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
                <span>{contactLabel}</span>
              </a>

              <button
                type="button"
                className="md:hidden p-2 rounded-full hover:bg-white/10"
                onClick={() => {
                  setIsMenuOpen((prev) => !prev);
                  setOpenDropdown(null);
                }}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
              </button>
            </div>
          </div>

          <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden border-t border-white/20 bg-black/80 backdrop-blur-xl rounded-b-[32px]`}>
            <div className="px-4 pt-4 pb-6 space-y-4">
              <div className="flex flex-col gap-3">
                {topNavigation.map((item) => {
                  const hasChildren = item.children.length > 0;
                  const isOpen = openDropdown === item.id;

                  if (hasChildren) {
                    return (
                      <div key={item.id}>
                        <button
                          type="button"
                          onClick={() => setOpenDropdown((prev) => (prev === item.id ? null : item.id))}
                          className="w-full flex items-center justify-between gap-2 px-4 py-2 rounded-full font-medium text-white hover:bg-white/10"
                        >
                          {item.title}
                          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="ml-4 mt-2 space-y-2">
                            {item.children.map((child) =>
                              renderNavChild(child, handleNavigate)
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return item.isExternal ? (
                    <a
                      key={item.id}
                      href={item.url}
                      target={item.target || '_self'}
                      rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                      className="w-full flex items-center justify-between gap-2 px-4 py-2 rounded-full font-medium text-white hover:bg-white/10"
                      onClick={handleNavigate}
                    >
                      {item.title}
                    </a>
                  ) : (
                    <Link
                      key={item.id}
                      href={item.url}
                      target={item.target && item.target !== '_self' ? item.target : undefined}
                      className="w-full flex items-center justify-between gap-2 px-4 py-2 rounded-full font-medium text-white hover:bg-white/10"
                      onClick={handleNavigate}
                    >
                      {item.title}
                    </Link>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-white/80" />
                  <select
                    value={currentLanguage}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 font-medium text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code} className="text-gray-900">
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-white hover:bg-white/10"
                >
                  <Mail className="w-4 h-4" />
                  <span>{contactMobileLabel}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default DynamicHeader;
