'use client';

import React, { useState } from 'react';
import AutoTranslateButton from '@/components/AutoTranslateButton';

export default function TranslationDemo() {
  const [indonesianText, setIndonesianText] = useState('Selamat datang di Bromo Ijen Tour! Rasakan keindahan Gunung Bromo dan Kawah Ijen dengan paket tur profesional kami.');
  const [englishText, setEnglishText] = useState('');
  const [germanText, setGermanText] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🌍 Realtime Translation Demo
          </h1>
          
          <div className="space-y-6">
            {/* Indonesian Input */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                🇮🇩 Indonesian Text (Original)
              </label>
              <textarea
                value={indonesianText}
                onChange={(e) => setIndonesianText(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ketik teks Indonesia di sini..."
              />
            </div>

            {/* English Translation */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                🇬🇧 English Translation
              </label>
              <div className="flex gap-3">
                <textarea
                  value={englishText}
                  onChange={(e) => setEnglishText(e.target.value)}
                  rows={4}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="English translation will appear here..."
                />
                <div className="flex flex-col gap-2">
                  <AutoTranslateButton
                    text={indonesianText}
                    from="id"
                    to="en"
                    onTranslate={setEnglishText}
                    className="text-sm"
                  >
                    Translate
                  </AutoTranslateButton>
                </div>
              </div>
            </div>

            {/* German Translation */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                🇩🇪 German Translation
              </label>
              <div className="flex gap-3">
                <textarea
                  value={germanText}
                  onChange={(e) => setGermanText(e.target.value)}
                  rows={4}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="German translation will appear here..."
                />
                <div className="flex flex-col gap-2">
                  <AutoTranslateButton
                    text={indonesianText}
                    from="id"
                    to="de"
                    onTranslate={setGermanText}
                    className="text-sm"
                  >
                    Translate
                  </AutoTranslateButton>
                </div>
              </div>
            </div>

            {/* Demo Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                🎯 How to Use Realtime Translation
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Type Indonesian text in the first textarea</li>
                <li>• Click "Translate" buttons to auto-translate to English/German</li>
                <li>• Translations are saved automatically to database</li>
                <li>• Works in CMS for blogs, packages, testimonials, and gallery</li>
                <li>• Fallback to static translations when external APIs fail</li>
              </ul>
            </div>

            {/* API Test */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                🔧 API Test
              </h3>
              <p className="text-sm text-green-800 mb-3">
                Test the translation API directly:
              </p>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                <div className="text-gray-600">POST /api/translate</div>
                <div className="text-gray-800">
                  {`{
  "text": "${indonesianText}",
  "from": "id",
  "to": "en"
}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
