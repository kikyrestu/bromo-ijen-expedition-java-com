'use client';

import { JSX, useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Sparkles, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type Highlight = {
  title: string;
  description?: string;
  icon?: string;
};

type WhyContent = {
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  features?: Highlight[];
};

const FALLBACK_CONTENT: Required<WhyContent> = {
  title: 'Mengapa Memilih Nusantara Tour & Travel?',
  subtitle: 'Pelayanan Kelas Premium',
  description:
    'Lebih dari satu dekade menghadirkan pengalaman wisata vulkanik terbaik dengan standar keselamatan internasional, layanan personal, dan itinerary fleksibel.',
  image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1600&auto=format&fit=crop',
  features: [
    {
      title: 'Guide Berlisensi',
      description: 'Tim lokal profesional dengan sertifikasi resmi untuk ekspedisi Bromo & Ijen.',
      icon: 'ShieldCheck',
    },
    {
      title: 'Itinerary Eksklusif',
      description: 'Rangkaian perjalanan privat yang disesuaikan dengan preferensi Anda.',
      icon: 'Sparkles',
    },
    {
      title: 'Dukungan 24/7',
      description: 'Concierge travel siap membantu mulai dari perencanaan hingga kepulangan.',
      icon: 'Users',
    },
  ],
};

const iconMap: Record<string, JSX.Element> = {
  ShieldCheck: <ShieldCheck className="h-6 w-6" />,
  Sparkles: <Sparkles className="h-6 w-6" />,
  Users: <Users className="h-6 w-6" />,
};

const resolvedIcon = (key?: string) => iconMap[key ?? ''] ?? <Sparkles className="h-6 w-6" />;

const normalizeImage = (src?: string) => {
  if (!src) return FALLBACK_CONTENT.image;
  if (src.startsWith('http')) return src;
  return src.startsWith('/') ? src : `/${src}`;
};

const GoturHighlightsSection = () => {
  const { currentLanguage } = useLanguage();
  const [content, setContent] = useState<WhyContent>(FALLBACK_CONTENT);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`/api/sections?section=whyChooseUs&language=${currentLanguage}`);
        const json = await res.json();
        if (json?.success && json?.data) {
          setContent((prev) => ({
            ...prev,
            ...json.data,
          }));
        } else {
          setContent(FALLBACK_CONTENT);
        }
      } catch {
        setContent(FALLBACK_CONTENT);
      }
    };

    fetchContent();
  }, [currentLanguage]);

  const highlights = useMemo(
    () => (content.features && content.features.length > 0 ? content.features : FALLBACK_CONTENT.features),
    [content.features]
  );

  const heroImage = normalizeImage(content.image);

  return (
    <section className="relative bg-slate-900 py-20 text-white">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-rose-500 to-sky-500" />
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
        <div className="w-full lg:w-1/2">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-300">
            {content.subtitle || FALLBACK_CONTENT.subtitle}
          </p>
          <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
            {content.title || FALLBACK_CONTENT.title}
          </h2>
          <p className="mt-4 text-lg text-slate-200">
            {content.description || FALLBACK_CONTENT.description}
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {highlights.map((feature, index) => (
              <div
                key={`${feature.title}-${index}`}
                className="group rounded-2xl border border-white/5 bg-white/5 p-6 transition hover:border-orange-400/40 hover:bg-white/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20 text-orange-300">
                  {resolvedIcon(feature.icon)}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
                {feature.description && (
                  <p className="mt-2 text-sm text-slate-200/80">{feature.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="w-full lg:w-1/2">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl shadow-orange-500/10">
            <img
              src={heroImage}
              alt={content.title || FALLBACK_CONTENT.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/60 via-slate-950/10 to-transparent" />
            <div className="absolute bottom-6 right-6 rounded-2xl bg-white/90 px-5 py-4 text-right text-slate-900 shadow-lg shadow-orange-400/20">
              <p className="text-2xl font-bold">98%</p>
              <p className="text-sm font-medium text-slate-600">Traveler Satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoturHighlightsSection;
