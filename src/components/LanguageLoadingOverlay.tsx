'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Loader2 } from 'lucide-react';

interface LanguageLoadingOverlayProps {
  isVisible: boolean;
  targetLanguage: string;
}

export default function LanguageLoadingOverlay({ isVisible, targetLanguage }: LanguageLoadingOverlayProps) {
  const getLanguageName = (lang: string) => {
    switch (lang) {
      case 'en': return 'English';
      case 'de': return 'Deutsch';
      case 'id': return 'Bahasa Indonesia';
      default: return lang.toUpperCase();
    }
  };

  const getLanguageFlag = (lang: string) => {
    switch (lang) {
      case 'en': return '🇺🇸';
      case 'de': return '🇩🇪';
      case 'id': return '🇮🇩';
      default: return '🌍';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4"
          >
            <div className="text-center">
              {/* Language Flag and Name */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
              >
                <div className="text-6xl mb-4">
                  {getLanguageFlag(targetLanguage)}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Switching to {getLanguageName(targetLanguage)}
                </h3>
              </motion.div>

              {/* Loading Animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <div className="relative">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                  >
                    <Globe className="w-12 h-12 text-blue-200 mx-auto" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Loading Text */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <p className="text-gray-600 dark:text-gray-300">
                  Translating content...
                </p>
                <div className="flex justify-center space-x-1">
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-blue-600 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-blue-600 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-blue-600 rounded-full"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
