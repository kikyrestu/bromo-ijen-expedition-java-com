import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Seed Settings
  await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      whatsappNumber: '+62 812-3456-7890',
      whatsappGreeting: 'Halo Bromo Ijen Tour! 👋',
      providerName: 'Bromo Ijen Tour',
      memberSince: '14 May 2024',
      providerPhone: '+62 812-3456-7890',
      providerEmail: 'info@bromotour.com',
      siteName: 'Bromo Ijen Tour & Travel',
      siteDescription: 'Experience the best of Mount Bromo and Ijen with professional tour packages',
      defaultOgImage: '/og-default.jpg',
      siteUrl: 'https://bromoijen.com',
      googleSiteVerification: '',
      bingSiteVerification: '',
    },
  });

  // Seed Topbar Settings
  await prisma.topbarSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      isEnabled: true,
      phone: '+62 812-3456-7890',
      email: 'info@bromotour.com',
      announcement: '🎉 Penawaran Spesial! Dapatkan diskon 20% untuk paket Bromo Ijen!',
      showLanguage: true,
      showSocial: true,
      socialLinks: JSON.stringify({
        facebook: 'https://facebook.com/bromoijen',
        instagram: 'https://instagram.com/bromoijen',
        twitter: 'https://twitter.com/bromoijen',
      }),
      backgroundColor: '#f8f9fa',
      textColor: '#333333',
    },
  });

  // Seed Mobile Menu Settings
  await prisma.mobileMenuSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      menuType: 'hamburger',
      position: 'top-right',
      animation: 'slide',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      iconColor: '#333333',
    },
  });

  // Seed Language Settings
  await prisma.languageSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      defaultLanguage: 'id',
      supportedLanguages: JSON.stringify(['id', 'en', 'de', 'cn', 'ru']),
      showLanguageSwitcher: true,
      languageSwitcherPosition: 'topbar',
    },
  });

  // Seed Navigation Menu
  const mainMenu = await prisma.navigationMenu.upsert({
    where: { id: 'main-menu' },
    update: {},
    create: {
      id: 'main-menu',
      name: 'Main Menu',
      location: 'header',
      isActive: true,
    },
  });

  // Seed Navigation Items
  const homeItem = await prisma.navigationItem.upsert({
    where: { id: 'home' },
    update: {},
    create: {
      id: 'home',
      menuId: mainMenu.id,
      order: 1,
      isActive: true,
      isExternal: false,
      target: '_self',
      iconType: 'fontawesome',
      iconName: 'fas fa-home',
      backgroundColor: null,
      textColor: null,
      hoverColor: null,
      activeColor: null,
      fontFamily: null,
      fontSize: null,
      fontWeight: null,
    },
  });

  const packagesItem = await prisma.navigationItem.upsert({
    where: { id: 'packages' },
    update: {},
    create: {
      id: 'packages',
      menuId: mainMenu.id,
      order: 2,
      isActive: true,
      isExternal: false,
      target: '_self',
      iconType: 'fontawesome',
      iconName: 'fas fa-map-marked-alt',
      backgroundColor: null,
      textColor: null,
      hoverColor: null,
      activeColor: null,
      fontFamily: null,
      fontSize: null,
      fontWeight: null,
    },
  });

  const blogItem = await prisma.navigationItem.upsert({
    where: { id: 'blog' },
    update: {},
    create: {
      id: 'blog',
      menuId: mainMenu.id,
      order: 3,
      isActive: true,
      isExternal: false,
      target: '_self',
      iconType: 'fontawesome',
      iconName: 'fas fa-blog',
      backgroundColor: null,
      textColor: null,
      hoverColor: null,
      activeColor: null,
      fontFamily: null,
      fontSize: null,
      fontWeight: null,
    },
  });

  const galleryItem = await prisma.navigationItem.upsert({
    where: { id: 'gallery' },
    update: {},
    create: {
      id: 'gallery',
      menuId: mainMenu.id,
      order: 4,
      isActive: true,
      isExternal: false,
      target: '_self',
      iconType: 'fontawesome',
      iconName: 'fas fa-images',
      backgroundColor: null,
      textColor: null,
      hoverColor: null,
      activeColor: null,
      fontFamily: null,
      fontSize: null,
      fontWeight: null,
    },
  });

  const contactItem = await prisma.navigationItem.upsert({
    where: { id: 'contact' },
    update: {},
    create: {
      id: 'contact',
      menuId: mainMenu.id,
      order: 5,
      isActive: true,
      isExternal: false,
      target: '_self',
      iconType: 'fontawesome',
      iconName: 'fas fa-phone',
      backgroundColor: null,
      textColor: null,
      hoverColor: null,
      activeColor: null,
      fontFamily: null,
      fontSize: null,
      fontWeight: null,
    },
  });

  // Seed Navigation Item Translations
  await prisma.navigationItemTranslation.upsert({
    where: { itemId_language: { itemId: homeItem.id, language: 'id' } },
    update: {},
    create: {
      itemId: homeItem.id,
      language: 'id',
      title: 'Beranda',
      url: '/id',
    },
  });

  await prisma.navigationItemTranslation.upsert({
    where: { itemId_language: { itemId: homeItem.id, language: 'en' } },
    update: {},
    create: {
      itemId: homeItem.id,
      language: 'en',
      title: 'Home',
      url: '/en',
    },
  });

  await prisma.navigationItemTranslation.upsert({
    where: { itemId_language: { itemId: packagesItem.id, language: 'id' } },
    update: {},
    create: {
      itemId: packagesItem.id,
      language: 'id',
      title: 'Paket Wisata',
      url: '/id/packages',
    },
  });

  await prisma.navigationItemTranslation.upsert({
    where: { itemId_language: { itemId: packagesItem.id, language: 'en' } },
    update: {},
    create: {
      itemId: packagesItem.id,
      language: 'en',
      title: 'Tour Packages',
      url: '/en/packages',
    },
  });

  await prisma.navigationItemTranslation.upsert({
    where: { itemId_language: { itemId: blogItem.id, language: 'id' } },
    update: {},
    create: {
      itemId: blogItem.id,
      language: 'id',
      title: 'Blog',
      url: '/id/blog',
    },
  });

  await prisma.navigationItemTranslation.upsert({
    where: { itemId_language: { itemId: blogItem.id, language: 'en' } },
    update: {},
    create: {
      itemId: blogItem.id,
      language: 'en',
      title: 'Blog',
      url: '/en/blog',
    },
  });

  await prisma.navigationItemTranslation.upsert({
    where: { itemId_language: { itemId: galleryItem.id, language: 'id' } },
    update: {},
    create: {
      itemId: galleryItem.id,
      language: 'id',
      title: 'Galeri',
      url: '/id/gallery',
    },
  });

  await prisma.navigationItemTranslation.upsert({
    where: { itemId_language: { itemId: galleryItem.id, language: 'en' } },
    update: {},
    create: {
      itemId: galleryItem.id,
      language: 'en',
      title: 'Gallery',
      url: '/en/gallery',
    },
  });

  await prisma.navigationItemTranslation.upsert({
    where: { itemId_language: { itemId: contactItem.id, language: 'id' } },
    update: {},
    create: {
      itemId: contactItem.id,
      language: 'id',
      title: 'Kontak',
      url: '/id/contact',
    },
  });

  await prisma.navigationItemTranslation.upsert({
    where: { itemId_language: { itemId: contactItem.id, language: 'en' } },
    update: {},
    create: {
      itemId: contactItem.id,
      language: 'en',
      title: 'Contact',
      url: '/en/contact',
    },
  });

  // Seed Section Content
  await prisma.sectionContent.upsert({
    where: { sectionId: 'hero' },
    update: {},
    create: {
      sectionId: 'hero',
      title: 'Wonderful Indonesia',
      subtitle: 'Experience the Magic of Mount Bromo & Ijen Crater',
      description: 'Discover the breathtaking beauty of East Java with our professional tour packages. From the mystical sunrise at Mount Bromo to the mesmerizing blue fire of Ijen Crater.',
      ctaText: 'Explore Packages',
      ctaLink: '/packages',
      image: '/uploads/hero-bromo.jpg',
      backgroundVideo: '/uploads/hero-video.mp4',
      destinations: JSON.stringify(['Mount Bromo', 'Ijen Crater', 'Madakaripura Waterfall']),
      features: JSON.stringify(['Professional Guide', 'Transportation', 'Accommodation']),
      stats: JSON.stringify([
        { label: 'Happy Customers', value: '1000+' },
        { label: 'Tour Packages', value: '15+' },
        { label: 'Years Experience', value: '5+' }
      ]),
      packages: JSON.stringify([]),
      testimonials: JSON.stringify([]),
      posts: JSON.stringify([]),
      items: JSON.stringify([]),
      categories: JSON.stringify([]),
      displayCount: 6,
      featuredOnly: true,
      category: null,
      sortBy: 'popularity',
      layoutStyle: 'grid',
    },
  });

  await prisma.sectionContent.upsert({
    where: { sectionId: 'whoAmI' },
    update: {
      title: 'Siapa Saya',
      subtitle: 'Partner Perjalanan Terpercaya Anda',
      description: '<p>Saya adalah seorang pemandu wisata yang berpengalaman dengan lebih dari 5 tahun pengalaman dalam pariwisata Jawa Timur. Spesialisasi dalam tur Gunung Bromo dan Kawah Ijen, saya menyediakan pengalaman yang aman, berkesan, dan autentik untuk wisatawan dari seluruh dunia.</p>',
      ctaText: 'Pelajari Lebih Lanjut',
      buttonText: 'Tentang Saya',
      features: JSON.stringify([
        { icon: 'compass', title: 'Guide Profesional', description: 'Tim guide berpengalaman dan bersertifikat' },
        { icon: 'star', title: 'Keselamatan Utama', description: 'Prioritas keselamatan dalam setiap perjalanan' },
        { icon: 'users', title: 'Pelayanan Berkualitas', description: 'Pelayanan berkualitas dengan standar internasional' }
      ]),
      stats: JSON.stringify([
        { number: '500+', label: 'Tur Dilaksanakan' },
        { number: '20+', label: 'Negara Dilayani' },
        { number: '3', label: 'Bahasa' }
      ]),
    },
    create: {
      sectionId: 'whoAmI',
      title: 'Siapa Saya',
      subtitle: 'Partner Perjalanan Terpercaya Anda',
      description: '<p>Saya adalah seorang pemandu wisata yang berpengalaman dengan lebih dari 5 tahun pengalaman dalam pariwisata Jawa Timur. Spesialisasi dalam tur Gunung Bromo dan Kawah Ijen, saya menyediakan pengalaman yang aman, berkesan, dan autentik untuk wisatawan dari seluruh dunia.</p>',
      ctaText: 'Pelajari Lebih Lanjut',
      buttonText: 'Tentang Saya',
      ctaLink: '/about',
      image: '/uploads/whoami.jpg',
      backgroundVideo: null,
      destinations: JSON.stringify([]),
      features: JSON.stringify([
        { icon: 'compass', title: 'Guide Profesional', description: 'Tim guide berpengalaman dan bersertifikat' },
        { icon: 'star', title: 'Keselamatan Utama', description: 'Prioritas keselamatan dalam setiap perjalanan' },
        { icon: 'users', title: 'Pelayanan Berkualitas', description: 'Pelayanan berkualitas dengan standar internasional' }
      ]),
      stats: JSON.stringify([
        { number: '500+', label: 'Tur Dilaksanakan' },
        { number: '20+', label: 'Negara Dilayani' },
        { number: '3', label: 'Bahasa' }
      ]),
      packages: JSON.stringify([]),
      testimonials: JSON.stringify([]),
      posts: JSON.stringify([]),
      items: JSON.stringify([]),
      categories: JSON.stringify([]),
      displayCount: null,
      featuredOnly: false,
      category: null,
      sortBy: null,
      layoutStyle: null,
    },
  });

  await prisma.sectionContent.upsert({
    where: { sectionId: 'whyChooseUs' },
    update: {
      title: 'Mengapa Memilih Kami',
      subtitle: 'Keunggulan dalam Setiap Perjalanan',
      description: '<p>Kami berkomitmen untuk memberikan pengalaman perjalanan terbaik dengan layanan profesional, standar keselamatan, dan keahlian lokal.</p>',
      ctaText: 'Pesan Sekarang',
      buttonText: 'Keunggulan',
      features: JSON.stringify([
        { icon: 'shield', title: 'Pengetahuan Lokal Ahli', description: 'Guide kami mengetahui setiap tempat tersembunyi dan spot terbaik' },
        { icon: 'award', title: 'Jadwal Fleksibel', description: 'Sesuaikan itinerary Anda sesuai preferensi' },
        { icon: 'users', title: 'Layanan Personal', description: 'Kami memperlakukan setiap tamu seperti keluarga' }
      ]),
      stats: JSON.stringify([
        { number: '1000+', label: 'Pelanggan Puas' },
        { number: '50+', label: 'Destinasi Wisata' },
        { number: '5', label: 'Rating Bintang' }
      ]),
    },
    create: {
      sectionId: 'whyChooseUs',
      title: 'Mengapa Memilih Kami',
      subtitle: 'Keunggulan dalam Setiap Perjalanan',
      description: '<p>Kami berkomitmen untuk memberikan pengalaman perjalanan terbaik dengan layanan profesional, standar keselamatan, dan keahlian lokal.</p>',
      ctaText: 'Pesan Sekarang',
      buttonText: 'Keunggulan',
      ctaLink: '/contact',
      image: '/uploads/why-choose-us.jpg',
      backgroundVideo: null,
      destinations: JSON.stringify([]),
      features: JSON.stringify([
        { icon: 'shield', title: 'Pengetahuan Lokal Ahli', description: 'Guide kami mengetahui setiap tempat tersembunyi dan spot terbaik' },
        { icon: 'award', title: 'Jadwal Fleksibel', description: 'Sesuaikan itinerary Anda sesuai preferensi' },
        { icon: 'users', title: 'Layanan Personal', description: 'Kami memperlakukan setiap tamu seperti keluarga' }
      ]),
      stats: JSON.stringify([
        { number: '1000+', label: 'Pelanggan Puas' },
        { number: '50+', label: 'Destinasi Wisata' },
        { number: '5', label: 'Rating Bintang' }
      ]),
      packages: JSON.stringify([]),
      testimonials: JSON.stringify([]),
      posts: JSON.stringify([]),
      items: JSON.stringify([]),
      categories: JSON.stringify([]),
      displayCount: null,
      featuredOnly: false,
      category: null,
      sortBy: null,
      layoutStyle: null,
    },
  });

  await prisma.sectionContent.upsert({
    where: { sectionId: 'exclusiveDestinations' },
    update: {},
    create: {
      sectionId: 'exclusiveDestinations',
      title: 'Exclusive Destinations',
      subtitle: 'Hidden Gems of East Java',
      description: 'Discover the most beautiful and unique destinations in East Java that only locals know about.',
      ctaText: 'View All',
      ctaLink: '/destinations',
      image: '/uploads/exclusive-destinations.jpg',
      backgroundVideo: null,
      destinations: JSON.stringify([
        {
          name: 'Mount Bromo',
          location: 'Bromo Tengger Semeru National Park',
          category: 'Volcano',
          rating: 4.9,
          visitors: '10,000+',
          duration: '1-2 days',
          price: 'From $50',
          description: 'Witness the spectacular sunrise over the active volcano',
          highlights: ['Sunrise View', 'Crater Walk', 'Sea of Sand'],
          image: '/uploads/bromo.jpg',
          featured: true
        },
        {
          name: 'Ijen Crater',
          location: 'Banyuwangi Regency',
          category: 'Volcano',
          rating: 4.8,
          visitors: '5,000+',
          duration: '1 day',
          price: 'From $40',
          description: 'Experience the mesmerizing blue fire phenomenon',
          highlights: ['Blue Fire', 'Sulfur Mining', 'Crater Lake'],
          image: '/uploads/ijen.jpg',
          featured: true
        },
        {
          name: 'Madakaripura Waterfall',
          location: 'Probolinggo Regency',
          category: 'Waterfall',
          rating: 4.7,
          visitors: '3,000+',
          duration: 'Half day',
          price: 'From $30',
          description: 'Indonesia\'s tallest waterfall hidden in a cave',
          highlights: ['Tallest Waterfall', 'Cave Entrance', 'Sacred Site'],
          image: '/uploads/madakaripura.jpg',
          featured: true
        }
      ]),
      features: JSON.stringify([]),
      stats: JSON.stringify([]),
      packages: JSON.stringify([]),
      testimonials: JSON.stringify([]),
      posts: JSON.stringify([]),
      items: JSON.stringify([]),
      categories: JSON.stringify([]),
      displayCount: 6,
      featuredOnly: true,
      category: null,
      sortBy: 'rating',
      layoutStyle: 'grid',
    },
  });

  await prisma.sectionContent.upsert({
    where: { sectionId: 'tourPackages' },
    update: {},
    create: {
      sectionId: 'tourPackages',
      title: 'Tour Packages',
      subtitle: 'Choose Your Adventure',
      description: 'Select from our carefully crafted tour packages designed to give you the best experience of East Java.',
      ctaText: 'View All Packages',
      ctaLink: '/packages',
      image: '/uploads/tour-packages.jpg',
      backgroundVideo: null,
      destinations: JSON.stringify([]),
      features: JSON.stringify([]),
      stats: JSON.stringify([]),
      packages: JSON.stringify([]),
      testimonials: JSON.stringify([]),
      posts: JSON.stringify([]),
      items: JSON.stringify([]),
      categories: JSON.stringify([]),
      displayCount: 6,
      featuredOnly: true,
      category: null,
      sortBy: 'popularity',
      layoutStyle: 'grid',
    },
  });

  await prisma.sectionContent.upsert({
    where: { sectionId: 'testimonials' },
    update: {},
    create: {
      sectionId: 'testimonials',
      title: 'What Our Customers Say',
      subtitle: 'Real Experiences, Real Stories',
      description: 'Hear from our satisfied customers about their amazing experiences with us.',
      ctaText: 'Read More',
      ctaLink: '/testimonials',
      image: '/uploads/testimonials.jpg',
      backgroundVideo: null,
      destinations: JSON.stringify([]),
      features: JSON.stringify([]),
      stats: JSON.stringify([]),
      packages: JSON.stringify([]),
      testimonials: JSON.stringify([]),
      posts: JSON.stringify([]),
      items: JSON.stringify([]),
      categories: JSON.stringify([]),
      displayCount: 6,
      featuredOnly: true,
      category: null,
      sortBy: 'rating',
      layoutStyle: 'carousel',
    },
  });

  await prisma.sectionContent.upsert({
    where: { sectionId: 'blog' },
    update: {},
    create: {
      sectionId: 'blog',
      title: 'Travel Blog',
      subtitle: 'Stories & Tips',
      description: 'Read our latest travel stories, tips, and insights about East Java tourism.',
      ctaText: 'Read Blog',
      ctaLink: '/blog',
      image: '/uploads/blog.jpg',
      backgroundVideo: null,
      destinations: JSON.stringify([]),
      features: JSON.stringify([]),
      stats: JSON.stringify([]),
      packages: JSON.stringify([]),
      testimonials: JSON.stringify([]),
      posts: JSON.stringify([]),
      items: JSON.stringify([]),
      categories: JSON.stringify([]),
      displayCount: 6,
      featuredOnly: true,
      category: null,
      sortBy: 'date',
      layoutStyle: 'grid',
    },
  });

  // Seed SEO Data
  await prisma.seoData.upsert({
    where: { pageType_pageSlug: { pageType: 'home', pageSlug: 'home' } },
    update: {},
    create: {
      pageType: 'home',
      pageSlug: 'home',
      title: 'Bromo Ijen Tour & Travel - Professional East Java Tours',
      description: 'Experience the best of Mount Bromo and Ijen Crater with professional tour packages. Safe, memorable, and authentic East Java travel experiences.',
      keywords: 'bromo tour, ijen tour, east java tour, mount bromo, ijen crater, indonesia travel',
      canonicalUrl: 'https://bromoijen.com',
      ogImage: '/og-home.jpg',
      ogType: 'website',
      noIndex: false,
    },
  });

  // Seed Sample Packages
  await prisma.package.upsert({
    where: { id: 'bromo-sunrise-adventure' },
    update: {},
    create: {
      id: 'bromo-sunrise-adventure',
      title: 'Bromo Sunrise Adventure',
      slug: 'bromo-sunrise-adventure',
      duration: '3 Days 2 Nights',
      price: 450000,
      originalPrice: 550000,
      discount: '18%',
      rating: 4.9,
      reviewCount: 1200,
      category: 'Adventure Tour',
      description: '3 hari perjalanan sunrise Bromo, trekking ke kawah aktif, dan menjelajahi budaya Tengger yang unik.',
      longDescription: 'Nikmati pengalaman tak terlupakan dengan paket Bromo Sunrise Adventure. Anda akan menyaksikan sunrise yang menakjubkan dari Penanjakan, trekking ke kawah Bromo yang aktif, dan mempelajari budaya unik masyarakat Tengger. Paket ini termasuk transportasi, akomodasi, guide profesional, dan makan 3x sehari.',
      destinations: JSON.stringify(['Mount Bromo', 'Penanjakan', 'Tengger Caldera', 'Savanna Teletubbies']),
      includes: JSON.stringify([
        'Transportasi dari Surabaya',
        'Jeep 4WD untuk Bromo',
        'Guide profesional',
        'Makan 3x sehari',
        'Akomodasi homestay',
        'Tiket masuk Bromo Tengger Semeru National Park'
      ]),
      excludes: JSON.stringify([
        'Tipping guide dan driver',
        'Pengeluaran pribadi',
        'Asuransi perjalanan'
      ]),
      highlights: JSON.stringify([
        'Sunrise view dari Penanjakan',
        'Trekking ke kawah Bromo',
        'Kunjungan ke desa Tengger',
        'Transportasi jeep 4WD',
        'Guide berpengalaman',
        'Makan 3x sehari'
      ]),
      itinerary: JSON.stringify([
        {
          day: 1,
          title: 'Keberangkatan dari Surabaya',
          activities: ['Penjemputan di hotel/bandara', 'Perjalanan ke Probolinggo', 'Check-in homestay', 'Makan malam']
        },
        {
          day: 2,
          title: 'Bromo Sunrise Tour',
          activities: ['Wake up call 02:00', 'Naik jeep ke Penanjakan', 'Sunrise viewing', 'Trekking ke kawah Bromo', 'Kembali ke homestay']
        },
        {
          day: 3,
          title: 'Kembali ke Surabaya',
          activities: ['Sarapan', 'Check-out', 'Perjalanan kembali ke Surabaya', 'Drop-off hotel/bandara']
        }
      ]),
      gallery: JSON.stringify([
        '/uploads/bromo-sunrise-1.jpg',
        '/uploads/bromo-sunrise-2.jpg',
        '/uploads/bromo-sunrise-3.jpg'
      ]),
      faqs: JSON.stringify([
        {
          question: 'Apakah aman untuk anak-anak?',
          answer: 'Ya, paket ini aman untuk anak-anak di atas 5 tahun dengan pengawasan orang tua.'
        },
        {
          question: 'Bagaimana cuaca di Bromo?',
          answer: 'Cuaca di Bromo bisa sangat dingin, terutama saat sunrise. Kami menyediakan jaket hangat.'
        }
      ]),
      groupSize: 'Small Group (2-6 people)',
      difficulty: 'Easy',
      bestFor: 'Everyone',
      image: '/uploads/bromo-sunrise-package.jpg',
      departure: 'Surabaya',
      return: 'Surabaya',
      totalPeople: 6,
      location: 'Bromo Tengger, East Java',
      mapEmbedUrl: 'https://maps.google.com/embed?pb=...',
      featured: true,
      available: true,
      status: 'published'
    }
  });

  await prisma.package.upsert({
    where: { id: 'ijen-blue-fire-tour' },
    update: {},
    create: {
      id: 'ijen-blue-fire-tour',
      title: 'Ijen Blue Fire Expedition',
      slug: 'ijen-blue-fire-tour',
      duration: '2 Days 1 Night',
      price: 350000,
      originalPrice: 400000,
      discount: '12%',
      rating: 4.8,
      reviewCount: 850,
      category: 'Adventure Tour',
      description: 'Ekspedisi menakjubkan ke Kawah Ijen untuk menyaksikan blue fire yang langka dan sunrise yang memukau.',
      longDescription: 'Bergabunglah dengan ekspedisi unik ke Kawah Ijen untuk menyaksikan fenomena blue fire yang langka di dunia. Anda akan trekking di malam hari untuk mencapai kawah saat fajar, menyaksikan blue fire yang menakjubkan, dan menikmati sunrise yang memukau dari puncak Ijen.',
      destinations: JSON.stringify(['Ijen Crater', 'Blue Fire', 'Sulfur Mining', 'Sunrise Point']),
      includes: JSON.stringify([
        'Transportasi dari Surabaya/Banyuwangi',
        'Guide profesional',
        'Gas mask untuk keamanan',
        'Makan 2x sehari',
        'Akomodasi homestay',
        'Tiket masuk Ijen'
      ]),
      excludes: JSON.stringify([
        'Tipping guide',
        'Pengeluaran pribadi',
        'Asuransi perjalanan'
      ]),
      highlights: JSON.stringify([
        'Blue fire phenomenon',
        'Sunrise dari puncak Ijen',
        'Trekking malam hari',
        'Pemandangan kawah sulfur',
        'Pengalaman unik'
      ]),
      itinerary: JSON.stringify([
        {
          day: 1,
          title: 'Keberangkatan ke Banyuwangi',
          activities: ['Penjemputan di Surabaya', 'Perjalanan ke Banyuwangi', 'Check-in homestay', 'Briefing tour']
        },
        {
          day: 2,
          title: 'Ijen Blue Fire Tour',
          activities: ['Wake up call 01:00', 'Trekking ke Ijen', 'Blue fire viewing', 'Sunrise di puncak', 'Kembali ke homestay', 'Perjalanan kembali']
        }
      ]),
      gallery: JSON.stringify([
        '/uploads/ijen-blue-fire-1.jpg',
        '/uploads/ijen-blue-fire-2.jpg',
        '/uploads/ijen-blue-fire-3.jpg'
      ]),
      faqs: JSON.stringify([
        {
          question: 'Apakah blue fire selalu terlihat?',
          answer: 'Blue fire terlihat tergantung kondisi cuaca dan aktivitas vulkanik. Kami akan memberikan update terbaru.'
        },
        {
          question: 'Berapa lama trekking ke Ijen?',
          answer: 'Trekking memakan waktu sekitar 2-3 jam untuk mencapai kawah, tergantung kondisi fisik.'
        }
      ]),
      groupSize: 'Small Group (2-8 people)',
      difficulty: 'Moderate',
      bestFor: 'Adventure Seekers',
      image: '/uploads/ijen-blue-fire-package.jpg',
      departure: 'Surabaya',
      return: 'Surabaya',
      totalPeople: 8,
      location: 'Ijen Crater, East Java',
      mapEmbedUrl: 'https://maps.google.com/embed?pb=...',
      featured: true,
      available: true,
      status: 'published'
    }
  });

  // Seed Sample Blogs
  await prisma.blog.upsert({
    where: { id: 'bromo-travel-guide' },
    update: {},
    create: {
      id: 'bromo-travel-guide',
      slug: 'bromo-travel-guide',
      title: 'Panduan Lengkap Wisata Bromo untuk Pemula',
      excerpt: 'Semua yang perlu Anda ketahui sebelum mengunjungi Mount Bromo, dari persiapan hingga tips fotografi terbaik.',
      content: 'Mount Bromo adalah salah satu destinasi wisata paling populer di Indonesia...',
      author: 'Bromo Ijen Tour Team',
      publishDate: new Date('2024-10-20'),
      readTime: '8 min read',
      category: 'Travel Guide',
      tags: JSON.stringify(['Bromo', 'Travel Guide', 'Tips', 'Fotografi']),
      image: '/uploads/bromo-guide.jpg',
      featured: true,
      status: 'published'
    }
  });

  await prisma.blog.upsert({
    where: { id: 'ijen-blue-fire-experience' },
    update: {},
    create: {
      id: 'ijen-blue-fire-experience',
      slug: 'ijen-blue-fire-experience',
      title: 'Pengalaman Menyaksikan Blue Fire di Ijen',
      excerpt: 'Kisah perjalanan menakjubkan menyaksikan fenomena blue fire yang langka di Kawah Ijen.',
      content: 'Blue fire di Kawah Ijen adalah salah satu fenomena alam paling menakjubkan...',
      author: 'Bromo Ijen Tour Team',
      publishDate: new Date('2024-10-18'),
      readTime: '6 min read',
      category: 'Experience',
      tags: JSON.stringify(['Ijen', 'Blue Fire', 'Experience', 'Adventure']),
      image: '/uploads/ijen-experience.jpg',
      featured: false,
      status: 'published'
    }
  });

  // Seed Sample Testimonials
  await prisma.testimonial.upsert({
    where: { id: 'testimonial-1' },
    update: {},
    create: {
      id: 'testimonial-1',
      name: 'Sarah Johnson',
      role: 'Travel Blogger',
      content: 'Pengalaman yang luar biasa! Guide sangat profesional dan pemandangan Bromo benar-benar menakjubkan. Highly recommended!',
      image: '/uploads/testimonial-sarah.jpg',
      rating: 5,
      location: 'Australia',
      packageName: 'Bromo Sunrise Adventure',
      status: 'approved',
      featured: true
    }
  });

  await prisma.testimonial.upsert({
    where: { id: 'testimonial-2' },
    update: {},
    create: {
      id: 'testimonial-2',
      name: 'Michael Chen',
      role: 'Photographer',
      content: 'Blue fire di Ijen adalah pengalaman yang tidak akan pernah saya lupakan. Tour ini sangat terorganisir dan aman.',
      image: '/uploads/testimonial-michael.jpg',
      rating: 5,
      location: 'Singapore',
      packageName: 'Ijen Blue Fire Expedition',
      status: 'approved',
      featured: true
    }
  });

  // Seed Sample Gallery Items
  await prisma.galleryItem.upsert({
    where: { id: 'gallery-1' },
    update: {},
    create: {
      id: 'gallery-1',
      title: 'Bromo Sunrise',
      description: 'Sunrise yang menakjubkan dari Penanjakan',
      image: '/uploads/gallery-bromo-sunrise.jpg',
      category: 'Nature',
      tags: JSON.stringify(['Bromo', 'Sunrise', 'Nature']),
      likes: 0,
      views: 0
    }
  });

  await prisma.galleryItem.upsert({
    where: { id: 'gallery-2' },
    update: {},
    create: {
      id: 'gallery-2',
      title: 'Ijen Blue Fire',
      description: 'Fenomena blue fire yang langka di Kawah Ijen',
      image: '/uploads/gallery-ijen-blue-fire.jpg',
      category: 'Nature',
      tags: JSON.stringify(['Ijen', 'Blue Fire', 'Nature']),
      likes: 0,
      views: 0
    }
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
