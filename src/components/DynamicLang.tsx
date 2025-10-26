'use client';

import { useEffect } from 'react';

interface DynamicLangProps {
  lang: string;
}

export default function DynamicLang({ lang }: DynamicLangProps) {
  useEffect(() => {
    console.log('🌍 DynamicLang: Setting language to', lang);
    // Update the html lang attribute on the client side
    document.documentElement.lang = lang;
    console.log('🌍 DynamicLang: HTML lang attribute set to', document.documentElement.lang);
  }, [lang]);

  return null;
}
