'use client';

import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: t('footer.home'), href: '/' },
    { name: t('footer.about'), href: '/#about' },
    { name: t('footer.destinations'), href: '/packages' },
    { name: t('footer.packages'), href: '/packages' },
    { name: t('footer.contact'), href: '/#contact' },
  ];

  const destinations = [
    { name: 'Bromo Tours', href: '/packages' },
    { name: 'Ijen Crater', href: '/packages' },
    { name: 'Tumpak Sewu', href: '/packages' },
    { name: 'Madakaripura', href: '/packages' },
    { name: 'Combo Packages', href: '/packages' },
  ];

  const packages = [
    { name: 'Bromo Sunrise', href: '/packages' },
    { name: 'Ijen Blue Fire', href: '/packages' },
    { name: 'Bromo Ijen Combo', href: '/packages' },
    { name: 'Tumpak Sewu Waterfall', href: '/packages' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com' },
  ];

  return (
    <footer id="contact" className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-4">
              Tour<span className="text-orange-400">&</span>Travel
            </h3>
            <p className="text-gray-300 mb-4 leading-relaxed text-sm">
              {t('footer.company_description')}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center text-gray-300">
                <MapPin className="w-4 h-4 mr-3 text-orange-400" />
                <span className="text-xs">{t('footer.address')}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="w-4 h-4 mr-3 text-orange-400" />
                <span className="text-xs">{t('footer.phone')}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Mail className="w-4 h-4 mr-3 text-orange-400" />
                <span className="text-xs">{t('footer.email')}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-semibold mb-4">{t('footer.about')}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={`quick-link-${index}`}>
                  <a 
                    href={link.href}
                    className="text-gray-300 hover:text-orange-400 transition-colors duration-300 text-xs"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="text-base font-semibold mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-2">
              {destinations.map((dest, index) => (
                <li key={`destination-${index}`}>
                  <a 
                    href={dest.href}
                    className="text-gray-300 hover:text-orange-400 transition-colors duration-300 text-xs"
                  >
                    {dest.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Packages */}
          <div>
            <h4 className="text-base font-semibold mb-4">{t('footer.follow')}</h4>
            <ul className="space-y-2">
              {packages.map((pkg, index) => (
                <li key={`package-${index}`}>
                  <a 
                    href={pkg.href}
                    className="text-gray-300 hover:text-orange-400 transition-colors duration-300 text-xs"
                  >
                    {pkg.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md mx-auto text-center">
            <h4 className="text-lg font-semibold mb-3">{t('footer.stay_updated')}</h4>
            <p className="text-gray-300 mb-5 text-xs">
              {t('footer.newsletter_description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder={t('footer.email_placeholder')}
                className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors duration-300 text-sm"
              />
              <button className="px-5 py-2.5 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors duration-300 text-sm">
                {t('footer.subscribe')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-gray-950 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Copyright */}
            <div className="text-gray-400 text-xs mb-4 md:mb-0">
              {t('footer.copyright').replace('{year}', currentYear.toString())}
            </div>

            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <a
                  key={`social-${index}`}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-gray-800 rounded-full hover:bg-orange-600 transition-colors duration-300"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* Legal Links */}
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="/privacy-policy" className="text-gray-400 hover:text-orange-400 text-xs transition-colors duration-300">
                {t('footer.privacy')}
              </a>
              <a href="/terms-of-service" className="text-gray-400 hover:text-orange-400 text-xs transition-colors duration-300">
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
