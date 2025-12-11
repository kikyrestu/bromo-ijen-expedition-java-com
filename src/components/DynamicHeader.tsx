'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Mail, ChevronDown, Globe, Phone, ArrowRight, MessageCircle } from 'lucide-react';
import { useLanguage, type Language } from '@/contexts/LanguageContext';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

type NormalizedNavItem = {
  id: string;
  title: string;
  url: string;
  target?: string;
  isExternal?: boolean;
  children: NormalizedNavItem[];
};

const DynamicHeader = ({ lang }: { lang?: string }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerSettings, setHeaderSettings] = useState<any>(null);
  const [brandSettings, setBrandSettings] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const { currentLanguage, setLanguage, t } = useLanguage();
  const { scrollY } = useScroll();
  const pathname = usePathname();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

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
  const whatsappNumber = headerSettings?.whatsappNumber || brandSettings?.whatsappNumber || '';

  const showWhatsApp = headerSettings?.showWhatsApp !== false;
  const showEmail = headerSettings?.showEmail !== false;
  const showLanguageSwitcher = headerSettings?.showLanguageSwitcher !== false;

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

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/80 backdrop-blur-md shadow-lg py-2' 
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <Link href={getLocalizedUrl('/')} className="flex items-center gap-3 group">
              <div className={`relative flex items-center justify-center rounded-xl overflow-hidden transition-all duration-300 ${isScrolled ? 'w-8 h-8 sm:w-10 sm:h-10 shadow-md' : 'w-10 h-10 sm:w-12 sm:h-12 shadow-lg'}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-teal-500 opacity-90 group-hover:opacity-100 transition-opacity" />
                {brandSettings?.siteLogo || headerSettings?.logo ? (
                  <img
                    src={brandSettings?.siteLogo || headerSettings?.logo}
                    alt={brandSettings?.brandName || headerSettings?.title || 'Logo'}
                    className="relative w-full h-full object-cover"
                  />
                ) : (
                  <span className="relative text-white font-bold text-xl">T</span>
                )}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className={`font-bold leading-none transition-all duration-300 ${isScrolled ? 'text-base text-gray-900' : 'text-lg text-white drop-shadow-md'}`}>
                  {getHeaderTitle()}
                </span>
                <span className={`font-medium tracking-wide transition-all duration-300 ${isScrolled ? 'text-[10px] text-gray-500' : 'text-xs text-gray-200 drop-shadow-sm'}`}>
                  {getHeaderSubtitle()}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {topNavigation.map((item) => {
                const hasChildren = item.children.length > 0;
                const isOpen = openDropdown === item.id;
                const isActive = pathname === item.url;

                return (
                  <div
                    key={item.id}
                    className="relative group"
                    onMouseEnter={() => hasChildren && setOpenDropdown(item.id)}
                    onMouseLeave={() => hasChildren && setOpenDropdown(null)}
                  >
                    <Link
                      href={hasChildren ? '#' : item.url}
                      onClick={(e) => {
                        if (hasChildren) e.preventDefault();
                        else handleNavigate();
                      }}
                      className={`
                        flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                        ${isScrolled 
                          ? 'text-gray-700 hover:bg-gray-100 hover:text-blue-600' 
                          : 'text-white/90 hover:bg-white/10 hover:text-white'
                        }
                        ${isActive && !isScrolled ? 'bg-white/10 text-white' : ''}
                        ${isActive && isScrolled ? 'bg-blue-50 text-blue-600' : ''}
                      `}
                    >
                      {item.title}
                      {hasChildren && (
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                      )}
                    </Link>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {hasChildren && isOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-2"
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.id}
                              href={child.url}
                              target={child.target}
                              className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors group/item"
                            >
                              {child.title}
                              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              {showLanguageSwitcher && (
                <div className="hidden lg:flex items-center">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${
                    isScrolled 
                      ? 'border-gray-200 bg-gray-50 text-gray-700' 
                      : 'border-white/20 bg-white/10 text-white backdrop-blur-sm'
                  }`}>
                    <Globe className="w-4 h-4" />
                    <select
                      value={currentLanguage}
                      onChange={(e) => setLanguage(e.target.value as Language)}
                      className="bg-transparent border-none outline-none text-xs font-medium cursor-pointer appearance-none pr-2"
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code} className="text-gray-900">
                          {lang.code.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* WhatsApp Button */}
              {showWhatsApp && whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`hidden sm:flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${
                    isScrolled
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-white text-green-700 hover:bg-gray-100'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              )}

              {/* Contact Button */}
              {showEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className={`hidden sm:flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${
                    isScrolled
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white text-blue-900 hover:bg-gray-100'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>{contactLabel}</span>
                </a>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className={`md:hidden p-2 rounded-full transition-colors ${
                  isScrolled ? 'text-gray-900 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                }`}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl z-[70] overflow-y-auto"
            >
              <div className="p-6 space-y-8">
                {/* Mobile Header */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">{getHeaderTitle()}</span>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Mobile Navigation */}
                <div className="space-y-2">
                  {topNavigation.map((item) => {
                    const hasChildren = item.children.length > 0;
                    const isOpen = openDropdown === item.id;

                    return (
                      <div key={item.id} className="space-y-2">
                        {hasChildren ? (
                          <button
                            onClick={() => setOpenDropdown(isOpen ? null : item.id)}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                          >
                            {item.title}
                            <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                        ) : (
                          <Link
                            href={item.url}
                            onClick={handleNavigate}
                            className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                          >
                            {item.title}
                          </Link>
                        )}

                        <AnimatePresence>
                          {hasChildren && isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 pr-2 space-y-1 pb-2">
                                {item.children.map((child) => (
                                  <Link
                                    key={child.id}
                                    href={child.url}
                                    onClick={handleNavigate}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                    {child.title}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile Footer Actions */}
                <div className="pt-6 border-t border-gray-100 space-y-4">
                  {showLanguageSwitcher && (
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Globe className="w-5 h-5" />
                        <span className="text-sm font-medium">Language</span>
                      </div>
                      <select
                        value={currentLanguage}
                        onChange={(e) => setLanguage(e.target.value as Language)}
                        className="bg-transparent font-semibold text-blue-600 outline-none"
                      >
                        {languages.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {showWhatsApp && whatsappNumber && (
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-green-600 text-white font-semibold shadow-lg shadow-green-200 hover:bg-green-700 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      WhatsApp
                    </a>
                  )}

                  {showEmail && (
                    <a
                      href={`mailto:${contactEmail}`}
                      className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                      {contactLabel}
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default DynamicHeader;
