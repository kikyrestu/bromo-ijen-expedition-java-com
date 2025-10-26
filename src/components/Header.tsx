'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Globe } from 'lucide-react';

// Safe fallback for pages without LanguageProvider
const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState('id');
  
  const setLanguage = (lang: string) => {
    setCurrentLanguage(lang);
    // Update URL if needed
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (lang === 'id') {
        window.location.href = path.replace(/^\/[a-z]{2}/, '') || '/';
      } else {
        const newPath = `/${lang}${path.replace(/^\/[a-z]{2}/, '')}`;
        window.location.href = newPath;
      }
    }
  };

  return { currentLanguage, setLanguage };
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerSettings, setHeaderSettings] = useState<any>(null);
  const { currentLanguage, setLanguage } = useLanguage();

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

  const getLocalizedUrl = (path: string) => {
    if (currentLanguage === 'id') return path;
    return `/${currentLanguage}${path}`;
  };

  return (
    <>
      {/* Main Header */}
      <header 
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
            : ''
        }`}
        style={!isScrolled ? {
          background: 'rgba(0, 0, 0, 0.0)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          top: 0,
          position: 'fixed',
          border: 'none',
          boxShadow: 'none'
        } : {}}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href={getLocalizedUrl('/')} className="flex items-center group">
                <div className="flex items-center space-x-3">
                  {headerSettings?.logo ? (
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 ${
                      isScrolled 
                        ? 'bg-gradient-to-r from-orange-600 to-blue-600' 
                        : 'bg-white/40 backdrop-blur-sm border border-white/50'
                    }`}>
                      <img 
                        src={headerSettings.logo} 
                        alt="Logo" 
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                  ) : (
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 ${
                      isScrolled 
                        ? 'bg-gradient-to-r from-orange-600 to-blue-600' 
                        : 'bg-white/40 backdrop-blur-sm border border-white/50'
                    }`}>
                      <span className={`font-bold text-xl ${
                        isScrolled ? 'text-white' : 'text-white'
                      }`}>B</span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className={`text-2xl font-bold transition-colors duration-300 ${
                      isScrolled 
                        ? 'bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent' 
                        : 'text-white'
                    }`}>
                      {headerSettings?.title || 'Bromo Ijen'}
                    </span>
                    <span className={`text-xs font-medium -mt-1 transition-colors duration-300 ${
                      isScrolled ? 'text-gray-500' : 'text-white/80'
                    }`}>
                      {headerSettings?.subtitle || 'Adventure Tour'}
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link href={getLocalizedUrl('/')} className={`font-medium transition-all duration-300 hover:scale-105 ${
                isScrolled ? 'text-gray-700 hover:text-orange-600' : 'text-white hover:text-orange-200'
              }`}>
                Home
              </Link>
              <Link href={getLocalizedUrl('/packages')} className={`font-medium transition-all duration-300 hover:scale-105 ${
                isScrolled ? 'text-gray-700 hover:text-orange-600' : 'text-white hover:text-orange-200'
              }`}>
                Packages
              </Link>
              <Link href={getLocalizedUrl('/blog')} className={`font-medium transition-all duration-300 hover:scale-105 ${
                isScrolled ? 'text-gray-700 hover:text-orange-600' : 'text-white hover:text-orange-200'
              }`}>
                Blog
              </Link>
              <Link href={getLocalizedUrl('/contact')} className={`font-medium transition-all duration-300 hover:scale-105 ${
                isScrolled ? 'text-gray-700 hover:text-orange-600' : 'text-white hover:text-orange-200'
              }`}>
                Contact
              </Link>
            </nav>

            {/* Language Selector & CTA Button */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Language Selector */}
              <div className="flex items-center space-x-2">
                <Globe className={`w-4 h-4 ${
                  isScrolled ? 'text-gray-600' : 'text-white/80'
                }`} />
                <select
                  value={currentLanguage}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    isScrolled
                      ? 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      : 'bg-white/40 backdrop-blur-sm border border-white/50 text-white hover:bg-white/50'
                  }`}
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code} className="text-gray-900">
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* CTA Button */}
              <Link href={getLocalizedUrl('/packages')} className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl ${
                isScrolled
                  ? 'bg-gradient-to-r from-orange-600 to-blue-600 text-white hover:from-orange-700 hover:to-blue-700'
                  : 'bg-white/40 backdrop-blur-sm border border-white/50 text-white hover:bg-white/50'
              }`}>
                Book Now
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors duration-300 ${
                isScrolled
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={`lg:hidden transition-all duration-300 ${
            isScrolled 
              ? 'bg-white/95 backdrop-blur-md border-t border-gray-100' 
              : 'bg-black/90 backdrop-blur-md border-t border-white/20'
          }`}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
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
              
              {/* Mobile Language Selector */}
              <div className="px-3 py-2">
                <div className="flex items-center space-x-2">
                  <Globe className={`w-4 h-4 ${
                    isScrolled ? 'text-gray-600' : 'text-white/80'
                  }`} />
                  <select
                    value={currentLanguage}
                    onChange={(e) => setLanguage(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      isScrolled
                        ? 'bg-gray-100 text-gray-700 border border-gray-200'
                        : 'bg-white/20 backdrop-blur-sm border border-white/30 text-white'
                    }`}
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
                  className={`block w-full text-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl ${
                    isScrolled
                      ? 'bg-gradient-to-r from-orange-600 to-blue-600 text-white hover:from-orange-700 hover:to-blue-700'
                      : 'bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;