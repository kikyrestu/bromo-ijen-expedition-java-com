'use client';

import React, { useState } from 'react';
import { useAutoTranslation } from '@/hooks/useAutoTranslation';

interface AutoTranslateButtonProps {
  text: string;
  contentType?: string;
  contentId?: string;
  from?: string;
  to?: string;
  onTranslate?: (translatedText: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export default function AutoTranslateButton({
  text,
  contentType,
  contentId,
  from = 'id',
  to = 'en',
  onTranslate,
  className = '',
  children
}: AutoTranslateButtonProps) {
  const { translateText, translateAndSave, isTranslating, error } = useAutoTranslation();
  const [translatedText, setTranslatedText] = useState<string>('');

  const handleTranslate = async () => {
    try {
      let result: string;
      
      if (contentType && contentId) {
        result = await translateAndSave(text, contentType, contentId, from, to);
      } else {
        result = await translateText(text, from, to);
      }
      
      setTranslatedText(result);
      onTranslate?.(result);
    } catch (err) {
      console.error('Translation failed:', err);
    }
  };

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      'id': 'Indonesia',
      'en': 'English',
      'de': 'Deutsch'
    };
    return languages[code] || code;
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleTranslate}
        disabled={isTranslating || !text.trim()}
        className={`
          inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white
          ${isTranslating 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }
          ${className}
        `}
      >
        {isTranslating ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Translating...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            {children || `Translate to ${getLanguageName(to)}`}
          </>
        )}
      </button>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
          Error: {error}
        </div>
      )}

      {translatedText && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="text-sm text-green-800 font-medium mb-1">
            Translated to {getLanguageName(to)}:
          </div>
          <div className="text-sm text-green-700">
            {translatedText}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(translatedText)}
            className="mt-2 text-xs text-green-600 hover:text-green-800 underline"
          >
            Copy to clipboard
          </button>
        </div>
      )}
    </div>
  );
}
