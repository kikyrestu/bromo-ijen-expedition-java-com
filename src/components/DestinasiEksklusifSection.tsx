'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapPin, ArrowRight, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedSection from './AnimatedSection';
import Link from 'next/link';

interface ExclusiveDestItem {
  id?: string;
  name: string;
  location?: string;
  description?: string;
  image?: string;
  featured?: boolean;
  rating?: number;
  reviews?: number;
  tours?: number;
}

interface ExclusiveDestContent {
  title?: string;
  subtitle?: string;
  description?: string;
  destinations?: ExclusiveDestItem[];
  categories?: { id: string; label: string }[];
}

interface DestinasiEksklusifSectionProps {
  overrideContent?: ExclusiveDestContent;
  disableAuto?: boolean;
}

const DestinasiEksklusifSection = ({ overrideContent }: DestinasiEksklusifSectionProps) => {
  const { t, currentLanguage } = useLanguage();
  const [fetched, setFetched] = useState<ExclusiveDestContent | null>(null);
  const [dbDestinations, setDbDestinations] = useState<ExclusiveDestItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  const content = overrideContent || fetched || {
    title: 'Top Destinations',
    subtitle: 'Popular',
    description: 'Explore our carefully curated destinations',
    destinations: []
  };

  const CATEGORIES = (content.categories && content.categories.length > 0) 
    ? content.categories 
    : [
      { id: 'all', label: 'All Destinations' },
      { id: 'Volcano', label: 'Volcanoes' },
      { id: 'Waterfall', label: 'Waterfalls' },
      { id: 'Nature', label: 'Nature' },
      { id: 'Cultural', label: 'Cultural' }
    ];

  useEffect(() => {
    // Fetch section content
    if (!overrideContent) {
      const run = async () => {
        try {
          const res = await fetch(`/api/sections?section=exclusiveDestinations&language=${currentLanguage}`);
          const json = await res.json();
          if (json?.success && json?.data) {
            setFetched(json.data);
          }
        } catch {
          // silent
        }
      };
      run();
    }
  }, [overrideContent, currentLanguage]);

  useEffect(() => {
    // Fetch destinations from DB based on category
    const fetchDestinations = async () => {
      setLoading(true);
      try {
        let url = '/api/destinations?limit=8&featured=true';
        if (activeCategory !== 'all') {
          url += `&category=${activeCategory}`;
        }
        
        const res = await fetch(url);
        const json = await res.json();
        if (json?.success && json?.data) {
          setDbDestinations(json.data);
        }
      } catch (e) {
        console.error("Failed to fetch destinations", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, [activeCategory]);

  const displayDestinations = (content.destinations && content.destinations.length > 0)
    ? content.destinations
    : (dbDestinations.length > 0 
      ? dbDestinations 
      : [
        {
          name: 'Mount Bromo',
          location: 'East Java',
          image: '/assets/bromo-sunrise.jpg',
          rating: 4.9,
          reviews: 128
        },
        {
          name: 'Ijen Crater',
          location: 'Banyuwangi',
          image: '/assets/ijen-crater.jpg',
          rating: 4.8,
          reviews: 96
        },
        {
          name: 'Tumpak Sewu',
          location: 'Lumajang',
          image: '/assets/tumpak-sewu.jpg',
          rating: 4.7,
          reviews: 45
        },
        {
          name: 'Madakaripura',
          location: 'Probolinggo',
          image: 'https://images.unsplash.com/photo-1626714485836-2c23495666b0?q=80&w=2070&auto=format&fit=crop',
          rating: 4.6,
          reviews: 32
        }
      ]);

  return (
    <section className="py-16 md:py-20 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <AnimatedSection animation="fadeInUp">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {content.title || 'Top Destinations'}
            </h2>
            <div className="flex items-center gap-6 text-sm font-medium text-slate-500 overflow-x-auto no-scrollbar pb-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`whitespace-nowrap transition-colors pb-1 border-b-2 ${
                    activeCategory === cat.id
                      ? 'text-orange-600 border-orange-600'
                      : 'text-slate-500 border-transparent hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fadeInLeft" delay={0.2}>
            <Link 
              href="/packages" 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 bg-white text-slate-900 font-medium hover:bg-slate-50 transition-colors text-sm"
            >
              Explore all destinations
            </Link>
          </AnimatedSection>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            // Loading Skeletons
            [...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-2xl bg-slate-200 animate-pulse" />
            ))
          ) : (
            displayDestinations.slice(0, 4).map((dest, index) => (
              <AnimatedSection 
                key={index} 
                animation="fadeInUp" 
                delay={index * 0.1}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-3">
                  <img 
                    src={dest.image} 
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Hover Content */}
                  <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <Link 
                      href={`/packages?search=${encodeURIComponent(dest.name)}`}
                      className="inline-flex items-center justify-center w-full py-2.5 bg-white text-slate-900 rounded-full font-bold text-xs hover:bg-orange-50 transition-colors"
                    >
                      View Packages
                    </Link>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-orange-600 transition-colors">
                  {dest.name}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-slate-500 text-xs">
                    <MapPin className="w-3.5 h-3.5" />
                    {dest.location}
                  </div>
                  {dest.rating && (
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-900">
                      <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                      {dest.rating}
                    </div>
                  )}
                </div>
              </AnimatedSection>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default DestinasiEksklusifSection;
