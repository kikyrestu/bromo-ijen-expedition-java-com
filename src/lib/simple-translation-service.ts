// Simple translation service without external dependencies
export class SimpleTranslationService {
  private static instance: SimpleTranslationService;
  private currentLanguage: string = 'id';

  private translations = {
    id: {
      welcome: "Selamat Datang",
      hero_title: "Wonderful Indonesia",
      hero_subtitle: "Rasakan Keajaiban Gunung Bromo & Kawah Ijen",
      hero_description: "Temukan keindahan menakjubkan Jawa Timur dengan paket wisata profesional kami. Dari matahari terbit mistis di Gunung Bromo hingga api biru memukau di Kawah Ijen.",
      explore_packages: "Jelajahi Paket",
      about_us: "Tentang Kami",
      why_choose_us: "Mengapa Memilih Kami",
      exclusive_destinations: "Destinasi Eksklusif",
      tour_packages: "Paket Wisata",
      testimonials: "Testimoni",
      gallery: "Galeri",
      blog: "Blog",
      contact: "Kontak",
      book_now: "Pesan Sekarang",
      learn_more: "Pelajari Lebih Lanjut",
      read_more: "Baca Selengkapnya",
      view_all: "Lihat Semua",
      professional_guide: "Pemandu Profesional",
      transportation: "Transportasi",
      accommodation: "Akomodasi",
      meals: "Makanan",
      sunrise_at_bromo: "Matahari Terbit di Bromo",
      blue_fire_at_ijen: "Api Biru di Ijen",
      sunrise_view: "Pemandangan Matahari Terbit",
      panoramic_views: "Pemandangan Panorama",
      happy_customers: "Pelanggan Puas",
      tour_packages_count: "Paket Wisata",
      years_experience: "Tahun Pengalaman",
      volcano_tour: "Wisata Gunung Berapi",
      sunrise_tour: "Wisata Matahari Terbit",
      adventure_seekers: "Pencari Petualangan",
      photography_enthusiasts: "Pecinta Fotografi",
      moderate: "Sedang",
      easy: "Mudah",
      group_size: "Ukuran Grup",
      difficulty: "Tingkat Kesulitan",
      best_for: "Terbaik Untuk",
      duration: "Durasi",
      price: "Harga",
      rating: "Rating",
      reviews: "Ulasan",
      category: "Kategori",
      description: "Deskripsi",
      highlights: "Sorotan",
      includes: "Termasuk",
      excludes: "Tidak Termasuk",
      destinations: "Destinasi",
      itinerary: "Itinerary",
      faqs: "FAQ",
      featured: "Unggulan",
      available: "Tersedia",
      published: "Diterbitkan",
      draft: "Draft",
      pending: "Menunggu",
      approved: "Disetujui",
      rejected: "Ditolak",
      name: "Nama",
      email: "Email",
      phone: "Telepon",
      message: "Pesan",
      submit: "Kirim",
      cancel: "Batal",
      save: "Simpan",
      edit: "Edit",
      delete: "Hapus",
      create: "Buat",
      update: "Perbarui",
      search: "Cari",
      filter: "Filter",
      sort: "Urutkan",
      language: "Bahasa",
      theme: "Tema",
      settings: "Pengaturan",
      admin: "Admin",
      dashboard: "Dashboard",
      logout: "Keluar",
      login: "Masuk",
      register: "Daftar",
      profile: "Profil",
      account: "Akun",
      notifications: "Notifikasi",
      help: "Bantuan",
      support: "Dukungan",
      terms: "Syarat",
      privacy: "Privasi",
      cookies: "Cookie",
      copyright: "Hak Cipta",
      all_rights_reserved: "Semua Hak Dilindungi",
      powered_by: "Didukung Oleh",
      made_with: "Dibuat Dengan",
      love: "Cinta",
      in: "di",
      indonesia: "Indonesia"
    },
    en: {
      welcome: "Welcome",
      hero_title: "Wonderful Indonesia",
      hero_subtitle: "Experience the Magic of Mount Bromo & Ijen Crater",
      hero_description: "Discover the breathtaking beauty of East Java with our professional tour packages. From the mystical sunrise at Mount Bromo to the mesmerizing blue fire of Ijen Crater.",
      explore_packages: "Explore Packages",
      about_us: "About Us",
      why_choose_us: "Why Choose Us",
      exclusive_destinations: "Exclusive Destinations",
      tour_packages: "Tour Packages",
      testimonials: "Testimonials",
      gallery: "Gallery",
      blog: "Blog",
      contact: "Contact",
      book_now: "Book Now",
      learn_more: "Learn More",
      read_more: "Read More",
      view_all: "View All",
      professional_guide: "Professional Guide",
      transportation: "Transportation",
      accommodation: "Accommodation",
      meals: "Meals",
      sunrise_at_bromo: "Sunrise at Bromo",
      blue_fire_at_ijen: "Blue Fire at Ijen",
      sunrise_view: "Sunrise View",
      panoramic_views: "Panoramic Views",
      happy_customers: "Happy Customers",
      tour_packages_count: "Tour Packages",
      years_experience: "Years Experience",
      volcano_tour: "Volcano Tour",
      sunrise_tour: "Sunrise Tour",
      adventure_seekers: "Adventure Seekers",
      photography_enthusiasts: "Photography Enthusiasts",
      moderate: "Moderate",
      easy: "Easy",
      group_size: "Group Size",
      difficulty: "Difficulty",
      best_for: "Best For",
      duration: "Duration",
      price: "Price",
      rating: "Rating",
      reviews: "Reviews",
      category: "Category",
      description: "Description",
      highlights: "Highlights",
      includes: "Includes",
      excludes: "Excludes",
      destinations: "Destinations",
      itinerary: "Itinerary",
      faqs: "FAQs",
      featured: "Featured",
      available: "Available",
      published: "Published",
      draft: "Draft",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      name: "Name",
      email: "Email",
      phone: "Phone",
      message: "Message",
      submit: "Submit",
      cancel: "Cancel",
      save: "Save",
      edit: "Edit",
      delete: "Delete",
      create: "Create",
      update: "Update",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
      language: "Language",
      theme: "Theme",
      settings: "Settings",
      admin: "Admin",
      dashboard: "Dashboard",
      logout: "Logout",
      login: "Login",
      register: "Register",
      profile: "Profile",
      account: "Account",
      notifications: "Notifications",
      help: "Help",
      support: "Support",
      terms: "Terms",
      privacy: "Privacy",
      cookies: "Cookies",
      copyright: "Copyright",
      all_rights_reserved: "All Rights Reserved",
      powered_by: "Powered By",
      made_with: "Made With",
      love: "Love",
      in: "in",
      indonesia: "Indonesia"
    },
    de: {
      welcome: "Willkommen",
      hero_title: "Wunderbares Indonesien",
      hero_subtitle: "Erleben Sie die Magie des Mount Bromo & Ijen-Kraters",
      hero_description: "Entdecken Sie die atemberaubende Schönheit Ost-Javas mit unseren professionellen Tourpaketen. Vom mystischen Sonnenaufgang am Mount Bromo bis zum faszinierenden blauen Feuer des Ijen-Kraters.",
      explore_packages: "Pakete Erkunden",
      about_us: "Über Uns",
      why_choose_us: "Warum Uns Wählen",
      exclusive_destinations: "Exklusive Reiseziele",
      tour_packages: "Tourpakete",
      testimonials: "Testimonials",
      gallery: "Galerie",
      blog: "Blog",
      contact: "Kontakt",
      book_now: "Jetzt Buchen",
      learn_more: "Mehr Erfahren",
      read_more: "Mehr Lesen",
      view_all: "Alle Anzeigen",
      professional_guide: "Professioneller Guide",
      transportation: "Transport",
      accommodation: "Unterkunft",
      meals: "Mahlzeiten",
      sunrise_at_bromo: "Sonnenaufgang am Bromo",
      blue_fire_at_ijen: "Blaues Feuer am Ijen",
      sunrise_view: "Sonnenaufgangs-Ansicht",
      panoramic_views: "Panoramablick",
      happy_customers: "Zufriedene Kunden",
      tour_packages_count: "Tourpakete",
      years_experience: "Jahre Erfahrung",
      volcano_tour: "Vulkan-Tour",
      sunrise_tour: "Sonnenaufgangs-Tour",
      adventure_seekers: "Abenteuersuchende",
      photography_enthusiasts: "Fotografie-Enthusiasten",
      moderate: "Mittel",
      easy: "Einfach",
      group_size: "Gruppengröße",
      difficulty: "Schwierigkeit",
      best_for: "Am Besten Für",
      duration: "Dauer",
      price: "Preis",
      rating: "Bewertung",
      reviews: "Bewertungen",
      category: "Kategorie",
      description: "Beschreibung",
      highlights: "Highlights",
      includes: "Enthält",
      excludes: "Nicht Enthalten",
      destinations: "Reiseziele",
      itinerary: "Reiseplan",
      faqs: "Häufige Fragen",
      featured: "Empfohlen",
      available: "Verfügbar",
      published: "Veröffentlicht",
      draft: "Entwurf",
      pending: "Ausstehend",
      approved: "Genehmigt",
      rejected: "Abgelehnt",
      name: "Name",
      email: "E-Mail",
      phone: "Telefon",
      message: "Nachricht",
      submit: "Absenden",
      cancel: "Abbrechen",
      save: "Speichern",
      edit: "Bearbeiten",
      delete: "Löschen",
      create: "Erstellen",
      update: "Aktualisieren",
      search: "Suchen",
      filter: "Filter",
      sort: "Sortieren",
      language: "Sprache",
      theme: "Thema",
      settings: "Einstellungen",
      admin: "Admin",
      dashboard: "Dashboard",
      logout: "Abmelden",
      login: "Anmelden",
      register: "Registrieren",
      profile: "Profil",
      account: "Konto",
      notifications: "Benachrichtigungen",
      help: "Hilfe",
      support: "Support",
      terms: "Bedingungen",
      privacy: "Datenschutz",
      cookies: "Cookies",
      copyright: "Urheberrecht",
      all_rights_reserved: "Alle Rechte Vorbehalten",
      powered_by: "Unterstützt Von",
      made_with: "Gemacht Mit",
      love: "Liebe",
      in: "in",
      indonesia: "Indonesien"
    }
  };

  private constructor() {}

  public static getInstance(): SimpleTranslationService {
    if (!SimpleTranslationService.instance) {
      SimpleTranslationService.instance = new SimpleTranslationService();
    }
    return SimpleTranslationService.instance;
  }

  /**
   * Set current language
   */
  public setLanguage(language: string): void {
    this.currentLanguage = language;
  }

  /**
   * Get current language
   */
  public getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Get translated text by key
   */
  public t(key: string, params?: Record<string, string | number>): string {
    try {
      const translation = (this.translations as Record<string, Record<string, string>>)[this.currentLanguage]?.[key];
      
      if (translation) {
        // Simple parameter replacement
        if (params) {
          return translation.replace(/\{(\w+)\}/g, (match: string, paramKey: string) => {
            return params[paramKey]?.toString() || match;
          });
        }
        return translation;
      }
      
      // Fallback to key if translation not found
      console.warn(`Translation key "${key}" not found for language "${this.currentLanguage}"`);
      return key;
    } catch (error) {
      console.error(`Error translating key "${key}":`, error);
      return key;
    }
  }

  /**
   * Get all available languages
   */
  public getAvailableLanguages(): string[] {
    return Object.keys(this.translations);
  }

  /**
   * Check if a translation key exists
   */
  public hasKey(key: string): boolean {
    return !!(this.translations as Record<string, Record<string, string>>)[this.currentLanguage]?.[key];
  }
}

// Export singleton instance
export const translationService = SimpleTranslationService.getInstance();

// Export convenience function
export const t = (key: string, params?: Record<string, string | number>) => 
  translationService.t(key, params);
