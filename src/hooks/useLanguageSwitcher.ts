'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/contexts/LanguageContext';

export function useLanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { setLanguage: setLanguageContext, isTranslating } = useLanguage();

  const switchLanguage = (language: Language) => {
    // Don't switch if already translating
    if (isTranslating) {
      return;
    }

    // Update language context (this will trigger loading states)
    setLanguageContext(language);
    
    // Update URL after a short delay to allow loading state to show
    setTimeout(() => {
      // Get current path without language prefix
      let currentPath = pathname;
      
      // Remove existing language prefix if present
      const languagePrefix = /^\/[a-z]{2}(\/|$)/;
      if (languagePrefix.test(currentPath)) {
        currentPath = currentPath.replace(languagePrefix, '/');
      }
      
      // Ensure path starts with /
      if (!currentPath.startsWith('/')) {
        currentPath = '/' + currentPath;
      }
      
      // Handle root path
      if (currentPath === '/') {
        currentPath = '';
      }
      
      // Construct new path based on language
      const newPath = language === 'id' ? currentPath || '/' : `/${language}${currentPath}`;
      
      console.log('🔄 Language switch:', { 
        from: pathname, 
        to: newPath, 
        language,
        currentPath,
        timestamp: new Date().toISOString()
      });
      
      // Use Next.js router for navigation
      try {
        router.push(newPath);
      } catch (error) {
        console.error('❌ Router push failed, using window.location:', error);
        // Fallback to window.location if router.push fails
        if (typeof window !== 'undefined') {
          window.location.href = newPath;
        }
      }
    }, 100);
  };

  return { switchLanguage };
}
