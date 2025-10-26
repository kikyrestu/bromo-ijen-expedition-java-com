'use client';

import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: t('footer.home'), href: '#home' },
    { name: t('footer.about'), href: '#about' },
    { name: t('footer.destinations'), href: '#destinations' },
    { name: t('footer.packages'), href: '#packages' },
    { name: t('footer.contact'), href: '#contact' },
  ];

  const destinations = [
    { name: 'Bali', href: '/destinations/bali' },
    { name: 'Raja Ampat', href: '/destinations/raja-ampat' },
    { name: 'Bromo', href: '/destinations/bromo' },
    { name: 'Yogyakarta', href: '/destinations/yogyakarta' },
    { name: 'Lombok', href: '/destinations/lombok' },
  ];

  const packages = [
    { name: 'Bali Paradise', href: '/packages/bali-paradise' },
    { name: 'Java Heritage', href: '/packages/java-heritage' },
    { name: 'Raja Ampat Adventure', href: '/packages/raja-ampat' },
    { name: 'Sumatra Wildlife', href: '/packages/sumatra-wildlife' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/tourntravel' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/tourntravel' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/tourntravel' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/tourntravel' },
  ];

  return (
    <footer id="contact" className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold mb-6">
              Tour<span className="text-orange-400">&</span>Travel
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {t('footer.company_description')}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <MapPin className="w-5 h-5 mr-3 text-orange-400" />
                <span className="text-sm">{t('footer.address')}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="w-5 h-5 mr-3 text-orange-400" />
                <span className="text-sm">{t('footer.phone')}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Mail className="w-5 h-5 mr-3 text-orange-400" />
                <span className="text-sm">{t('footer.email')}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">{t('footer.about')}</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={`quick-link-${index}`}>
                  <a 
                    href={link.href}
                    className="text-gray-300 hover:text-orange-400 transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="text-lg font-semibold mb-6">{t('footer.contact')}</h4>
            <ul className="space-y-3">
              {destinations.map((dest, index) => (
                <li key={`destination-${index}`}>
                  <a 
                    href={dest.href}
                    className="text-gray-300 hover:text-orange-400 transition-colors duration-300 text-sm"
                  >
                    {dest.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Packages */}
          <div>
            <h4 className="text-lg font-semibold mb-6">{t('footer.follow')}</h4>
            <ul className="space-y-3">
              {packages.map((pkg, index) => (
                <li key={`package-${index}`}>
                  <a 
                    href={pkg.href}
                    className="text-gray-300 hover:text-orange-400 transition-colors duration-300 text-sm"
                  >
                    {pkg.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="max-w-md mx-auto text-center">
            <h4 className="text-xl font-semibold mb-4">{t('footer.stay_updated')}</h4>
            <p className="text-gray-300 mb-6 text-sm">
              {t('footer.newsletter_description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder={t('footer.email_placeholder')}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors duration-300"
              />
              <button className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors duration-300">
                {t('footer.subscribe')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-gray-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Copyright */}
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              {t('footer.copyright').replace('{year}', currentYear.toString())}
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={`social-${index}`}
                  href={social.href}
                  className="p-2 bg-gray-800 rounded-full hover:bg-orange-600 transition-colors duration-300"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            {/* Legal Links */}
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-gray-400 hover:text-orange-400 text-sm transition-colors duration-300">
                {t('footer.privacy')}
              </a>
              <a href="/terms" className="text-gray-400 hover:text-orange-400 text-sm transition-colors duration-300">
                {t('footer.terms')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
