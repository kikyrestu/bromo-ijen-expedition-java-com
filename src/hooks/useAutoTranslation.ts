import { useState, useCallback } from 'react';

interface TranslationResult {
  success: boolean;
  originalText: string;
  translatedText: string;
  from: string;
  to: string;
  timestamp: string;
}

interface UseAutoTranslationReturn {
  translateText: (text: string, from?: string, to?: string) => Promise<string>;
  translateAndSave: (text: string, contentType: string, contentId: string, from?: string, to?: string) => Promise<string>;
  isTranslating: boolean;
  error: string | null;
}

export function useAutoTranslation(): UseAutoTranslationReturn {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translateText = useCallback(async (
    text: string, 
    from: string = 'id', 
    to: string = 'en'
  ): Promise<string> => {
    if (!text || text.trim().length === 0) {
      return text;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          from,
          to
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.status}`);
      }

      const result: TranslationResult = await response.json();
      
      if (result.success) {
        return result.translatedText;
      } else {
        throw new Error('Translation was not successful');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      console.error('Translation error:', err);
      return text; // Return original text on error
    } finally {
      setIsTranslating(false);
    }
  }, []);

  const translateAndSave = useCallback(async (
    text: string,
    contentType: string,
    contentId: string,
    from: string = 'id',
    to: string = 'en'
  ): Promise<string> => {
    if (!text || text.trim().length === 0) {
      return text;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          from,
          to,
          contentType,
          contentId
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.status}`);
      }

      const result: TranslationResult = await response.json();
      
      if (result.success) {
        return result.translatedText;
      } else {
        throw new Error('Translation was not successful');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      console.error('Translation error:', err);
      return text; // Return original text on error
    } finally {
      setIsTranslating(false);
    }
  }, []);

  return {
    translateText,
    translateAndSave,
    isTranslating,
    error
  };
}
