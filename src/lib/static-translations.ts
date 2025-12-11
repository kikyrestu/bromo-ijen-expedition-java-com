/**
 * Static Text Translations
 * 
 * Hardcoded translations for UI labels, buttons, and static text
 * that are the same across all pages.
 * 
 * Languages: ID (Indonesian), EN (English), DE (German), NL (Dutch), ZH (Chinese)
 */

type Language = 'id' | 'en' | 'de' | 'nl' | 'zh';

interface StaticTexts {
  // Common
  loading: string;
  error: string;
  success: string;
  
  // Package Detail Page
  tourPackages: string;
  verified: string;
  viewLocation: string;
  reviews: string;
  description: string;
  showMore: string;
  showLess: string;
  highlights: string;
  itinerary: string;
  includes: string;
  excludes: string;
  location: string;
  viewInGoogleMaps: string;
  frequentlyAskedQuestions: string;
  customerReviewsRatings: string;
  basedOnReviews: string;
  like: string;
  liked: string;
  dislike: string;
  reply: string;
  seeAllReviews: string;
  tourDetails: string;
  date: string;
  destination: string;
  duration: string;
  departure: string;
  return: string;
  totalPeoples: string;
  notSpecified: string;
  startsFrom: string;
  perPerson: string;
  from: string;
  to: string;
  details: string;
  adults: string;
  infants: string;
  children: string;
  bookViaWhatsApp: string;
  whyBookWithUs: string;
  expertiseExperience: string;
  tailoredServices: string;
  comprehensivePlanning: string;
  clientSatisfaction: string;
  support24_7: string;
  providerDetails: string;
  memberSince: string;
  loadingPackageDetails: string;
  packageNotFound: string;
  packageNotFoundDesc: string;
  noImageAvailable: string;
  mapNotAvailable: string;
  backToPackages: string;
  
  // Blog Detail Page
  featured: string;
  uncategorized: string;
  share: string;
  tags: string;
  backToBlog: string;
  bookTour: string;
  loadingBlogPost: string;
  blogNotFound: string;
  blogNotFoundDesc: string;
}

const staticTranslations: Record<Language, StaticTexts> = {
  id: {
    // Common
    loading: 'Memuat...',
    error: 'Terjadi Kesalahan',
    success: 'Berhasil',
    
    // Package Detail
    tourPackages: 'Paket Wisata',
    verified: 'Terverifikasi',
    viewLocation: 'Lihat Lokasi',
    reviews: 'Ulasan',
    description: 'Deskripsi',
    showMore: 'Lihat Lebih Banyak',
    showLess: 'Lihat Lebih Sedikit',
    highlights: 'Sorotan',
    itinerary: 'Rencana Perjalanan',
    includes: 'Termasuk',
    excludes: 'Tidak Termasuk',
    location: 'Lokasi',
    viewInGoogleMaps: 'Lihat di Google Maps →',
    frequentlyAskedQuestions: 'Pertanyaan yang Sering Diajukan',
    customerReviewsRatings: 'Ulasan & Penilaian Pelanggan',
    basedOnReviews: 'Berdasarkan',
    like: 'Suka',
    liked: 'Disukai',
    dislike: 'Tidak Suka',
    reply: 'Balas',
    seeAllReviews: 'Lihat semua ulasan',
    tourDetails: 'Detail Tour',
    date: 'Tanggal:',
    destination: 'Destinasi:',
    duration: 'Durasi:',
    departure: 'Keberangkatan:',
    return: 'Kepulangan:',
    totalPeoples: 'Total Peserta:',
    notSpecified: 'Belum ditentukan',
    startsFrom: 'Mulai Dari',
    perPerson: '/ Orang',
    from: 'Dari',
    to: 'Sampai',
    details: 'Detail',
    adults: 'Dewasa',
    infants: 'Bayi (0-2 Tahun)',
    children: 'Anak (2-12 Tahun)',
    bookViaWhatsApp: 'Pesan via WhatsApp',
    whyBookWithUs: 'Kenapa Pesan dengan Kami',
    expertiseExperience: 'Keahlian dan Pengalaman',
    tailoredServices: 'Layanan Khusus',
    comprehensivePlanning: 'Perencanaan Komprehensif',
    clientSatisfaction: 'Kepuasan Klien',
    support24_7: 'Dukungan 24/7',
    providerDetails: 'Detail Penyedia',
    memberSince: 'Anggota Sejak:',
    loadingPackageDetails: 'Memuat detail paket...',
    packageNotFound: 'Paket Tidak Ditemukan',
    packageNotFoundDesc: 'Paket yang Anda cari tidak ada.',
    noImageAvailable: 'Tidak Ada Gambar',
    mapNotAvailable: 'Peta Tidak Tersedia',
    backToPackages: 'Kembali ke Paket',
    
    // Blog Detail
    featured: 'Unggulan',
    uncategorized: 'Tanpa Kategori',
    share: 'Bagikan',
    tags: 'Tag',
    backToBlog: 'Kembali ke Blog',
    bookTour: 'Pesan Tour',
    loadingBlogPost: 'Memuat artikel blog...',
    blogNotFound: 'Blog Tidak Ditemukan',
    blogNotFoundDesc: 'Artikel blog yang Anda cari tidak ada.',
  },
  
  en: {
    // Common
    loading: 'Loading...',
    error: 'Error Occurred',
    success: 'Success',
    
    // Package Detail
    tourPackages: 'Tour Packages',
    verified: 'Verified',
    viewLocation: 'View Location',
    reviews: 'Reviews',
    description: 'Description',
    showMore: 'Show More',
    showLess: 'Show Less',
    highlights: 'Highlights',
    itinerary: 'Itinerary',
    includes: 'Includes',
    excludes: 'Excludes',
    location: 'Location',
    viewInGoogleMaps: 'View in Google Maps →',
    frequentlyAskedQuestions: 'Frequently Asked Questions',
    customerReviewsRatings: 'Customer Reviews & Ratings',
    basedOnReviews: 'Based On',
    like: 'Like',
    liked: 'Liked',
    dislike: 'Dislike',
    reply: 'Reply',
    seeAllReviews: 'See all reviews',
    tourDetails: 'Tour Details',
    date: 'Date:',
    destination: 'Destination:',
    duration: 'Duration:',
    departure: 'Departure:',
    return: 'Return:',
    totalPeoples: 'Total Peoples:',
    notSpecified: 'Not specified',
    startsFrom: 'Starts From',
    perPerson: '/ Person',
    from: 'From',
    to: 'To',
    details: 'Details',
    adults: 'Adults',
    infants: 'Infants (0-2 Yrs)',
    children: 'Children (2-12 Yrs)',
    bookViaWhatsApp: 'Book via WhatsApp',
    whyBookWithUs: 'Why Book With Us',
    expertiseExperience: 'Expertise and Experience',
    tailoredServices: 'Tailored Services',
    comprehensivePlanning: 'Comprehensive Planning',
    clientSatisfaction: 'Client Satisfaction',
    support24_7: '24/7 Support',
    providerDetails: 'Provider Details',
    memberSince: 'Member Since:',
    loadingPackageDetails: 'Loading package details...',
    packageNotFound: 'Package Not Found',
    packageNotFoundDesc: "The package you're looking for doesn't exist.",
    noImageAvailable: 'No Image Available',
    mapNotAvailable: 'Map Not Available',
    backToPackages: 'Back to Packages',
    
    // Blog Detail
    featured: 'Featured',
    uncategorized: 'Uncategorized',
    share: 'Share',
    tags: 'Tags',
    backToBlog: 'Back to Blog',
    bookTour: 'Book Tour',
    loadingBlogPost: 'Loading blog post...',
    blogNotFound: 'Blog Not Found',
    blogNotFoundDesc: "The blog post you're looking for doesn't exist.",
  },
  
  de: {
    // Common
    loading: 'Laden...',
    error: 'Fehler aufgetreten',
    success: 'Erfolg',
    
    // Package Detail
    tourPackages: 'Tourpakete',
    verified: 'Verifiziert',
    viewLocation: 'Standort anzeigen',
    reviews: 'Bewertungen',
    description: 'Beschreibung',
    showMore: 'Mehr anzeigen',
    showLess: 'Weniger anzeigen',
    highlights: 'Highlights',
    itinerary: 'Reiseverlauf',
    includes: 'Inklusive',
    excludes: 'Exklusive',
    location: 'Standort',
    viewInGoogleMaps: 'In Google Maps anzeigen →',
    frequentlyAskedQuestions: 'Häufig gestellte Fragen',
    customerReviewsRatings: 'Kundenbewertungen',
    basedOnReviews: 'Basierend auf',
    like: 'Gefällt mir',
    liked: 'Gefällt',
    dislike: 'Gefällt nicht',
    reply: 'Antworten',
    seeAllReviews: 'Alle Bewertungen ansehen',
    tourDetails: 'Tour-Details',
    date: 'Datum:',
    destination: 'Reiseziel:',
    duration: 'Dauer:',
    departure: 'Abfahrt:',
    return: 'Rückkehr:',
    totalPeoples: 'Gesamtteilnehmer:',
    notSpecified: 'Nicht angegeben',
    startsFrom: 'Ab',
    perPerson: '/ Person',
    from: 'Von',
    to: 'Bis',
    details: 'Details',
    adults: 'Erwachsene',
    infants: 'Kleinkinder (0-2 Jahre)',
    children: 'Kinder (2-12 Jahre)',
    bookViaWhatsApp: 'Per WhatsApp buchen',
    whyBookWithUs: 'Warum bei uns buchen',
    expertiseExperience: 'Fachwissen und Erfahrung',
    tailoredServices: 'Maßgeschneiderte Dienstleistungen',
    comprehensivePlanning: 'Umfassende Planung',
    clientSatisfaction: 'Kundenzufriedenheit',
    support24_7: '24/7 Support',
    providerDetails: 'Anbieterdetails',
    memberSince: 'Mitglied seit:',
    loadingPackageDetails: 'Paketdetails werden geladen...',
    packageNotFound: 'Paket nicht gefunden',
    packageNotFoundDesc: 'Das gesuchte Paket existiert nicht.',
    noImageAvailable: 'Kein Bild verfügbar',
    mapNotAvailable: 'Karte nicht verfügbar',
    backToPackages: 'Zurück zu den Paketen',
    
    // Blog Detail
    featured: 'Hervorgehoben',
    uncategorized: 'Nicht kategorisiert',
    share: 'Teilen',
    tags: 'Tags',
    backToBlog: 'Zurück zum Blog',
    bookTour: 'Tour buchen',
    loadingBlogPost: 'Blogbeitrag wird geladen...',
    blogNotFound: 'Blog nicht gefunden',
    blogNotFoundDesc: 'Der gesuchte Blogbeitrag existiert nicht.',
  },
  
  nl: {
    // Common
    loading: 'Laden...',
    error: 'Fout opgetreden',
    success: 'Succes',
    
    // Package Detail
    tourPackages: 'Tourpakketten',
    verified: 'Geverifieerd',
    viewLocation: 'Bekijk locatie',
    reviews: 'Beoordelingen',
    description: 'Beschrijving',
    showMore: 'Toon meer',
    showLess: 'Toon minder',
    highlights: 'Hoogtepunten',
    itinerary: 'Reisroute',
    includes: 'Inclusief',
    excludes: 'Exclusief',
    location: 'Locatie',
    viewInGoogleMaps: 'Bekijk in Google Maps →',
    frequentlyAskedQuestions: 'Veelgestelde vragen',
    customerReviewsRatings: 'Klantbeoordelingen',
    basedOnReviews: 'Gebaseerd op',
    like: 'Leuk vinden',
    liked: 'Vind ik leuk',
    dislike: 'Niet leuk',
    reply: 'Antwoorden',
    seeAllReviews: 'Alle beoordelingen bekijken',
    tourDetails: 'Tour details',
    date: 'Datum:',
    destination: 'Bestemming:',
    duration: 'Duur:',
    departure: 'Vertrek:',
    return: 'Terugkeer:',
    totalPeoples: 'Totaal personen:',
    notSpecified: 'Niet gespecificeerd',
    startsFrom: 'Vanaf',
    perPerson: '/ Persoon',
    from: 'Van',
    to: 'Tot',
    details: 'Details',
    adults: 'Volwassenen',
    infants: 'Baby\'s (0-2 jaar)',
    children: 'Kinderen (2-12 jaar)',
    bookViaWhatsApp: 'Boek via WhatsApp',
    whyBookWithUs: 'Waarom bij ons boeken',
    expertiseExperience: 'Expertise en ervaring',
    tailoredServices: 'Op maat gemaakte diensten',
    comprehensivePlanning: 'Uitgebreide planning',
    clientSatisfaction: 'Klanttevredenheid',
    support24_7: '24/7 Ondersteuning',
    providerDetails: 'Aanbiedergegevens',
    memberSince: 'Lid sinds:',
    loadingPackageDetails: 'Pakketgegevens laden...',
    packageNotFound: 'Pakket niet gevonden',
    packageNotFoundDesc: 'Het pakket dat u zoekt bestaat niet.',
    noImageAvailable: 'Geen afbeelding beschikbaar',
    mapNotAvailable: 'Kaart niet beschikbaar',
    backToPackages: 'Terug naar pakketten',
    
    // Blog Detail
    featured: 'Uitgelicht',
    uncategorized: 'Niet gecategoriseerd',
    share: 'Delen',
    tags: 'Tags',
    backToBlog: 'Terug naar blog',
    bookTour: 'Tour boeken',
    loadingBlogPost: 'Blogpost laden...',
    blogNotFound: 'Blog niet gevonden',
    blogNotFoundDesc: 'De blogpost die u zoekt bestaat niet.',
  },
  
  zh: {
    // Common
    loading: '加载中...',
    error: '发生错误',
    success: '成功',
    
    // Package Detail
    tourPackages: '旅游套餐',
    verified: '已验证',
    viewLocation: '查看位置',
    reviews: '评论',
    description: '描述',
    showMore: '显示更多',
    showLess: '显示更少',
    highlights: '亮点',
    itinerary: '行程',
    includes: '包含',
    excludes: '不包含',
    location: '位置',
    viewInGoogleMaps: '在谷歌地图中查看 →',
    frequentlyAskedQuestions: '常见问题',
    customerReviewsRatings: '客户评价',
    basedOnReviews: '基于',
    like: '喜欢',
    liked: '已点赞',
    dislike: '不喜欢',
    reply: '回复',
    seeAllReviews: '查看所有评论',
    tourDetails: '旅游详情',
    date: '日期：',
    destination: '目的地：',
    duration: '时长：',
    departure: '出发：',
    return: '返回：',
    totalPeoples: '总人数：',
    notSpecified: '未指定',
    startsFrom: '起价',
    perPerson: '/ 人',
    from: '从',
    to: '到',
    details: '详情',
    adults: '成人',
    infants: '婴儿（0-2岁）',
    children: '儿童（2-12岁）',
    bookViaWhatsApp: '通过WhatsApp预订',
    whyBookWithUs: '为什么选择我们',
    expertiseExperience: '专业与经验',
    tailoredServices: '定制服务',
    comprehensivePlanning: '全面规划',
    clientSatisfaction: '客户满意度',
    support24_7: '24/7支持',
    providerDetails: '供应商详情',
    memberSince: '会员自：',
    loadingPackageDetails: '正在加载套餐详情...',
    packageNotFound: '未找到套餐',
    packageNotFoundDesc: '您要找的套餐不存在。',
    noImageAvailable: '无图片',
    mapNotAvailable: '地图不可用',
    backToPackages: '返回套餐',
    
    // Blog Detail
    featured: '精选',
    uncategorized: '未分类',
    share: '分享',
    tags: '标签',
    backToBlog: '返回博客',
    bookTour: '预订旅游',
    loadingBlogPost: '正在加载博客文章...',
    blogNotFound: '未找到博客',
    blogNotFoundDesc: '您要找的博客文章不存在。',
  },
};

/**
 * Get translated static text
 * @param key - Translation key
 * @param language - Target language
 * @returns Translated text
 */
export function t(key: keyof StaticTexts, language: Language = 'id'): string {
  return staticTranslations[language]?.[key] || staticTranslations.id[key] || key;
}

/**
 * Get all translations for a specific language
 * @param language - Target language
 * @returns All static translations
 */
export function getStaticTranslations(language: Language = 'id'): StaticTexts {
  return staticTranslations[language] || staticTranslations.id;
}

export default staticTranslations;
