'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export type BannerLocation =
  | 'landing.hero'
  | 'landing.abovePackages'
  | 'landing.belowPackages'
  | 'landing.belowTestimonials'
  | 'landing.footerPromo'
  | 'blog.hero'
  | 'blog.sidebar'
  | 'blog.postFooter'
  | (string & {});

export type BannerSlotVariant = 'hero' | 'section' | 'compact';

interface BannerSlotProps {
  location: BannerLocation;
  variant?: BannerSlotVariant;
  className?: string;
  limit?: number;
  showWhenEmpty?: boolean;
}

interface BannerPlacementResponse {
  id: string;
  slug: string;
  displayType: string;
  imageUrl?: string | null;
  backgroundColor?: string | null;
  overlayColor?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  isActive: boolean;
  customHtml?: string | null;
  placement: {
    id: string;
    location: string;
    position: number;
    isActive: boolean;
    startDate?: string | null;
    endDate?: string | null;
  };
  meta: {
    createdAt: string;
    updatedAt: string;
  };
}

const VARIANT_STYLES: Record<BannerSlotVariant, { wrapper: string; card: string; content: string; align: 'left' | 'center' }>
  = {
    hero: {
      wrapper: 'mt-12',
      card: 'min-h-[360px] py-20 px-8 md:px-12',
      content: 'max-w-3xl mx-auto text-center',
      align: 'center'
    },
    section: {
      wrapper: 'mt-16',
      card: 'py-14 px-8 md:px-12',
      content: 'max-w-4xl',
      align: 'left'
    },
    compact: {
      wrapper: 'mt-12',
      card: 'py-10 px-6 md:px-10',
      content: 'max-w-3xl',
      align: 'left'
    }
  };

const DEFAULT_BACKGROUND = '#0f172a';
const DEFAULT_OVERLAY = 'rgba(15, 23, 42, 0.55)';

export default function BannerSlot({
  location,
  variant = 'section',
  className = '',
  limit = 1,
  showWhenEmpty = false
}: BannerSlotProps) {
  const { currentLanguage } = useLanguage();
  const [banners, setBanners] = useState<BannerPlacementResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBanners = async (abortController: AbortController) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('location', location);
      if (currentLanguage && currentLanguage !== 'id') {
        params.append('language', currentLanguage);
      }

      const response = await fetch(`/api/banners?${params.toString()}`, {
        method: 'GET',
        signal: abortController.signal,
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch banners (${response.status})`);
      }

      const json = await response.json();
      if (!json.success) {
        throw new Error(json.error || 'Unknown error fetching banners');
      }

      setBanners(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        console.error(`BannerSlot error for ${location}:`, err);
        setError((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchBanners(abortController);

    return () => {
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, currentLanguage]);

  const visibleBanners = useMemo(() => {
    if (!limit || limit <= 0) return banners;
    return banners.slice(0, limit);
  }, [banners, limit]);

  if (loading || error) {
    if (showWhenEmpty) {
      return (
        <section className={`${VARIANT_STYLES[variant].wrapper} ${className}`}>
          <div className="rounded-3xl border border-slate-200/40 bg-slate-900/30 p-8 text-center text-sm text-slate-400">
            {loading ? 'Loading banner…' : 'Banner unavailable'}
          </div>
        </section>
      );
    }
    return null;
  }

  if (!visibleBanners.length && !showWhenEmpty) {
    return null;
  }

  return (
    <section className={`${VARIANT_STYLES[variant].wrapper} ${className}`}>
      <div className="mx-auto w-full max-w-7xl space-y-8">
        {visibleBanners.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/40 bg-slate-900/30 p-8 text-center text-sm text-slate-400">
            No banner configured yet.
          </div>
        ) : (
          visibleBanners.map((banner) => (
            <div
              key={`${banner.placement.id}-${banner.id}`}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900 text-white shadow-[0_25px_60px_-30px_rgba(15,23,42,0.7)]"
              style={{
                backgroundColor: banner.backgroundColor || DEFAULT_BACKGROUND
              }}
            >
              {banner.imageUrl && (
                <>
                  <div className="absolute inset-0">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title || banner.slug}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div
                    className="absolute inset-0"
                    style={{ background: banner.overlayColor || DEFAULT_OVERLAY }}
                  />
                </>
              )}

              <div className={`relative ${VARIANT_STYLES[variant].card}`}>
                {banner.displayType === 'custom' && banner.customHtml ? (
                  <div
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: banner.customHtml }}
                  />
                ) : (
                  <div className="space-y-5">
                    <div
                      className={
                        VARIANT_STYLES[variant].align === 'center'
                          ? `${VARIANT_STYLES[variant].content} mx-auto`
                          : VARIANT_STYLES[variant].content
                      }
                    >
                      {banner.subtitle && (
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
                          {banner.subtitle}
                        </span>
                      )}

                      {banner.title && (
                        <h2
                          className={`mt-2 text-3xl font-semibold tracking-tight md:text-4xl ${
                            VARIANT_STYLES[variant].align === 'center' ? 'text-center' : 'text-left'
                          }`}
                        >
                          {banner.title}
                        </h2>
                      )}

                      {banner.description && (
                        <p
                          className={`text-base text-white/80 md:text-lg ${
                            VARIANT_STYLES[variant].align === 'center' ? 'text-center' : 'text-left'
                          }`}
                        >
                          {banner.description}
                        </p>
                      )}

                      {banner.ctaText && banner.ctaUrl && (
                        <div
                          className={
                            VARIANT_STYLES[variant].align === 'center'
                              ? 'mt-8 flex justify-center'
                              : 'mt-8 flex justify-start'
                          }
                        >
                          <Link
                            href={banner.ctaUrl}
                            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-xl"
                          >
                            <span>{banner.ctaText}</span>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
