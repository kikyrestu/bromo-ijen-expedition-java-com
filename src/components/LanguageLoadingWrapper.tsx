'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import LanguageLoadingOverlay from './LanguageLoadingOverlay';

interface LanguageLoadingWrapperProps {
  children: React.ReactNode;
}

export default function LanguageLoadingWrapper({ children }: LanguageLoadingWrapperProps) {
  const { isTranslating, targetLanguage } = useLanguage();

  return (
    <>
      {children}
      <LanguageLoadingOverlay 
        isVisible={isTranslating} 
        targetLanguage={targetLanguage || 'en'} 
      />
    </>
  );
}
