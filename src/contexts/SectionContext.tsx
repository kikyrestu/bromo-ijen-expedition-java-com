'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SectionData {
  hero?: any;
  whoAmI?: any;
  whyChooseUs?: any;
  exclusiveDestinations?: any;
  tourPackages?: any;
  testimonials?: any;
  blog?: any;
  gallery?: any;
}

interface SectionContextType {
  sectionData: SectionData;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const SectionContext = createContext<SectionContextType | undefined>(undefined);

interface SectionProviderProps {
  children: ReactNode;
}

export function SectionProvider({ children }: SectionProviderProps) {
  const [sectionData, setSectionData] = useState<SectionData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentLanguage } = useLanguage();

  const fetchAllSections = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Sequential requests with delays to prevent connection pool exhaustion
      const sections = [
        'hero',
        'whoAmI', 
        'whyChooseUs',
        'exclusiveDestinations',
        'tourPackages',
        'testimonials',
        'blog',
        'gallery'
      ];

      const newSectionData: SectionData = {};

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        try {
          const res = await fetch(`/api/sections?section=${section}&language=${currentLanguage}`);
          const data = await res.json();
          
          if (data.success && data.data) {
            newSectionData[section as keyof SectionData] = data.data;
          }
          
          // Add delay between requests to prevent connection pool exhaustion
          if (i < sections.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 150));
          }
        } catch (err) {
          console.error(`Error fetching ${section}:`, err);
          // Continue with other sections even if one fails
        }
      }

      setSectionData(newSectionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSections();
  }, [currentLanguage]);

  const refetch = async () => {
    await fetchAllSections();
  };

  return (
    <SectionContext.Provider value={{ sectionData, loading, error, refetch }}>
      {children}
    </SectionContext.Provider>
  );
}

export function useSections() {
  const context = useContext(SectionContext);
  if (context === undefined) {
    throw new Error('useSections must be used within a SectionProvider');
  }
  return context;
}
