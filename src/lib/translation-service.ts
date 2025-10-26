// Remove unused imports

// DeepL API configuration - hanya untuk server-side
const DEEPL_API_KEY = typeof window === 'undefined' ? (process.env.DEEPL_API_KEY || '') : '';
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

// Language mapping untuk DeepL
const languageMapping: Record<string, string> = {
  'id': 'ID',
  'en': 'EN',
  'de': 'DE',
  'nl': 'NL',
  'zh': 'ZH'
};

// Supported languages
const SUPPORTED_LANGUAGES = ['id', 'en', 'de', 'nl', 'zh'];
const DEFAULT_LANGUAGE = 'id';

// Enhanced static translations for better coverage
const staticTranslations: Record<string, Record<string, string>> = {
  'id': {
    'en': 'Welcome to Bromo Ijen Tour! Experience the beauty of Mount Bromo and Ijen Crater with our professional tour packages.',
    'de': 'Willkommen bei der Bromo Ijen Tour! Erleben Sie die Schönheit des Mount Bromo und des Ijen-Kraters mit unseren professionellen Tourpaketen.'
  },
  'en': {
    'id': 'Selamat datang di Bromo Ijen Tour! Rasakan keindahan Gunung Bromo dan Kawah Ijen dengan paket tur profesional kami.',
    'de': 'Willkommen bei der Bromo Ijen Tour! Erleben Sie die Schönheit des Mount Bromo und des Ijen-Kraters mit unseren professionellen Tourpaketen.'
  },
  'de': {
    'id': 'Selamat datang di Bromo Ijen Tour! Rasakan keindahan Gunung Bromo dan Kawah Ijen dengan paket tur profesional kami.',
    'en': 'Welcome to Bromo Ijen Tour! Experience the beauty of Mount Bromo and Ijen Crater with our professional tour packages.'
  }
};

// Enhanced translation mappings for common words/phrases
const translationMappings: Record<string, Record<string, Record<string, string>>> = {
  'id': {
    'en': {
      'selamat datang': 'welcome',
      'tentang kami': 'about us',
      'mengapa memilih kami': 'why choose us',
      'destinasi eksklusif': 'exclusive destinations',
      'paket wisata': 'tour packages',
      'testimoni': 'testimonials',
      'galeri': 'gallery',
      'blog': 'blog',
      'kontak': 'contact',
      'pesan sekarang': 'book now',
      'pelajari lebih lanjut': 'learn more',
      'baca selengkapnya': 'read more',
      'lihat semua': 'view all',
      'pemandu profesional': 'professional guide',
      'transportasi': 'transportation',
      'akomodasi': 'accommodation',
      'makanan': 'meals',
      'matahari terbit di bromo': 'sunrise at bromo',
      'api biru di ijen': 'blue fire at ijen',
      'pemandangan matahari terbit': 'sunrise view',
      'pemandangan panorama': 'panoramic views',
      'pelanggan puas': 'happy customers',
      'tahun pengalaman': 'years experience',
      'pemandu berpengalaman': 'experienced guide',
      'keselamatan pertama': 'safety first',
      'pelayanan berkualitas': 'quality service',
      'pengetahuan lokal ahli': 'expert local knowledge',
      'jadwal fleksibel': 'flexible scheduling',
      'layanan personal': 'personalized service'
    },
    'de': {
      'selamat datang': 'willkommen',
      'tentang kami': 'über uns',
      'mengapa memilih kami': 'warum uns wählen',
      'destinasi eksklusif': 'exklusive ziele',
      'paket wisata': 'tourpakete',
      'testimoni': 'testimonials',
      'galeri': 'galerie',
      'blog': 'blog',
      'kontak': 'kontakt',
      'pesan sekarang': 'jetzt buchen',
      'pelajari lebih lanjut': 'mehr erfahren',
      'baca selengkapnya': 'weiterlesen',
      'lihat semua': 'alle anzeigen',
      'pemandu profesional': 'professioneller führer',
      'transportasi': 'transport',
      'akomodasi': 'unterkunft',
      'makanan': 'mahlzeiten',
      'matahari terbit di bromo': 'sonnenaufgang am bromo',
      'api biru di ijen': 'blaues feuer am ijen',
      'pemandangan matahari terbit': 'sonnenaufgangsaussicht',
      'pemandangan panorama': 'panoramablick',
      'pelanggan puas': 'zufriedene kunden',
      'tahun pengalaman': 'jahre erfahrung',
      'pemandu berpengalaman': 'erfahrener führer',
      'keselamatan pertama': 'sicherheit zuerst',
      'pelayanan berkualitas': 'qualitätsservice',
      'pengetahuan lokal ahli': 'lokales expertenwissen',
      'jadwal fleksibel': 'flexible planung',
      'layanan personal': 'persönlicher service'
    }
  },
  'en': {
    'id': {
      'welcome': 'selamat datang',
      'about us': 'tentang kami',
      'why choose us': 'mengapa memilih kami',
      'exclusive destinations': 'destinasi eksklusif',
      'tour packages': 'paket wisata',
      'testimonials': 'testimoni',
      'gallery': 'galeri',
      'blog': 'blog',
      'contact': 'kontak',
      'book now': 'pesan sekarang',
      'learn more': 'pelajari lebih lanjut',
      'read more': 'baca selengkapnya',
      'view all': 'lihat semua',
      'professional guide': 'pemandu profesional',
      'transportation': 'transportasi',
      'accommodation': 'akomodasi',
      'meals': 'makanan',
      'sunrise at bromo': 'matahari terbit di bromo',
      'blue fire at ijen': 'api biru di ijen',
      'sunrise view': 'pemandangan matahari terbit',
      'panoramic views': 'pemandangan panorama',
      'happy customers': 'pelanggan puas',
      'years experience': 'tahun pengalaman',
      'experienced guide': 'pemandu berpengalaman',
      'safety first': 'keselamatan pertama',
      'quality service': 'pelayanan berkualitas',
      'expert local knowledge': 'pengetahuan lokal ahli',
      'flexible scheduling': 'jadwal fleksibel',
      'personalized service': 'layanan personal'
    },
    'de': {
      'welcome': 'willkommen',
      'about us': 'über uns',
      'why choose us': 'warum uns wählen',
      'exclusive destinations': 'exklusive ziele',
      'tour packages': 'tourpakete',
      'testimonials': 'testimonials',
      'gallery': 'galerie',
      'blog': 'blog',
      'contact': 'kontakt',
      'book now': 'jetzt buchen',
      'learn more': 'mehr erfahren',
      'read more': 'weiterlesen',
      'view all': 'alle anzeigen',
      'professional guide': 'professioneller führer',
      'transportation': 'transport',
      'accommodation': 'unterkunft',
      'meals': 'mahlzeiten',
      'sunrise at bromo': 'sonnenaufgang am bromo',
      'blue fire at ijen': 'blaues feuer am ijen',
      'sunrise view': 'sonnenaufgangsaussicht',
      'panoramic views': 'panoramablick',
      'happy customers': 'zufriedene kunden',
      'years experience': 'jahre erfahrung',
      'experienced guide': 'erfahrener führer',
      'safety first': 'sicherheit zuerst',
      'quality service': 'qualitätsservice',
      'expert local knowledge': 'lokales expertenwissen',
      'flexible scheduling': 'flexible planung',
      'personalized service': 'persönlicher service'
    }
  },
  'de': {
    'id': {
      'willkommen': 'selamat datang',
      'über uns': 'tentang kami',
      'warum uns wählen': 'mengapa memilih kami',
      'exklusive ziele': 'destinasi eksklusif',
      'tourpakete': 'paket wisata',
      'testimonials': 'testimoni',
      'galerie': 'galeri',
      'blog': 'blog',
      'kontakt': 'kontak',
      'jetzt buchen': 'pesan sekarang',
      'mehr erfahren': 'pelajari lebih lanjut',
      'weiterlesen': 'baca selengkapnya',
      'alle anzeigen': 'lihat semua',
      'professioneller führer': 'pemandu profesional',
      'transport': 'transportasi',
      'unterkunft': 'akomodasi',
      'mahlzeiten': 'makanan',
      'sonnenaufgang am bromo': 'matahari terbit di bromo',
      'blaues feuer am ijen': 'api biru di ijen',
      'sonnenaufgangsaussicht': 'pemandangan matahari terbit',
      'panoramablick': 'pemandangan panorama',
      'zufriedene kunden': 'pelanggan puas',
      'jahre erfahrung': 'tahun pengalaman',
      'erfahrener führer': 'pemandu berpengalaman',
      'sicherheit zuerst': 'keselamatan pertama',
      'qualitätsservice': 'pelayanan berkualitas',
      'lokales expertenwissen': 'pengetahuan lokal ahli',
      'flexible planung': 'jadwal fleksibel',
      'persönlicher service': 'layanan personal'
    },
    'en': {
      'willkommen': 'welcome',
      'über uns': 'about us',
      'warum uns wählen': 'why choose us',
      'exklusive ziele': 'exclusive destinations',
      'tourpakete': 'tour packages',
      'testimonials': 'testimonials',
      'galerie': 'gallery',
      'blog': 'blog',
      'kontakt': 'contact',
      'jetzt buchen': 'book now',
      'mehr erfahren': 'learn more',
      'weiterlesen': 'read more',
      'alle anzeigen': 'view all',
      'professioneller führer': 'professional guide',
      'transport': 'transportation',
      'unterkunft': 'accommodation',
      'mahlzeiten': 'meals',
      'sonnenaufgang am bromo': 'sunrise at bromo',
      'blaues feuer am ijen': 'blue fire at ijen',
      'sonnenaufgangsaussicht': 'sunrise view',
      'panoramablick': 'panoramic views',
      'zufriedene kunden': 'happy customers',
      'jahre erfahrung': 'years experience',
      'erfahrener führer': 'experienced guide',
      'sicherheit zuerst': 'safety first',
      'qualitätsservice': 'quality service',
      'lokales expertenwissen': 'expert local knowledge',
      'flexible planung': 'flexible scheduling',
      'persönlicher service': 'personalized service'
    }
  }
};

// Remove unused TranslationResult interface

class TranslationService {
  private dailyRequestCount: number = 0;
  private dailyLimit: number = 500000; // DeepL free limit
  private lastResetDate: string = '';
  private lastRequestTime: number = 0;
  private readonly RATE_LIMIT_DELAY = 3000; // Increased to 3 seconds
  private translationCache = new Map<string, string>(); // Cache for translations

  constructor() {
    if (typeof window === 'undefined') {
      console.log('🌍 Translation Service initialized with DeepL API');
    } else {
      console.log('🌍 Translation Service initialized (client-side - using static translations)');
    }
  }

  private resetDailyCount(): void {
    const today = new Date().toDateString();
    if (this.lastResetDate !== today) {
      this.dailyRequestCount = 0;
      this.lastResetDate = today;
    }
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      const delay = this.RATE_LIMIT_DELAY - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: waiting ${delay}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  // Clear translation cache
  clearCache(): void {
    this.translationCache.clear();
    console.log('🧹 Translation cache cleared');
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.translationCache.size,
      keys: Array.from(this.translationCache.keys())
    };
  }

  private async translateWithDeepL(text: string, from: string, to: string): Promise<string> {
    if (!DEEPL_API_KEY) {
      throw new Error('DeepL API key not configured');
    }

    // Enforce rate limiting
    await this.enforceRateLimit();

    try {
      const sourceLang = languageMapping[from] || from.toUpperCase();
      const targetLang = languageMapping[to] || to.toUpperCase();

      console.log(`🔄 Translating "${text.substring(0, 50)}..." from ${from} to ${to}`);

      const response = await fetch(DEEPL_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text: text,
          source_lang: sourceLang,
          target_lang: targetLang,
        }),
        signal: AbortSignal.timeout(10000), // Increased timeout
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('⚠️ DeepL rate limit exceeded, falling back to static translation');
          throw new Error('RATE_LIMIT_EXCEEDED');
        }
        throw new Error(`DeepL API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.translations && data.translations.length > 0) {
        return data.translations[0].text;
      }

      throw new Error('DeepL translation failed');
    } catch (error) {
      console.error('DeepL translation error:', error);
      throw error;
    }
  }

  async translateText(text: string, from: string = DEFAULT_LANGUAGE, to: string = 'en'): Promise<string> {
    if (!text || text.trim().length === 0) {
      console.log(`🐛 Translation Debug: Empty text provided, returning as-is`);
      return text;
    }

    console.log(`🐛 Translation Debug: Starting translation "${text.substring(0, 50)}..." from ${from} to ${to}`);

    // Check cache first
    const cacheKey = `${from}-${to}-${text}`;
    if (this.translationCache.has(cacheKey)) {
      console.log(`🐛 Translation Debug: Cache hit for "${text.substring(0, 30)}..."`);
      console.log(`📦 Cache hit: "${text.substring(0, 30)}..."`);
      return this.translationCache.get(cacheKey)!;
    }

    // Check if we have static translation for this text
    const staticTranslation = staticTranslations[from]?.[to];
    if (staticTranslation && text.toLowerCase().includes('selamat datang')) {
      console.log(`🐛 Translation Debug: Using static translation for welcome message`);
      this.translationCache.set(cacheKey, staticTranslation);
      return staticTranslation;
    }

    // Try to find translation using enhanced mappings
    const mappings = translationMappings[from]?.[to];
    if (mappings) {
      console.log(`🐛 Translation Debug: Checking enhanced mappings for ${from}->${to}`);
      const lowerText = text.toLowerCase();
      
      // Check for exact phrase matches first
      for (const [key, value] of Object.entries(mappings)) {
        if (lowerText.includes(key)) {
          const translated = text.replace(new RegExp(key, 'gi'), value);
          console.log(`🐛 Translation Debug: Found exact phrase match: "${key}" -> "${value}"`);
          console.log(`🔄 Enhanced translation: "${text}" → "${translated}"`);
          this.translationCache.set(cacheKey, translated);
          return translated;
        }
      }
      
      // Check for word-by-word translation
      let translated = text;
      for (const [key, value] of Object.entries(mappings)) {
        const regex = new RegExp(`\\b${key}\\b`, 'gi');
        if (regex.test(translated)) {
          translated = translated.replace(regex, value);
          console.log(`🐛 Translation Debug: Applied word-by-word translation: "${key}" -> "${value}"`);
        }
      }
      
      if (translated !== text) {
        console.log(`🐛 Translation Debug: Word-by-word translation completed`);
        console.log(`🔄 Word-by-word translation: "${text}" → "${translated}"`);
        this.translationCache.set(cacheKey, translated);
        return translated;
      }
    }

    // Di client-side, gunakan enhanced static translations
    if (typeof window !== 'undefined') {
      console.log(`🐛 Translation Debug: Client-side translation mode`);
      console.log(`🔄 Client-side translation: "${text.substring(0, 50)}..." from ${from} to ${to}`);
      const result = staticTranslations[from]?.[to] || text;
      this.translationCache.set(cacheKey, result);
      return result;
    }

    // Server-side: gunakan DeepL
    console.log(`🐛 Translation Debug: Server-side translation mode, using DeepL API`);
    this.resetDailyCount();

    if (this.dailyRequestCount >= this.dailyLimit) {
      console.log(`🐛 Translation Debug: Daily limit reached (${this.dailyRequestCount}/${this.dailyLimit})`);
      console.warn('Daily translation limit reached');
      return text;
    }

    try {
      console.log(`🐛 Translation Debug: Calling DeepL API for translation`);
      const translatedText = await this.translateWithDeepL(text, from, to);
      this.dailyRequestCount++;
      console.log(`🐛 Translation Debug: DeepL translation successful, daily count: ${this.dailyRequestCount}`);
      console.log(`✅ Translated with DeepL: ${translatedText.substring(0, 50)}...`);
      
      // Cache the result
      this.translationCache.set(cacheKey, translatedText);
      return translatedText;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`🐛 Translation Debug: DeepL translation failed: ${errorMessage}`);
      console.error('Translation failed:', error);
      
      // If rate limit exceeded, try static translation as fallback
      if (errorMessage === 'RATE_LIMIT_EXCEEDED') {
        console.log(`🐛 Translation Debug: Rate limit exceeded, falling back to static translation`);
        console.log(`🔄 Falling back to static translation for: "${text.substring(0, 50)}..."`);
        const mappings = translationMappings[from]?.[to];
        if (mappings) {
          const lowerText = text.toLowerCase();
          
          // Check for exact phrase matches first
          for (const [key, value] of Object.entries(mappings)) {
            if (lowerText.includes(key)) {
              const translated = text.replace(new RegExp(key, 'gi'), value);
              console.log(`🐛 Translation Debug: Static fallback - exact phrase match: "${key}" -> "${value}"`);
              console.log(`🔄 Static fallback translation: "${text}" → "${translated}"`);
              
              // Cache the fallback result
              this.translationCache.set(cacheKey, translated);
              return translated;
            }
          }
          
          // Check for word-by-word translation
          let translated = text;
          for (const [key, value] of Object.entries(mappings)) {
            const regex = new RegExp(`\\b${key}\\b`, 'gi');
            if (regex.test(translated)) {
              translated = translated.replace(regex, value);
              console.log(`🐛 Translation Debug: Static fallback - word-by-word: "${key}" -> "${value}"`);
            }
          }
          
          if (translated !== text) {
            console.log(`🐛 Translation Debug: Static fallback translation completed`);
            console.log(`🔄 Static word-by-word fallback: "${text}" → "${translated}"`);
            
            // Cache the fallback result
            this.translationCache.set(cacheKey, translated);
            return translated;
          }
        }
      }
      
      // Cache the original text as fallback
      console.log(`🐛 Translation Debug: Using original text as final fallback`);
      this.translationCache.set(cacheKey, text);
      return text; // Return original text on error
    }
  }

  async translateObject(obj: Record<string, unknown>, from: string = DEFAULT_LANGUAGE, to: string = 'en'): Promise<Record<string, unknown>> {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const translated: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && value.trim().length > 0) {
        translated[key] = await this.translateText(value, from, to);
      } else if (typeof value === 'object' && value !== null) {
        translated[key] = await this.translateObject(value as Record<string, unknown>, from, to);
      } else {
        translated[key] = value;
      }
    }

    return translated;
  }

  async translateArray(arr: unknown[], from: string = DEFAULT_LANGUAGE, to: string = 'en'): Promise<unknown[]> {
    if (!Array.isArray(arr)) {
      return arr;
    }

    const translated: unknown[] = [];
    
    for (const item of arr) {
      if (typeof item === 'string') {
        translated.push(await this.translateText(item, from, to));
      } else if (typeof item === 'object' && item !== null) {
        translated.push(await this.translateObject(item as Record<string, unknown>, from, to));
      } else {
        translated.push(item);
      }
    }

    return translated;
  }

  getSupportedLanguages(): string[] {
    return SUPPORTED_LANGUAGES;
  }

  getDefaultLanguage(): string {
    return DEFAULT_LANGUAGE;
  }

  async testConnection(): Promise<boolean> {
    try {
      const testText = 'Hello world';
      await this.translateWithDeepL(testText, 'en', 'id');
      console.log('✅ DeepL API connection test successful');
      return true;
    } catch (error) {
      console.error('❌ DeepL API connection test failed:', error);
      return false;
    }
  }
}

export const translationService = new TranslationService();
export default translationService;