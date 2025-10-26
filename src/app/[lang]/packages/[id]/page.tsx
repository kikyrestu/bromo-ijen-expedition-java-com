'use client';

import { useState, use, useEffect } from 'react';
import Head from 'next/head';
import DynamicHeader from '@/components/DynamicHeader';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { generateTourPackageSchema } from '@/lib/seo-utils';
import { sanitizeHtml } from '@/lib/html-utils';
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
  Phone,
  Mail,
  MessageCircle,
  Share2,
  ChevronDown,
  ChevronUp,
  Mountain,
  Flag,
  FileText,
  Sun
} from 'lucide-react';

const PackageDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  const [packageData, setPackageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('2025-10-19');
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)); // +2 days
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(1);
  const [infants, setInfants] = useState(1);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappGreeting, setWhatsappGreeting] = useState('Halo Bromo Ijen Tour! 👋');
  const [seoData, setSeoData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  // Fetch WhatsApp settings and SEO data
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        if (data.success) {
          setWhatsappNumber(data.data.whatsappNumber || '');
          setWhatsappGreeting(data.data.whatsappGreeting || 'Halo Bromo Ijen Tour! 👋');
          setSettings(data.data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  // Fetch SEO data when package is loaded
  useEffect(() => {
    if (packageData?.slug) {
      const fetchSeoData = async () => {
        try {
          const seoRes = await fetch(`/api/seo?pageType=package&pageSlug=${packageData.slug}`);
          const seoJson = await seoRes.json();
          if (seoJson.success) {
            setSeoData(seoJson.data);
          }
        } catch (error) {
          console.error('Error fetching SEO data:', error);
        }
      };
      fetchSeoData();
    }
  }, [packageData]);

  // Auto-play gallery
  useEffect(() => {
    if (!packageData || !packageData.gallery || packageData.gallery.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % packageData.gallery.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [packageData]);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await fetch(`/api/packages?includeAll=true`);
        const data = await response.json();
        
        if (data.success) {
          // Try to find by slug first, fallback to ID for backward compatibility
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
  }, [resolvedParams.id]);

  // Helper functions for date formatting
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getDayName = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  // Date validation
  const handleCheckInChange = (newDate: Date) => {
    setCheckInDate(newDate);
    // If check-out is before or same as check-in, update it to be 1 day after
    if (checkOutDate <= newDate) {
      const nextDay = new Date(newDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOutDate(nextDay);
    }
  };

  const handleCheckOutChange = (newDate: Date) => {
    // Only allow check-out if it's after check-in
    if (newDate > checkInDate) {
      setCheckOutDate(newDate);
    }
  };

  // Generate WhatsApp booking link
  const generateWhatsAppLink = () => {
    if (!packageData || !whatsappNumber) {
      return '#'; // Fallback if no data
    }

    const pkg = packageData;
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount);
    };

    const formatDate = (dateString: string) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    };

    // Build message
    const message = `${whatsappGreeting}

Saya tertarik dengan paket tour:

📦 *${pkg.title || pkg.name}*
📍 Lokasi: ${pkg.location || (pkg.destinations && pkg.destinations[0]) || '-'}
⏱️ Durasi: ${pkg.duration || '-'}
📅 Keberangkatan: ${formatDate(pkg.departure)}
🔙 Kepulangan: ${formatDate(pkg.return)}
👥 Maks Peserta: ${pkg.totalPeople || '-'} orang
💰 Harga: ${formatCurrency(pkg.price)}

Bisa minta info lebih lanjut dan ketersediaan tanggal?

Terima kasih! 🙏`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Generate WhatsApp link
    return `https://wa.me/62${whatsappNumber}?text=${encodedMessage}`;
  };

  // Loading state
  if (loading) {
    return (
      <div>
        <DynamicHeader />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading package details...</p>
          </div>
        </div>
      </div>
    );
  }

  // 404 state
  if (!packageData) {
    return (
      <div>
        <DynamicHeader />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Mountain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Package Not Found</h2>
            <p className="text-gray-600">The package you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }


  // Ensure arrays exist and have default values
  const pkg = {
    ...packageData,
    gallery: packageData.gallery || [],
    highlights: packageData.highlights || [],
    includes: packageData.includes || [],
    excludes: packageData.excludes || [],
    itinerary: packageData.itinerary || [],
    faqs: packageData.faqs || [],
    destinations: packageData.destinations || [],
    reviews: [] // Reviews not yet implemented in CMS
  };

  // SEO Data
  const title = seoData?.title || `${pkg.title || pkg.name} | Bromo Ijen Tour`;
  const description = seoData?.description || pkg.description?.substring(0, 160) || 'Book your dream volcano tour with expert guides';
  const keywords = seoData?.keywords || `${pkg.title}, bromo tour, ijen tour, volcano tour`;
  const canonicalUrl = seoData?.canonicalUrl || `${settings?.siteUrl}/packages/${pkg.slug}`;
  const ogImage = seoData?.ogImage || pkg.image || settings?.defaultOgImage;
  const siteName = settings?.siteName || 'Bromo Ijen Tour & Travel';
  const siteUrl = settings?.siteUrl || 'https://bromoijen.com';

  // Generate JSON-LD Schema
  const tourPackageSchema = generateTourPackageSchema(pkg, siteUrl);

  const faqToggle = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
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
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Robots */}
        <meta name="robots" content={pkg.status === 'published' ? 'index,follow' : 'noindex,nofollow'} />
        
        {/* Open Graph */}
        <meta property="og:type" content="product" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content={siteName} />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={ogImage} />
      </Head>

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tourPackageSchema) }}
      />

    <div className="min-h-screen flex flex-col bg-gray-50">
      <DynamicHeader />
      <main className="flex-grow pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <div className="mb-8">
            <Breadcrumbs items={[
              { name: 'Tour Packages', url: '/packages' },
              { name: pkg.title || pkg.name, url: `/packages/${pkg.slug}` }
            ]} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Main Image & Gallery */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="relative">
                  {/* Full Background Image */}
                  <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                    {pkg.gallery && pkg.gallery.length > 0 && pkg.gallery[currentImageIndex] ? (
                      <img
                        src={pkg.gallery[currentImageIndex]}
                        alt={`${pkg.name || pkg.title} - Image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Mountain className="w-16 h-16 mb-2 mx-auto" />
                          <p className="text-sm">No Image Available</p>
                        </div>
                      </div>
                    )}
                  </div>
                
                {/* Navigation Arrows */}
                {pkg.gallery && pkg.gallery.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-3 text-white hover:bg-white/30 transition-all duration-300 shadow-2xl"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-3 text-white hover:bg-white/30 transition-all duration-300 shadow-2xl"
                    >
                      <ChevronRight className="w-6 h-6" />
                  </button>
                  </>
                )}

                {/* Gallery Counter */}
                {pkg.gallery && pkg.gallery.length > 0 && (
                  <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md rounded-xl px-4 py-2 text-sm font-semibold text-white">
                    {currentImageIndex + 1} / {pkg.gallery.length}
                </div>
                )}

                {/* Thumbnails Overlay - Right Side */}
                {pkg.gallery && pkg.gallery.length > 0 && (
                <div className="absolute top-4 right-4 w-32 flex flex-col items-center space-y-2">
                  {/* Thumbnails */}
                    {pkg.gallery.slice(0, 4).map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-20 h-20 rounded-xl overflow-hidden transition-all duration-300 ${
                        currentImageIndex === index 
                            ? 'ring-2 ring-white shadow-2xl' 
                            : 'hover:shadow-xl ring-1 ring-white/30'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                    </button>
                  ))}
                </div>
                )}
              </div>
            </div>

            {/* Package Header Info - DI BAWAH MAIN IMAGE - POLOSAN */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h1 className="text-xl font-bold text-gray-900">{pkg.title}</h1>
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Verified
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-red-500 rounded-sm flex items-center justify-center">
                        <Flag className="w-2 h-2 text-white" />
                      </div>
                      <span className="text-gray-700">{pkg.tag}</span>
                    </div>
                    <div className="w-px h-3 bg-gray-300"></div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-gray-700" />
                      <span className="text-gray-700">{pkg.location}</span>
                      <button className="text-red-500 hover:underline text-sm">View Location</button>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="bg-yellow-400 text-white px-2 py-1 rounded text-xs font-semibold">
                        {pkg.rating}/5.0
                      </span>
                      <span className="text-gray-600 text-sm">({pkg.reviewCount} Reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="w-7 h-7 bg-gray-100 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-200">
                    <svg className="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.632-2.316 3 3 0 00-5.632 2.316z" />
                    </svg>
                  </button>
                  <button className="px-3 py-1 bg-white border border-gray-300 rounded-full flex items-center space-x-1 hover:bg-gray-50">
                    <Heart className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-gray-700">Save</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Description</h2>
              <div 
                className="text-gray-700 leading-relaxed mb-4 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(pkg.longDescription || '') }}
              />
              <button className="text-red-500 hover:underline font-medium">Show More</button>
            </div>

            {/* Highlights */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Highlights</h2>
              <div className="space-y-3">
                {pkg.highlights.map((highlight: string, index: number) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-red-500 rounded-sm flex items-center justify-center flex-shrink-0">
                      <FileText className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Itinerary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Itinerary</h2>
              <div className="space-y-6">
                {pkg.itinerary.map((day: any, index: number) => (
                  <div key={index} className="flex items-start space-x-4">
                    {/* Timeline Badge */}
                    <div className="flex-shrink-0 relative">
                      <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{(index + 1).toString().padStart(2, '0')}</span>
                      </div>
                      {/* Timeline Line */}
                      {index < pkg.itinerary.length - 1 && (
                        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-px h-20 bg-gray-300 border-l border-dashed"></div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 flex items-start space-x-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{day.day}, {day.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{day.date}, {day.time}</p>
                        <p className="text-gray-700 leading-relaxed text-sm">{day.description}</p>
                      </div>
                      
                      {/* Circular Image */}
                      <div className="flex-shrink-0">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-gradient-to-br from-orange-400 to-red-500' :
                          index === 1 ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                          index === 2 ? 'bg-gradient-to-br from-green-400 to-green-600' :
                          'bg-gradient-to-br from-purple-400 to-purple-600'
                        }`}>
                          {index === 0 ? <Mountain className="w-8 h-8 text-white" /> :
                           index === 1 ? <Sun className="w-8 h-8 text-white" /> :
                           index === 2 ? <MapPin className="w-8 h-8 text-white" /> :
                           <Users className="w-8 h-8 text-white" />}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Includes & Excludes */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Includes</h3>
                  <div className="space-y-3">
                    {pkg.includes.map((item: string, index: number) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-900">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Excludes</h3>
                  <div className="space-y-3">
                    {pkg.excludes.map((item: string, index: number) => (
                      <div key={index} className="flex items-center space-x-3">
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <span className="text-gray-900">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>


            {/* Location Map */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Location</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{pkg.location}</span>
                </div>
              </div>
              {pkg.mapEmbedUrl ? (
                <div className="relative w-full overflow-hidden rounded-lg border border-gray-200">
                  <div className="aspect-video">
                    <iframe
                      src={pkg.mapEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center border border-gray-200">
                  <div className="text-center text-white">
                    <MapPin className="w-12 h-12 mx-auto mb-2 text-white/80" />
                    <p className="font-medium text-white">Map Not Available</p>
                    <p className="text-sm text-gray-300 mt-1">Location: {pkg.location}</p>
                  </div>
                </div>
              )}
              {pkg.mapEmbedUrl && (
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pkg.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-red-500 hover:underline font-medium"
                >
                  View in Google Maps →
                </a>
              )}
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {pkg.faqs.map((faq: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => faqToggle(index)}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      {expandedFAQ === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                    {expandedFAQ === index && (
                      <div className="px-4 pb-4">
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Reviews ({pkg.reviewCount})</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Customer Reviews & Ratings</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-bold text-gray-900">{pkg.rating}/5.0</span>
                  </div>
                  <span className="text-sm text-gray-600">Based On {pkg.reviewCount} Reviews</span>
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="mb-6">
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center space-x-3">
                      <span className="text-sm w-8">{rating}</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${rating === 5 ? 80 : rating === 4 ? 15 : rating === 3 ? 3 : rating === 2 ? 1 : 1}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">
                        {rating === 5 ? '80%' : rating === 4 ? '15%' : rating === 3 ? '3%' : rating === 2 ? '1%' : '1%'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-4">
                {pkg.reviews.slice(0, 4).map((review: any, index: number) => (
                  <div key={index} className="border-b border-gray-200 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">{review.name}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{review.date}</span>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm">{review.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">{review.comment}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <button className="hover:text-orange-600">Like</button>
                      <button className="hover:text-orange-600">Dislike</button>
                      <button className="hover:text-orange-600">Reply</button>
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-4 text-red-500 hover:underline font-medium">
                See all {pkg.reviewCount} reviews
              </button>
            </div>
          </div>

          {/* Right Column - Booking & Info */}
          <div className="space-y-6">
            {/* Tour Details Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Tour Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-900">{pkg.departure && pkg.return ? `${pkg.departure} - ${pkg.return}` : 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Destination:</span>
                  <span className="font-medium text-gray-900">{pkg.location || (pkg.destinations && pkg.destinations[0]) || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-900">{pkg.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Departure:</span>
                  <span className="font-medium text-gray-900">{pkg.departure}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Return:</span>
                  <span className="font-medium text-gray-900">{pkg.return}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Peoples:</span>
                  <span className="font-medium text-gray-900">{pkg.totalPeople}</span>
                </div>
              </div>
            </div>

            {/* Booking Section - ALL IN ONE CONTAINER */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Starts From */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Starts From</h3>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-bold text-red-500">{pkg.price || 'Contact us'}</span>
                  <span className="text-sm text-gray-500">/ Person</span>
                </div>
              </div>

              {/* Select Date */}
              <div className="mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">From</label>
                    <div>
                      <input
                        type="date"
                        value={checkInDate.toISOString().split('T')[0]}
                        onChange={(e) => handleCheckInChange(new Date(e.target.value))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">To</label>
                    <div>
                      <input
                        type="date"
                        value={checkOutDate.toISOString().split('T')[0]}
                        onChange={(e) => handleCheckOutChange(new Date(e.target.value))}
                        min={new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Adults</label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center border border-gray-300"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-12 text-center font-medium text-gray-900 bg-white border border-gray-300 rounded-lg py-2">{adults.toString().padStart(2, '0')}</span>
                      <button
                        onClick={() => setAdults(adults + 1)}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center border border-gray-300"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Infants (0-12 Yrs)</label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setInfants(Math.max(0, infants - 1))}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center border border-gray-300"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-12 text-center font-medium text-gray-900 bg-white border border-gray-300 rounded-lg py-2">{infants.toString().padStart(2, '0')}</span>
                      <button
                        onClick={() => setInfants(infants + 1)}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center border border-gray-300"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Children (2-12 Yrs)</label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center border border-gray-300"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-12 text-center font-medium text-gray-900 bg-white border border-gray-300 rounded-lg py-2">{children.toString().padStart(2, '0')}</span>
                      <button
                        onClick={() => setChildren(children + 1)}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center border border-gray-300"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Book Now Button */}
              <a
                href={generateWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-300 text-center"
              >
                <div className="flex items-center justify-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Book via WhatsApp</span>
                </div>
              </a>
            </div>

            {/* Why Book With Us */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4">Why Book With Us</h3>
              <div className="space-y-3">
                {[
                  'Expertise and Experience',
                  'Tailored Services',
                  'Comprehensive Planning',
                  'Client Satisfaction',
                  '24/7 Support'
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Provider Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4">Provider Details</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">{settings?.providerName || 'Bromo Ijen Tour'}</h4>
                    <p className="text-sm text-gray-600">Member Since: {settings?.memberSince || '14 May 2024'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-900">{settings?.providerPhone || '+62 812-3456-7890'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-900">{settings?.providerEmail || 'info@bromotour.com'}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => window.open(generateWhatsAppLink(), '_blank')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Us</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </main>
      <Footer />
    </div>
    </>
  );
};

export default PackageDetailPage;
