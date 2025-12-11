'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { X } from 'lucide-react';
import { ChevronLeft, ChevronRight, ChevronDown, Sun } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedSection from './AnimatedSection';

type Destination = {
  name: string;
  id: string;
  description: string;
  position: { x: number; y: number };
  media?: string; // optional media per destination (image/video)
};

interface HeroSectionProps {
  overrideContent?: {
    title?: string;
    subtitle?: string;
    description?: string;
    backgroundVideo?: string;
    destinations?: Destination[];
  };
  disableAuto?: boolean;
  editable?: boolean;
  onDestinationsChange?: (destinations: Destination[]) => void;
  onAddSpot?: (pos: { x: number; y: number }) => void;
  onDeleteSpot?: (id: string) => void;
  selectedIndex?: number;
  onSelectedIndexChange?: (index: number) => void;
}

const HeroSection = ({ overrideContent, disableAuto = false, editable = false, onDestinationsChange, onAddSpot, onDeleteSpot, selectedIndex, onSelectedIndexChange }: HeroSectionProps) => {
  const { t, currentLanguage } = useLanguage();
  const [currentDestination, setCurrentDestination] = useState(0);
  const [isVideoShaking, setIsVideoShaking] = useState(false);
  const [hoveredSpot, setHoveredSpot] = useState<string | null>(null);
  const [showTitle, setShowTitle] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [localDestinations, setLocalDestinations] = useState<Destination[] | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const localDestLatestRef = useRef<Destination[] | null>(null);

  const [destinations, setDestinations] = useState<Destination[]>([]);

  // Destinations will be loaded from API only - no static fallback
  const [title, setTitle] = useState<string>(overrideContent?.title ?? 'Bromo Ijen Adventure');
  const [subtitle, setSubtitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [backgroundVideo, setBackgroundVideo] = useState<string>(
    overrideContent?.backgroundVideo ?? ''
  );

  const computedDestinations = localDestinations ?? destinations;

  const getSafePos = (d: any): { x: number; y: number } => {
    const rawX = d?.position?.x;
    const rawY = d?.position?.y;
    const xNum = typeof rawX === 'number' ? rawX : parseFloat(rawX ?? '50');
    const yNum = typeof rawY === 'number' ? rawY : parseFloat(rawY ?? '50');
    const x = Number.isNaN(xNum) ? 50 : Math.max(0, Math.min(100, xNum));
    const y = Number.isNaN(yNum) ? 50 : Math.max(0, Math.min(100, yNum));
    return { x, y };
  };

  // Sync external selected index
  useEffect(() => {
    if (typeof selectedIndex === 'number' && computedDestinations.length > 0) {
      const clamped = Math.max(0, Math.min(computedDestinations.length - 1, selectedIndex));
      if (clamped !== currentDestination) setCurrentDestination(clamped);
    }
  }, [selectedIndex, computedDestinations.length]);

  const setSelected = (index: number) => {
    if (onSelectedIndexChange) onSelectedIndexChange(index);
    else setCurrentDestination(index);
  };

  const nextDestination = () => {
    if (computedDestinations.length === 0) return;
    const next = (currentDestination + 1) % computedDestinations.length;
    setSelected(next);
  };

  const prevDestination = () => {
    if (computedDestinations.length === 0) return;
    const prev = (currentDestination - 1 + computedDestinations.length) % computedDestinations.length;
    setSelected(prev);
  };

  // Auto-hide title after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTitle(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch content from CMS sections API (hero) only when no override provided
  useEffect(() => {
    if (overrideContent) return;
    console.log(`🔄 HeroSection: Fetching hero data for language: ${currentLanguage}`);
    const loadHero = async () => {
      try {
        const res = await fetch(`/api/sections?section=hero&language=${currentLanguage}`);
        const data = await res.json();
        if (data?.success && data?.data) {
          const c = data.data;
          console.log(`✅ HeroSection: Loaded hero data for ${currentLanguage}:`, c.title);
          if (c.title) setTitle(c.title);
          if (c.subtitle) setSubtitle(c.subtitle);
          if (c.description) setDescription(c.description);
          if (c.backgroundVideo) setBackgroundVideo(c.backgroundVideo);
          if (Array.isArray(c.destinations)) setDestinations(c.destinations);
        }
      } catch (e) {
        console.error(`❌ HeroSection: Error loading hero data for ${currentLanguage}:`, e);
        // silent fallback to defaults
      }
    };
    loadHero();
  }, [overrideContent, currentLanguage]);

  // Sync when overrideContent changes
  useEffect(() => {
    /* console.log('🎬 HeroSection: Override content changed:', { 
      backgroundVideo: overrideContent?.backgroundVideo,
      title: overrideContent?.title 
    }); */
    if (overrideContent?.destinations) {
      setDestinations(overrideContent.destinations);
    }
    if (typeof overrideContent?.title === 'string') {
      setTitle(overrideContent.title);
    }
    if (typeof overrideContent?.subtitle === 'string') {
      setSubtitle(overrideContent.subtitle);
    }
    if (typeof overrideContent?.description === 'string') {
      setDescription(overrideContent.description);
    }
    if (typeof overrideContent?.backgroundVideo === 'string') {
      setBackgroundVideo(overrideContent.backgroundVideo);
    }
  }, [overrideContent?.destinations, overrideContent?.title, overrideContent?.subtitle, overrideContent?.description, overrideContent?.backgroundVideo]);

  const handleMouseEnter = () => {};
  const handleMouseLeave = () => { setHoveredSpot(null); };

  const handleSpotHover = (spotId: string) => {
    setHoveredSpot(spotId);
  };

  const handleSpotLeave = () => {
    setHoveredSpot(null);
  };

  // Determine effective background source: prefer current destination's media if provided
  const currentDestForBg = computedDestinations[currentDestination];
  // Ensure background path is absolute from root (avoid /[lang]/ prefix)
  const normalizeSrc = (src?: string) => {
    if (!src) return src;
    if (src.startsWith('http')) return src;
    return src.startsWith('/') ? src : `/${src}`;
  };
  const effectiveBgSrc = normalizeSrc((currentDestForBg && currentDestForBg.media) ? currentDestForBg.media : backgroundVideo);
  const isVideoBg = !!effectiveBgSrc && /\.(mp4|webm|ogg)(\?.*)?$/i.test(effectiveBgSrc);

  // Ensure video reloads when source changes
  useEffect(() => {
    if (isVideoBg && videoRef.current) {
      try {
        videoRef.current.load();
        // Best effort autoplay after load
        const playPromise = videoRef.current.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch(() => {});
        }
      } catch (e) {
        // ignore
      }
    }
  }, [effectiveBgSrc, isVideoBg]);

  // Auto-slide based on video duration or fallback to interval
  useEffect(() => {
    if (disableAuto) return;
    
    const video = videoRef.current;
    let interval: NodeJS.Timeout | null = null;
    
    // If video background, use video duration as interval
    if (video && isVideoBg) {
      const setupVideoInterval = () => {
        const videoDuration = video.duration;
        
        // If video duration is valid, use it (in milliseconds)
        if (videoDuration && !isNaN(videoDuration) && videoDuration > 0) {
          console.log(`Video duration: ${videoDuration}s, setting interval to ${videoDuration * 1000}ms`);
          interval = setInterval(nextDestination, videoDuration * 1000);
        } else {
          // Fallback if duration not available yet
          console.log('Video duration not available, using 10s fallback');
          interval = setInterval(nextDestination, 10000);
        }
      };
      
      // Check if video metadata already loaded
      if (video.readyState >= 1) {
        setupVideoInterval();
      } else {
        // Wait for metadata to load
        const handleLoadedMetadata = () => {
          setupVideoInterval();
        };
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        
        // Cleanup listener
        return () => {
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          if (interval) clearInterval(interval);
        };
      }
    } else {
      // For images, use 10 second interval
      interval = setInterval(nextDestination, 10000);
    }
    
    // Cleanup interval
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [disableAuto, computedDestinations.length, isVideoBg, currentDestination]);

  // Clamp current index when list changes
  useEffect(() => {
    if (computedDestinations.length === 0) {
      if (currentDestination !== 0) setCurrentDestination(0);
      return;
    }
    if (currentDestination > computedDestinations.length - 1) {
      setCurrentDestination(computedDestinations.length - 1);
    }
  }, [computedDestinations.length, currentDestination]);

  return (
    <div
      className="relative overflow-hidden"
      data-hero-section
      style={{ marginTop: '-80px', paddingTop: '120px', minHeight: '100vh' }}
      key={`hero-${currentLanguage}`}
    >
      {/* Background Video/Image Canvas */}
      <div className="absolute inset-0 z-0" ref={canvasRef} onDoubleClick={(e) => {
        if (!editable || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
        if (onAddSpot) onAddSpot({ x, y });
      }}>
        {isVideoBg ? (
        <video
            key={effectiveBgSrc}
            ref={videoRef}
            className={`w-full h-full object-cover transition-all duration-1000 ease-in-out animate-fade-in`}
          autoPlay
          muted
          loop
          playsInline
        >
            <source src={effectiveBgSrc} type="video/mp4" />
          </video>
        ) : effectiveBgSrc ? (
          <img
            key={effectiveBgSrc}
            src={effectiveBgSrc}
            alt="Hero Background"
            className={`w-full h-full object-cover transition-all duration-1000 ease-in-out animate-fade-in`}
          />
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-32 h-32 bg-gray-700 rounded-lg mb-4 mx-auto flex items-center justify-center">
                <Sun className="w-16 h-16 text-gray-300" />
              </div>
              <p className="text-xl font-medium">Bromo Sunrise</p>
              <p className="text-sm text-gray-300">Hero Background Placeholder</p>
            </div>
          </div>
        )}
        
        {/* Simple Professional Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70"></div>
      </div>

      {/* Interactive Hotspots */}
      <div className="absolute inset-0 z-15 hidden md:block">
        {editable ? (
          (() => {
            if (computedDestinations.length === 0) return null;
            const idx = currentDestination;
            const dest = computedDestinations[idx];
            if (!dest) return null;
            const pos = getSafePos(dest);
          return (
              <div key={dest.id || idx}
                className="absolute cursor-pointer group"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onMouseEnter={() => handleSpotHover(dest.id)}
                onMouseLeave={handleSpotLeave}
                onPointerDown={(e) => {
                  if (!canvasRef.current) return;
                  e.preventDefault();
                  const startId = dest.id || String(idx);
                  setDraggingId(startId);
                  const rect = canvasRef.current.getBoundingClientRect();

                  const move = (ev: PointerEvent) => {
                    const x = Math.max(0, Math.min(100, ((ev.clientX - rect.left) / rect.width) * 100));
                    const y = Math.max(0, Math.min(100, ((ev.clientY - rect.top) / rect.height) * 100));
                    setLocalDestinations((prev) => {
                      const base = prev || destinations;
                      const next = base.map((d, i) => {
                        if ((d.id || String(i)) === startId) {
                          return { ...d, position: { x, y } };
                        }
                        return d;
                      });
                      localDestLatestRef.current = next;
                      return next;
                    });
                  };
                  const up = () => {
                    window.removeEventListener('pointermove', move);
                    window.removeEventListener('pointerup', up);
                    setDraggingId(null);
                    const updated = (localDestLatestRef.current || localDestinations || destinations);
                    setDestinations(updated);
                    setLocalDestinations(null);
                    localDestLatestRef.current = null;
                    if (onDestinationsChange) onDestinationsChange(updated);
                  };
                  window.addEventListener('pointermove', move);
                  window.addEventListener('pointerup', up, { once: true });
                }}
              >
                {/* Text Only + Background on Hover */}
                <div className="group relative select-none cursor-pointer">
                  {/* Title - Visible by default, HIDDEN on hover */}
                  <div className="px-3 py-2 text-sm sm:text-base font-semibold text-white drop-shadow-lg group-hover:opacity-0 transition-opacity duration-200">
                      {dest.name || 'Destination'}
                    </div>
                  
                  {/* Card with Name + Description (Only on Hover) */}
                  <div className="absolute top-0 left-0 pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out">
                    <div className="w-[280px] bg-black/70 backdrop-blur-xl shadow-2xl border border-white/20 rounded-xl p-4">
                      <h3 className="text-sm sm:text-base font-semibold text-white mb-2">
                        {dest.name || 'Destination'}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                      {dest.description || 'No description'}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Delete button */}
                <button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    if (onDeleteSpot) onDeleteSpot(dest.id || String(idx));
                  }}
                  className="absolute -top-6 -right-6 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete spot"
                >
                  <X className="w-3 h-3" />
                        </button>
                      </div>
            );
          })()
        ) : (
          (() => {
            if (computedDestinations.length === 0) return null;
            const currentDest = computedDestinations[currentDestination];
            if (!currentDest) return null;
            const pos = getSafePos(currentDest);
            return (
              <div key={currentDest.id}>
                {/* Hotspot Marker */}
                <div
                  className="absolute cursor-pointer group"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onMouseEnter={() => handleSpotHover(currentDest.id)}
                  onMouseLeave={handleSpotLeave}
                >
                {/* Text Only + Background on Hover */}
                <div className="group relative select-none cursor-pointer">
                  {/* Title - Visible by default, HIDDEN on hover */}
                  <div className="px-3 py-2 text-sm sm:text-base font-semibold text-white drop-shadow-lg group-hover:opacity-0 transition-opacity duration-200">
                      {currentDest.name || 'Destination'}
                      </div>
                  
                  {/* Card with Name + Description (Only on Hover) */}
                  <div className="absolute top-0 left-0 pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out">
                    <div className="w-[280px] bg-black/70 backdrop-blur-xl shadow-2xl border border-white/20 rounded-xl p-4">
                      <h3 className="text-sm sm:text-base font-semibold text-white mb-2">
                        {currentDest.name || 'Destination'}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                      {currentDest.description || 'No description'}
                      </p>
                    </div>
                  </div>
                </div>

                  {/* Tooltip removed per request */}
                </div>
            </div>
          );
          })()
        )}
      </div>

      {/* Destination Navigation */}
      {computedDestinations.length > 0 && (
        <div className="absolute bottom-6 left-0 right-0 z-20 px-4">
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <button
              type="button"
              onClick={prevDestination}
              disabled={computedDestinations.length <= 1}
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="relative flex-1 px-4 py-6">
              <div className="absolute left-6 right-6 top-6 h-px bg-white/25" />
              <div className="flex items-start justify-between gap-4">
                {computedDestinations.map((dest, index) => {
                  const key = dest?.id ?? `dest-${index}`;
                  const name = dest?.name || `Destination ${index + 1}`;
                  const isActive = index === currentDestination;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelected(index)}
                      className={`relative flex-1 min-w-[80px] px-2 pt-8 pb-2 text-center transition-all duration-300 ${
                        isActive ? 'text-white' : 'text-white/60 hover:text-white/85'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-1/2 -top-4 -translate-x-1/2 text-white drop-shadow-lg">
                          <ChevronDown className="w-4 h-4" />
                        </span>
                      )}
                      <span
                        className={`block text-xs sm:text-sm md:text-base tracking-wide uppercase transition-all duration-300 ${
                          isActive ? 'font-semibold drop-shadow-lg' : 'font-medium'
                        }`}
                      >
                        {name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={nextDestination}
              disabled={computedDestinations.length <= 1}
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Subtle Center Content - Auto-hide after 5 seconds with fade animation */}
      <div className={`absolute inset-0 z-10 flex items-center justify-center px-4 transition-opacity duration-1000 ${
        showTitle ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <AnimatedSection animation="fadeInUp" delay={0.3} duration={1.2}>
          <div className="text-center text-white">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-2 sm:mb-4 opacity-90">
              {overrideContent?.title || title || t('hero.title')}
            </h1>
            {subtitle && (
              <h2 className="text-lg sm:text-xl md:text-2xl font-medium mb-2 sm:mb-4 opacity-85">
                {subtitle}
              </h2>
            )}
            {description && (
              <div 
                className="text-sm sm:text-base md:text-lg opacity-80 max-w-3xl mx-auto mb-4 [&>p]:mb-2 last:[&>p]:mb-0"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}
            <p className="text-base sm:text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
              {computedDestinations[currentDestination]?.name || ''}
            </p>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default HeroSection;