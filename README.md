# Tour & Travel Website

Website tour dan travel Indonesia yang dibangun dengan Next.js 15, TypeScript, dan Tailwind CSS. Website ini menampilkan destinasi wisata eksklusif, paket tour, dan testimonial pelanggan dengan desain yang modern dan responsif.

## 🚀 Fitur Utama

### Frontend
- **Landing Page Responsif** dengan desain modern
- **Header Navbar** dengan efek scroll dan animasi
- **Hero Section** dengan background video dan animasi cursor custom
- **Section "Who Am I"** dengan testimonial carousel yang bisa di-geser
- **Section "Why"** dengan fitur-fitur unggulan
- **Section "Destinasi Eksklusif"** dengan filter kategori
- **Section "Our Tour Packages"** dengan detail paket lengkap
- **Footer** dengan informasi kontak dan social media

### Backend & Admin Panel
- **API Routes** untuk CRUD operations
- **Admin Panel** dengan TinyMCE editor
- **Manajemen Destinasi** - tambah, edit, hapus destinasi
- **Manajemen Paket Tour** - kelola paket dengan detail lengkap
- **Manajemen Testimonial** - kelola review pelanggan

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Text Editor**: TinyMCE
- **Animations**: Framer Motion
- **API**: Next.js API Routes

## 📦 Instalasi

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd tourntravelweb
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Jalankan development server**
   ```bash
   npm run dev
   ```

4. **Buka browser**
   ```
   http://localhost:3000
   ```

## 🎯 Struktur Project

```
src/
├── app/
│   ├── api/                 # API Routes
│   │   ├── destinations/    # CRUD Destinasi
│   │   ├── packages/        # CRUD Paket Tour
│   │   └── testimonials/    # CRUD Testimonial
│   ├── admin/               # Admin Panel
│   ├── globals.css          # Global Styles
│   ├── layout.tsx           # Root Layout
│   └── page.tsx             # Home Page
├── components/              # React Components
│   ├── Header.tsx           # Navigation Header
│   ├── HeroSection.tsx      # Hero dengan Video
│   ├── WhoAmISection.tsx    # Testimonial Carousel
│   ├── WhySection.tsx       # Fitur Unggulan
│   ├── DestinasiEksklusifSection.tsx  # Destinasi
│   ├── TourPackagesSection.tsx        # Paket Tour
│   └── Footer.tsx           # Footer
└── public/                  # Static Assets
    ├── destinations/        # Gambar Destinasi
    ├── packages/            # Gambar Paket
    └── testimonials/        # Gambar Testimonial
```

## 🎨 Komponen Utama

### Header Component
- Navbar responsif dengan efek scroll
- Top bar dengan informasi kontak
- Mobile menu dengan hamburger
- Smooth scroll navigation

### Hero Section
- Background video dengan overlay
- Custom cursor yang mengikuti mouse
- Video controls (play/pause, mute/unmute)
- Call-to-action buttons
- Statistics counter

### Who Am I Section
- Testimonial carousel dengan auto-play
- Navigation buttons dan dots indicator
- Rating stars
- Company statistics

### Destinasi Eksklusif
- Filter berdasarkan kategori
- Card layout dengan hover effects
- Price display dengan discount
- Highlights tags
- Responsive grid

### Tour Packages
- Tab navigation untuk paket berbeda
- Detail paket lengkap
- Price comparison
- Package includes list
- Highlights section

## 🔧 API Endpoints

### Destinations
- `GET /api/destinations` - Ambil semua destinasi
- `POST /api/destinations` - Tambah destinasi baru
- `PUT /api/destinations` - Update destinasi
- `DELETE /api/destinations?id={id}` - Hapus destinasi

### Packages
- `GET /api/packages` - Ambil semua paket
- `POST /api/packages` - Tambah paket baru
- `PUT /api/packages` - Update paket
- `DELETE /api/packages?id={id}` - Hapus paket

### Testimonials
- `GET /api/testimonials` - Ambil semua testimonial
- `POST /api/testimonials` - Tambah testimonial baru
- `PUT /api/testimonials` - Update testimonial
- `DELETE /api/testimonials?id={id}` - Hapus testimonial

## 🎭 Admin Panel

Akses admin panel di `/admin` untuk:
- Mengelola destinasi wisata
- Mengelola paket tour
- Mengelola testimonial pelanggan
- Menggunakan TinyMCE editor untuk konten rich text

## 🎬 Video Hero Section

Untuk menggunakan video di hero section:
1. Tambahkan file video ke folder `public/`
2. Format yang didukung: MP4, WebM, OGG
3. Resolusi yang direkomendasikan: 1920x1080 atau lebih tinggi
4. Durasi yang ideal: 30-60 detik
5. Ukuran file: maksimal 10MB untuk performa optimal

## 📱 Responsive Design

Website ini fully responsive dengan breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🎨 Custom Styling

File `globals.css` berisi:
- Custom scrollbar
- Smooth scrolling
- Custom animations (fadeInUp, fadeInLeft, fadeInRight)
- Custom cursor untuk hero section
- Glass morphism effects
- Button hover effects
- Card hover animations

## 🚀 Deployment

1. **Build untuk production**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

3. **Deploy ke Vercel**
   ```bash
   npx vercel
   ```

## 📝 TODO

- [ ] Integrasi database (Prisma + PostgreSQL)
- [ ] Authentication system
- [ ] Payment gateway integration
- [ ] Email notification system
- [ ] SEO optimization
- [ ] PWA features
- [ ] Multi-language support

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

- **Email**: info@tourntravel.com
- **Phone**: +62 812-3456-7890
- **Website**: https://tourntravel.com

---

Dibuat dengan ❤️ untuk mempromosikan keindahan Indonesia