'use client';

import { useState, use, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/static-translations';
import { sanitizeHtml } from '@/lib/html-utils';
import { generateTourPackageSchema } from '@/lib/seo-utils';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Star, 
  Heart, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Minus,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  Share2,
  ChevronDown,
  ChevronUp,
  Mountain,
  Flag,
  FileText,
  Sun,
  Info,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper function to safely parse JSON fields
const safeParse = (value: any, fallback: any = []) => {
  if (!value) return fallback;
  if (Array.isArray(value)) return value; // Already parsed
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
};

interface PackageDetailClientProps {
  params: Promise<{
    id: string;
    lang: string;
  }>;
}

export default function PackageDetailClient({ params }: PackageDetailClientProps) {
  const resolvedParams = use(params);
  const { currentLanguage } = useLanguage();
  const [packageData, setPackageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000));
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappGreeting, setWhatsappGreeting] = useState('Halo Bromo Ijen Tour! 👋');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        if (data.success) {
          setWhatsappNumber(data.data.whatsappNumber || '');
          setWhatsappGreeting(data.data.whatsappGreeting || 'Halo Bromo Ijen Tour! 👋');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  // Fetch package data
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('includeAll', 'true');
        if (currentLanguage !== 'id') {
          queryParams.append('language', currentLanguage);
        }
        
        const response = await fetch(`/api/packages?${queryParams.toString()}`);
        const data = await response.json();
        
        if (data.success) {
          const pkg = data.data.find((p: any) => p.slug === resolvedParams.id || p.id === resolvedParams.id);
          if (pkg) {
            setPackageData(pkg);
          }
        }
      } catch (error) {
        console.error('Error fetching package:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [resolvedParams.id, currentLanguage]);

  // Auto-play gallery
  useEffect(() => {
    if (!packageData || !packageData.gallery || packageData.gallery.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % packageData.gallery.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [packageData]);

  const handleCheckInChange = (newDate: Date) => {
    setCheckInDate(newDate);
    if (checkOutDate <= newDate) {
      const nextDay = new Date(newDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOutDate(nextDay);
    }
  };

  const handleCheckOutChange = (newDate: Date) => {
    if (newDate > checkInDate) {
      setCheckOutDate(newDate);
    }
  };

  const generateWhatsAppLink = () => {
    if (!packageData || !whatsappNumber) return '#';

    const pkg = packageData;
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount);
    };

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    };

    const message = `${whatsappGreeting}

I am interested in booking:
📦 *${pkg.title || pkg.name}*
📍 Location: ${pkg.location || '-'}
📅 Date: ${formatDate(checkInDate)} - ${formatDate(checkOutDate)}
👥 Guests: ${adults} Adults, ${children} Children, ${infants} Infants
💰 Price: ${formatCurrency(pkg.priceRaw || 0)}

Please confirm availability. Thank you! 🙏`;

    return `https://wa.me/62${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-slate-900">
        <div className="text-center">
          <Mountain className="w-24 h-24 text-slate-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">{t('packageNotFound', currentLanguage)}</h1>
          <Link 
            href={`/${currentLanguage}/packages`}
            className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToPackages', currentLanguage) || 'Back to Packages'}
          </Link>
        </div>
      </div>
    );
  }

  const pkg = {
    ...packageData,
    gallery: safeParse(packageData.gallery, []),
    highlights: safeParse(packageData.highlights, []),
    includes: safeParse(packageData.includes, []),
    excludes: safeParse(packageData.excludes, []),
    itinerary: safeParse(packageData.itinerary, []),
    faqs: safeParse(packageData.faqs, []),
    destinations: safeParse(packageData.destinations, []),
  };

  const nextImage = () => {
    if (pkg.gallery.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % pkg.gallery.length);
  };

  const prevImage = () => {
    if (pkg.gallery.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + pkg.gallery.length) % pkg.gallery.length);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 pb-20 font-sans selection:bg-orange-500/30">
      {/* Hero Gallery */}
      <div className="relative h-[70vh] lg:h-[85vh] overflow-hidden">
        <div className="absolute inset-0 bg-slate-900">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={pkg.gallery[currentImageIndex] || pkg.image}
              alt={pkg.title}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-slate-900/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-900/50 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-end pb-12 px-6">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-4 py-1.5 rounded-full bg-orange-500 text-white text-sm font-bold uppercase tracking-wider shadow-lg shadow-orange-500/20">
                  {pkg.tag || 'Adventure'}
                </span>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-white">{pkg.rating}</span>
                  <span className="text-white/80 text-sm">({pkg.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-white">{pkg.location}</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
                {pkg.title}
              </h1>

              <div className="flex flex-wrap gap-6 text-white/90 font-medium">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <span>{pkg.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-400" />
                  <span>Max {pkg.totalPeople} People</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-400" />
                  <span>Daily Departure</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Gallery Controls */}
        <div className="absolute bottom-12 right-6 md:right-12 flex gap-4 z-20">
          <button onClick={prevImage} className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={nextImage} className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors text-white">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-8 relative z-30">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar sticky top-24 z-40 bg-white/80 backdrop-blur-xl p-2 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50">
              {['overview', 'itinerary', 'inclusions', 'faq'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Overview */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-slate-900">
                <Info className="w-6 h-6 text-orange-500" />
                {t('description', currentLanguage)}
              </h2>
              <div 
                className="prose prose-lg max-w-none text-slate-600"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(pkg.longDescription || '') }}
              />

              <div className="mt-8 pt-8 border-t border-slate-100">
                <h3 className="text-lg font-bold mb-4 text-slate-900">{t('highlights', currentLanguage)}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {pkg.highlights.map((highlight: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1 w-5 h-5 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3 h-3 text-orange-500" />
                      </div>
                      <span className="text-slate-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Itinerary */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-900">
                <MapPin className="w-6 h-6 text-orange-500" />
                {t('itinerary', currentLanguage)}
              </h2>
              <div className="space-y-8">
                {pkg.itinerary.map((day: any, index: number) => (
                  <div key={index} className="relative pl-8 md:pl-12 border-l border-slate-200 last:border-0">
                    <div className="absolute left-[-12px] top-0 w-6 h-6 rounded-full bg-white border-2 border-orange-500 flex items-center justify-center z-10">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <h3 className="text-xl font-bold text-slate-900">
                          <span className="text-orange-600 mr-2">Day {index + 1}:</span>
                          {day.title}
                        </h3>
                        <span className="px-3 py-1 rounded-full bg-white text-xs font-medium text-slate-500 border border-slate-200">
                          {day.time}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{day.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Inclusions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-8"
            >
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  {t('includes', currentLanguage)}
                </h3>
                <ul className="space-y-4">
                  {pkg.includes.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-slate-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-600">
                  <XCircle className="w-5 h-5" />
                  {t('excludes', currentLanguage)}
                </h3>
                <ul className="space-y-4">
                  {pkg.excludes.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-slate-600">
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* FAQ */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-slate-900">
                <MessageCircle className="w-6 h-6 text-orange-500" />
                FAQ
              </h2>
              <div className="space-y-4">
                {pkg.faqs.map((faq: any, index: number) => (
                  <div key={index} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-100 transition-colors"
                    >
                      <span className="font-medium text-slate-900">{faq.question}</span>
                      {expandedFAQ === index ? (
                        <ChevronUp className="w-5 h-5 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-500" />
                      )}
                    </button>
                    <AnimatePresence>
                      {expandedFAQ === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-6 pb-6"
                        >
                          <p className="text-slate-600 pt-4 border-t border-slate-200">{faq.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Booking Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/50"
              >
                <div className="mb-6 pb-6 border-b border-slate-100">
                  <p className="text-slate-500 text-sm mb-1">{t('startsFrom', currentLanguage)}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-orange-600">{pkg.price}</span>
                    <span className="text-slate-500 text-sm">/ person</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Travel Dates</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <input
                          type="date"
                          value={checkInDate.toISOString().split('T')[0]}
                          onChange={(e) => handleCheckInChange(new Date(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                        />
                      </div>
                      <div className="relative">
                        <input
                          type="date"
                          value={checkOutDate.toISOString().split('T')[0]}
                          onChange={(e) => handleCheckOutChange(new Date(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Guests</label>
                    <div className="space-y-3">
                      {[
                        { label: 'Adults', val: adults, set: setAdults, min: 1 },
                        { label: 'Children', val: children, set: setChildren, min: 0 },
                        { label: 'Infants', val: infants, set: setInfants, min: 0 }
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <span className="text-sm text-slate-700">{item.label}</span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => item.set(Math.max(item.min, item.val - 1))}
                              className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-600"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-4 text-center text-sm font-medium text-slate-900">{item.val}</span>
                            <button
                              onClick={() => item.set(item.val + 1)}
                              className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-600"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <a
                  href={generateWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 text-center shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>{t('bookViaWhatsApp', currentLanguage)}</span>
                  </div>
                </a>

                <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Secure Booking</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Best Price Guarantee</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    <span>24/7 Customer Support</span>
                  </div>
                </div>
              </motion.div>

              {/* Need Help Card */}
              <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6">
                <h3 className="font-bold text-lg mb-2 text-slate-900">Need Help?</h3>
                <p className="text-slate-600 text-sm mb-4">
                  Not sure which package is right for you? Chat with our travel experts.
                </p>
                <a
                  href={`https://wa.me/62${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 text-sm font-medium hover:text-orange-700 flex items-center gap-1"
                >
                  Chat with us <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
