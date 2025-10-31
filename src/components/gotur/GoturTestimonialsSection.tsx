'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Star, Quote, Sparkles, UserCircle } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
  image?: string;
  packageName?: string;
  location?: string;
  status?: string;
  featured?: boolean;
  createdAt?: string;
}

const GoturTestimonialsSection = () => {
  const { currentLanguage } = useLanguage();
  const [sectionContent, setSectionContent] = useState<any>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sectionRes = await fetch(`/api/sections?section=testimonials&language=${currentLanguage}`);
        const sectionJson = await sectionRes.json();
        if (sectionJson.success) {
          setSectionContent(sectionJson.data);
        }

        const displayCount = sectionJson.data?.displayCount || 4;
        const featuredOnly = sectionJson.data?.featuredOnly || false;
        const sortBy = sectionJson.data?.sortBy || 'newest';

        const queryParams = new URLSearchParams();
        queryParams.append('status', 'approved');
        if (featuredOnly) queryParams.append('featured', 'true');
        if (currentLanguage !== 'id') queryParams.append('language', currentLanguage);

        const testimonialsRes = await fetch(`/api/testimonials?${queryParams.toString()}`);
        const testimonialsJson = await testimonialsRes.json();

        if (testimonialsJson.success) {
          let items: Testimonial[] = testimonialsJson.data;

          if (sortBy === 'newest') {
            items = items.sort(
              (a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
            );
          } else if (sortBy === 'rating') {
            items = items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          }

          setTestimonials(items.slice(0, displayCount));
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      }
    };

    fetchData();
  }, [currentLanguage]);

  const content = useMemo(() => {
    return {
      title: sectionContent?.title || 'Traveler Stories',
      subtitle: sectionContent?.subtitle || 'WHAT THEY SAY',
      description:
        sectionContent?.description ||
        'Catatan pengalaman paling berkesan dari para petualang yang mempercayakan perjalanannya kepada kami.',
    };
  }, [sectionContent]);

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,134,96,0.35),rgba(10,10,25,0.9))]" />
      <div className="pointer-events-none absolute -left-16 top-10 h-72 w-72 rounded-full bg-orange-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start">
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-orange-200">
              <Sparkles className="h-4 w-4" />
              {content.subtitle}
            </div>
            <h2 className="text-4xl font-bold leading-tight md:text-5xl">{content.title}</h2>
            <p className="text-base leading-relaxed text-slate-200">{content.description}</p>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/30 text-orange-200">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-200">
                    Kepuasan Tamu
                  </p>
                  <p className="text-2xl font-bold text-white">4.9/5.0</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-300">
                Penilaian rata-rata berdasarkan review perjalanan premium Bromo & Ijen Tour selama 12 bulan
                terakhir.
              </p>
            </div>
          </div>

          <div className="flex-1">
            <div className="grid gap-6 md:grid-cols-2">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="group relative flex h-full flex-col rounded-3xl border border-white/10 bg-white/10 p-6 shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-orange-300/40 hover:bg-white/15"
                >
                  <Quote className="absolute right-6 top-6 h-10 w-10 text-white/10" />
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {testimonial.image ? (
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="h-14 w-14 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                          <UserCircle className="h-9 w-9 text-white/60" />
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white shadow-lg shadow-orange-700/40">
                        {testimonial.rating?.toFixed(1) || '5.0'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-200">
                        {testimonial.packageName || 'Private Journey'}
                      </p>
                      <h3 className="text-lg font-semibold text-white">{testimonial.name}</h3>
                      {testimonial.role && (
                        <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                          {testimonial.role}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="mt-6 flex-1 text-sm leading-relaxed text-white/80">{testimonial.content}</p>
                  {testimonial.location && (
                    <p className="mt-4 text-xs font-medium uppercase tracking-[0.25em] text-white/50">
                      {testimonial.location}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoturTestimonialsSection;

