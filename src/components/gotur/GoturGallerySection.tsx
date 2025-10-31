'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Image as ImageIcon, Camera, Video } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description?: string;
  tags?: string[];
}

const GoturGallerySection = () => {
  const { currentLanguage } = useLanguage();
  const [sectionContent, setSectionContent] = useState<any>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sectionRes = await fetch(`/api/sections?section=gallery&language=${currentLanguage}`);
        const sectionJson = await sectionRes.json();
        if (sectionJson.success) {
          setSectionContent(sectionJson.data);
        }

        const galleryRes = await fetch(`/api/gallery?language=${currentLanguage}`);
        const galleryJson = await galleryRes.json();

        if (galleryJson.success) {
          setItems(galleryJson.data.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching gallery:', error);
      }
    };

    fetchData();
  }, [currentLanguage]);

  const content = useMemo(() => {
    return {
      title: sectionContent?.title || 'Visual Storyline',
      subtitle: sectionContent?.subtitle || 'GALLERY',
      description:
        sectionContent?.description ||
        'Sorotan visual perjalanan eksklusif bersama Nusantara Tour & Travel yang menangkap momen paling autentik.',
    };
  }, [sectionContent]);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(25,54,88,0.65),rgba(8,12,22,1))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/40 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 flex flex-col gap-6 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-orange-200">
            <Camera className="h-4 w-4" />
            {content.subtitle}
          </div>
          <h2 className="text-4xl font-bold leading-tight md:text-5xl">{content.title}</h2>
          <p className="mx-auto max-w-3xl text-base leading-relaxed text-slate-200">
            {content.description}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-12">
          {items.map((item, index) => {
            const isLarge = index === 0 || index === 5;
            const colSpan = isLarge ? 'md:col-span-6' : 'md:col-span-3';

            return (
              <div
                key={item.id}
                className={`${colSpan} group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.08] shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:shadow-2xl`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950/20 via-transparent to-slate-950/60 opacity-0 transition group-hover:opacity-100" />
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full min-h-[220px] w-full items-center justify-center bg-slate-900 text-slate-300">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                    <span>{item.category}</span>
                    {item.tags && item.tags.length > 0 && (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em]">
                        {item.tags[0]}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-white">{item.title}</h3>
                  {item.description && (
                    <p className="mt-2 text-sm leading-relaxed text-white/70 line-clamp-2">{item.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 text-sm text-white/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-orange-200">
              <Video className="h-5 w-5" />
            </div>
            <p className="max-w-sm text-left">
              Temukan lebih banyak dokumentasi perjalanan premium kami, lengkap dengan highlight drone dan cinematic
              shot setiap destinasi.
            </p>
          </div>
          <button className="rounded-full border border-white/20 px-6 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-white transition hover:border-orange-300 hover:bg-orange-400/10">
            View Full Showcase
          </button>
        </div>
      </div>
    </section>
  );
};

export default GoturGallerySection;

