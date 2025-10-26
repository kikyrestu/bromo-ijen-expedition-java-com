'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  slug?: string;
}

export default function GoturTourPackagesSection() {
  const { currentLanguage } = useLanguage();
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch(`/api/packages?status=published&featured=true&language=${currentLanguage}`);
        const data = await response.json();
        if (data.success) {
          setPackages(data.data);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
      }
    };

    fetchPackages();
  }, [currentLanguage]);

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tour Packages
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover amazing destinations with our carefully crafted tour packages
          </p>
        </div>

        {/* Packages Grid - Gotur Style with Tailwind */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <Link 
              key={pkg.id} 
              href={`/${currentLanguage === 'id' ? '' : currentLanguage}/packages/${pkg.slug || pkg.id}`}
              className="group"
            >
              <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col">
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden bg-gray-200">
                  {pkg.image ? (
                    <img 
                      src={pkg.image} 
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-blue-500 flex items-center justify-center">
                      <span className="text-white text-6xl font-bold">B</span>
                    </div>
                  )}
                  
                  {/* Badge Overlay */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Featured
                    </span>
                  </div>

                  {/* Action Buttons Overlay */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
                      <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-grow flex flex-col">
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(pkg.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h1.4c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h1.4a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-sm text-gray-600 ml-2">
                      ({pkg.reviewCount || 0} Review)
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {pkg.title}
                  </h3>

                  {/* Price & Book Button */}
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Per Package</p>
                        <p className="text-2xl font-bold text-orange-600">
                          Rp {pkg.price.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <button className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all group-hover:scale-105 transform">
                        Book Now
                        <svg className="w-4 h-4 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link 
            href={`/${currentLanguage === 'id' ? '' : currentLanguage}/packages`}
            className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold group"
          >
            View All Tours
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

