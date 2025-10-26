'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { translationService } from '@/lib/translation-service';

// Supported languages
const SUPPORTED_LANGUAGES_ARRAY = ['id', 'en', 'de', 'nl', 'zh'] as const;
export const SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES_ARRAY;
export type Language = typeof SUPPORTED_LANGUAGES_ARRAY[number];
export const DEFAULT_LANGUAGE: Language = 'id';

// Language names for display
export const LANGUAGE_NAMES: Record<Language, string> = {
  id: 'Indonesia',
  en: 'English',
  de: 'Deutsch',
  nl: 'Nederlands',
  zh: '中文'
};

// Translation context interface
interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, fallback?: string) => string;
  isLoading: boolean;
  isTranslating: boolean;
  targetLanguage: Language | null;
  availableLanguages: Language[];
}

// Default translations (fallback)
const DEFAULT_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'hero.title': {
    id: 'Wonderful Indonesia',
    en: 'Wonderful Indonesia',
    de: 'Wunderbares Indonesien',
    nl: 'Prachtig Indonesië',
    zh: '美妙的印尼'
  },
  'destinations.bromo': {
    id: 'Gunung Bromo',
    en: 'Mount Bromo',
    de: 'Mount Bromo',
    nl: 'Mount Bromo',
    zh: '布罗莫山'
  },
  'destinations.ijen': {
    id: 'Kawah Ijen',
    en: 'Ijen Crater',
    de: 'Ijen Krater',
    nl: 'Ijen Krater',
    zh: '伊真火山口'
  },
  'whoami.title': {
    id: 'Tentang Nusantara Tour & Travel',
    en: 'About Nusantara Tour & Travel',
    de: 'Über Nusantara Tour & Travel',
    nl: 'Over Nusantara Tour & Travel',
    zh: '关于努桑塔拉旅游'
  },
  'whoami.button': {
    id: 'Who Am I',
    en: 'Who Am I',
    de: 'Wer bin ich',
    nl: 'Wie ben ik',
    zh: '我是谁'
  },
  'whychoose.title': {
    id: 'Why Choose Us',
    en: 'Why Choose Us',
    de: 'Warum uns wählen',
    nl: 'Waarom ons kiezen',
    zh: '为什么选择我们'
  },
  'whychoose.button': {
    id: 'Why Choose Us',
    en: 'Why Choose Us',
    de: 'Warum uns wählen',
    nl: 'Waarom ons kiezen',
    zh: '为什么选择我们'
  },
  'notification.title': {
    id: '🎉 Penawaran Spesial!',
    en: '🎉 Special Offer!',
    de: '🎉 Sonderangebot!',
    nl: '🎉 Speciale Aanbieding!',
    zh: '🎉 特别优惠！'
  },
  'notification.message': {
    id: 'Dapatkan diskon 20% untuk paket Bromo Ijen!',
    en: 'Get 20% discount on Bromo Ijen packages!',
    de: 'Erhalten Sie 20% Rabatt auf Bromo Ijen Pakete!',
    nl: 'Ontvang 20% korting op Bromo Ijen pakketten!',
    zh: '布罗莫伊真套餐享受20%折扣！'
  },
  // Footer translations
  'footer.about': {
    id: 'Tentang Kami',
    en: 'About Us',
    de: 'Über uns',
    nl: 'Over ons',
    zh: '关于我们'
  },
  'footer.contact': {
    id: 'Kontak',
    en: 'Contact',
    de: 'Kontakt',
    nl: 'Contact',
    zh: '联系我们'
  },
  'footer.follow': {
    id: 'Ikuti Kami',
    en: 'Follow Us',
    de: 'Folgen Sie uns',
    nl: 'Volg ons',
    zh: '关注我们'
  },
  'footer.company_description': {
    id: 'Willkommen bei der Bromo Ijen Tour! Erleben Sie die Schönheit des Mount Bromo und des Ijen-Kraters mit unseren professionellen Tourpaketen.',
    en: 'Welcome to Bromo Ijen Tour! Experience the beauty of Mount Bromo and Ijen Crater with our professional tour packages.',
    de: 'Willkommen bei der Bromo Ijen Tour! Erleben Sie die Schönheit des Mount Bromo und des Ijen-Kraters mit unseren professionellen Tourpaketen.',
    nl: 'Welkom bij Bromo Ijen Tour! Ervaar de schoonheid van Mount Bromo en Ijen Krater met onze professionele tourpakketten.',
    zh: '欢迎来到布罗莫伊真之旅！与我们的专业旅游套餐体验布罗莫山和伊真火山口的美景。'
  },
  'footer.address': {
    id: 'Jl. Sudirman No. 123, Jakarta Pusat, Indonesia',
    en: 'Jl. Sudirman No. 123, Central Jakarta, Indonesia',
    de: 'Jl. Sudirman No. 123, Zentral-Jakarta, Indonesien',
    nl: 'Jl. Sudirman No. 123, Central Jakarta, Indonesië',
    zh: '印度尼西亚雅加达中部苏迪曼街123号'
  },
  'footer.phone': {
    id: '+62 812-3456-7890',
    en: '+62 812-3456-7890',
    de: '+62 812-3456-7890',
    nl: '+62 812-3456-7890',
    zh: '+62 812-3456-7890'
  },
  'footer.email': {
    id: 'info@tourntravel.com',
    en: 'info@tourntravel.com',
    de: 'info@tourntravel.com',
    nl: 'info@tourntravel.com',
    zh: 'info@tourntravel.com'
  },
  'footer.stay_updated': {
    id: 'Tetap Terkini',
    en: 'Stay Updated',
    de: 'Bleiben Sie auf dem Laufenden',
    nl: 'Blijf op de hoogte',
    zh: '保持更新'
  },
  'footer.newsletter_description': {
    id: 'Dapatkan informasi terbaru tentang paket wisata dan penawaran khusus dari kami.',
    en: 'Get the latest information about tour packages and special offers from us.',
    de: 'Erhalten Sie die neuesten Informationen über Reiseangebote und Sonderangebote von uns.',
    nl: 'Ontvang de nieuwste informatie over tourpakketten en speciale aanbiedingen van ons.',
    zh: '获取我们最新的旅游套餐和特别优惠信息。'
  },
  'footer.email_placeholder': {
    id: 'Masukkan email Anda',
    en: 'Enter your email',
    de: 'Geben Sie Ihre E-Mail ein',
    nl: 'Voer uw e-mail in',
    zh: '输入您的邮箱'
  },
  'footer.subscribe': {
    id: 'Berlangganan',
    en: 'Subscribe',
    de: 'Abonnieren',
    nl: 'Abonneren',
    zh: '订阅'
  },
  'footer.copyright': {
    id: '© {year} Tour & Travel Indonesia. Semua hak dilindungi.',
    en: '© {year} Tour & Travel Indonesia. All rights reserved.',
    de: '© {year} Tour & Travel Indonesien. Alle Rechte vorbehalten.',
    nl: '© {year} Tour & Travel Indonesië. Alle rechten voorbehouden.',
    zh: '© {year} Tour & Travel 印度尼西亚。保留所有权利。'
  },
  'footer.privacy': {
    id: 'Kebijakan Privasi',
    en: 'Privacy Policy',
    de: 'Datenschutzrichtlinie',
    nl: 'Privacybeleid',
    zh: '隐私政策'
  },
  'footer.terms': {
    id: 'Syarat Layanan',
    en: 'Terms of Service',
    de: 'Nutzungsbedingungen',
    nl: 'Servicevoorwaarden',
    zh: '服务条款'
  },
  // Quick Links translations
  'footer.home': {
    id: 'Beranda',
    en: 'Home',
    de: 'Startseite',
    nl: 'Home',
    zh: '首页'
  },
  'footer.destinations': {
    id: 'Destinasi',
    en: 'Destinations',
    de: 'Reiseziele',
    nl: 'Bestemmingen',
    zh: '目的地'
  },
  'footer.packages': {
    id: 'Paket',
    en: 'Packages',
    de: 'Pakete',
    nl: 'Pakketten',
    zh: '套餐'
  },
  // Packages section translations
  'packages.title': {
    id: 'Paket Wisata',
    en: 'Tour Packages',
    de: 'Tourpakete',
    nl: 'Tourpakketten',
    zh: '旅游套餐'
  },
  'packages.subtitle': {
    id: 'Paket Unggulan',
    en: 'Top Packages',
    de: 'Top-Pakete',
    nl: 'Top Pakketten',
    zh: '顶级套餐'
  },
  'packages.description': {
    id: 'Temukan destinasi menakjubkan dengan paket wisata yang dirancang khusus untuk Anda',
    en: 'Discover amazing destinations with our carefully crafted tour packages',
    de: 'Entdecken Sie erstaunliche Reiseziele mit unseren sorgfältig gestalteten Tourpaketen',
    nl: 'Ontdek geweldige bestemmingen met onze zorgvuldig samengestelde reispakketten',
    zh: '通过我们精心制作的旅游套餐探索奇妙的目的地'
  },
  'packages.searchPlaceholder': {
    id: 'Cari paket...',
    en: 'Search packages...',
    de: 'Pakete suchen...',
    nl: 'Zoek pakketten...',
    zh: '搜索套餐...'
  },
  // Gallery section translations
  'gallery.title': {
    id: 'Galeri Foto',
    en: 'Photo Gallery',
    de: 'Fotogalerie',
    nl: 'Fotogalerij',
    zh: '照片画廊'
  },
  'gallery.subtitle': {
    id: 'Koleksi Foto',
    en: 'Photo Collection',
    de: 'Fotosammlung',
    nl: 'Fotocollectie',
    zh: '照片收藏'
  },
  'gallery.loading': {
    id: 'Memuat galeri...',
    en: 'Loading gallery...',
    de: 'Galerie wird geladen...',
    nl: 'Galerij laden...',
    zh: '加载画廊中...'
  },
  // Blog section translations
  'blog.title': {
    id: 'Blog & Cerita',
    en: 'Blog & Stories',
    de: 'Blog & Geschichten',
    nl: 'Blog & Verhalen',
    zh: '博客与故事'
  },
  'blog.description': {
    id: 'Tips perjalanan, panduan, dan kisah petualangan dari perjalanan kami',
    en: 'Travel tips, guides, and adventure stories from our journeys',
    de: 'Reisetipps, Führungen und Abenteuergeschichten aus unseren Reisen',
    nl: 'Reistips, gidsen en avonturenverhalen van onze reizen',
    zh: '来自我们旅程的旅行提示、指南和冒险故事'
  },
  'blog.searchPlaceholder': {
    id: 'Cari artikel...',
    en: 'Search articles...',
    de: 'Artikel suchen...',
    nl: 'Zoek artikelen...',
    zh: '搜索文章...'
  },
  // Navigation translations
  'nav.bookNow': {
    id: 'Pesan Sekarang',
    en: 'Book Now',
    de: 'Jetzt buchen',
    nl: 'Boek nu',
    zh: '立即预订'
  },
};

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Language provider props
interface LanguageProviderProps {
  children: React.ReactNode;
  initialLanguage?: Language;
}

// Language provider component
export default function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  const pathname = usePathname();
  const [currentLanguage, setCurrentLanguage] = useState<Language>(initialLanguage || DEFAULT_LANGUAGE);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<Language | null>(null);

  // Extract language from URL path
  useEffect(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const languageFromPath = pathSegments[0] as Language;

    if (SUPPORTED_LANGUAGES.includes(languageFromPath)) {
      setCurrentLanguage(languageFromPath);
    } else {
      setCurrentLanguage(DEFAULT_LANGUAGE);
    }
  }, [pathname]);

  // Load translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      
      try {
        // Fetch translations from database via API
        const response = await fetch(`/api/sections?language=${currentLanguage}`);
        const data = await response.json();
        
        if (data.success) {
          const newTranslations: Record<string, string> = {};
          
          // Process section content translations
          data.data.forEach((section: any) => {
            if (section.translations) {
              Object.entries(section.translations).forEach(([key, value]) => {
                newTranslations[`${section.sectionId}.${key}`] = value as string;
              });
            }
          });
          
          setTranslations(newTranslations);
        } else {
          // Fallback to static translations if API fails
          console.warn('Failed to fetch translations from database, using static fallback');
          const fallbackTranslations: Record<string, string> = {};
          for (const [key, translation] of Object.entries(DEFAULT_TRANSLATIONS)) {
            fallbackTranslations[key] = translation[currentLanguage] || translation[DEFAULT_LANGUAGE] || key;
          }
          setTranslations(fallbackTranslations);
        }
      } catch (error) {
        console.error('Error loading translations:', error);
        // Fallback to static translations
        const fallbackTranslations: Record<string, string> = {};
        for (const [key, translation] of Object.entries(DEFAULT_TRANSLATIONS)) {
          fallbackTranslations[key] = translation[DEFAULT_LANGUAGE] || key;
        }
        setTranslations(fallbackTranslations);
      } finally {
        setIsLoading(false);
        setIsTranslating(false);
        setTargetLanguage(null);
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  // Set language function
  const setLanguage = (language: Language) => {
    if (!SUPPORTED_LANGUAGES.includes(language)) {
      console.warn(`Language ${language} is not supported`);
      return;
    }

    if (language === currentLanguage) {
      return; // No need to change if same language
    }

    // Set loading states
    setIsTranslating(true);
    setTargetLanguage(language);
    
    // Delay the actual language change to show loading
    setTimeout(() => {
      setCurrentLanguage(language);
      // URL update will be handled by useLanguageSwitcher hook
    }, 30);
  };

  // Translation function - prioritize database translations over static
  const t = (key: string, fallback?: string): string => {
    // First try loaded translations from database (from state)
    if (translations[key]) {
      return translations[key];
    }

    // Fallback to DEFAULT_TRANSLATIONS for backward compatibility
    const translation = DEFAULT_TRANSLATIONS[key];
    if (translation) {
      return translation[currentLanguage] || translation[DEFAULT_LANGUAGE] || fallback || key;
    }

    // Final fallback
    return fallback || key;
  };

  const contextValue: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    isLoading,
    isTranslating,
    targetLanguage,
    availableLanguages: [...SUPPORTED_LANGUAGES]
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

// Utility function to get current language from URL (for server-side)
export function getLanguageFromPath(pathname: string): Language {
  const pathSegments = pathname.split('/').filter(Boolean);
  const languageFromPath = pathSegments[0] as Language;

  return SUPPORTED_LANGUAGES.includes(languageFromPath) ? languageFromPath : DEFAULT_LANGUAGE;
}

// Utility function to get language display name
export function getLanguageName(language: Language): string {
  return LANGUAGE_NAMES[language] || language.toUpperCase();
}
