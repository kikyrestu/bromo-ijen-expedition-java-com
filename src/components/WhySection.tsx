'use client';

import { Shield, Users, Clock, Award, Heart, Globe } from 'lucide-react';

const WhySection = () => {
  const features = [
    {
      icon: Shield,
      title: 'Keamanan Terjamin',
      description:
        'Prioritas utama kami adalah keselamatan dan keamanan Anda. Semua aktivitas telah melalui prosedur keamanan yang ketat dengan tim guide berpengalaman.',
    },
    {
      icon: Users,
      title: 'Tim Profesional',
      description:
        'Tim guide kami adalah profesional yang telah berpengalaman bertahun-tahun dan memiliki pengetahuan mendalam tentang destinasi wisata Indonesia.',
    },
    {
      icon: Clock,
      title: 'Fleksibilitas Waktu',
      description:
        'Kami memahami kebutuhan setiap traveler. Paket wisata kami dapat disesuaikan dengan jadwal dan preferensi Anda untuk pengalaman yang lebih personal.',
    },
    {
      icon: Award,
      title: 'Kualitas Terbaik',
      description:
        'Kami hanya bekerja dengan partner terpercaya dan menyediakan akomodasi serta transportasi berkualitas tinggi untuk kenyamanan maksimal.',
    },
    {
      icon: Heart,
      title: 'Pelayanan Ramah',
      description:
        'Tim customer service kami siap membantu Anda 24/7 dengan pelayanan yang ramah dan responsif untuk memastikan perjalanan Anda berjalan lancar.',
    },
    {
      icon: Globe,
      title: 'Destinasi Eksklusif',
      description:
        'Kami menghadirkan destinasi-destinasi tersembunyi yang belum banyak diketahui wisatawan, memberikan pengalaman unik dan tak terlupakan.',
    },
  ];

  const summary = [
    { value: '5,000+', label: 'Destinations' },
    { value: '96%', label: 'Happy Travellers' },
    { value: '24/7', label: 'Support Team' },
  ];

  return (
    <section id="why" className="py-20 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1 space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-50 rounded-full border border-purple-100">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-600">Why Choose Us</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
              Your Trusted Partner for Unforgettable Journeys
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Kami membangun pengalaman perjalanan yang aman, personal, dan penuh momen seru. Nikmati layanan profesional
              dengan detail yang diperhatikan, mulai dari perencanaan hingga perjalanan selesai.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 pt-4">
              {summary.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="rounded-2xl border border-purple-100 bg-white px-4 py-5 shadow-sm text-center"
                >
                  <div className="text-3xl font-bold text-purple-600">{item.value}</div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              {features.map((feature, index) => (
                <div
                  key={`${feature.title}-${index}`}
                  className="flex items-start gap-4 rounded-3xl border border-slate-100 bg-slate-50/60 px-5 py-4"
                >
                  <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-orange-600">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{feature.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <button className="inline-flex items-center justify-center rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:bg-purple-500">
                Konsultasi Gratis
              </button>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative max-w-[520px] sm:max-w-[580px] lg:max-w-[620px] mx-auto">
              <div className="absolute -top-10 -left-8 hidden sm:block">
                <img src="/assets/shape-2.png" alt="Shape accent" className="h-24 w-24 object-contain" loading="lazy" />
              </div>
              <div className="absolute -bottom-12 -right-10 hidden sm:block">
                <img src="/assets/fun-2.png" alt="Travel badge" className="h-20 w-20 object-contain" loading="lazy" />
              </div>
              <div className="absolute top-1/2 -right-12 hidden lg:block -translate-y-1/2">
                <img src="/assets/fun-3.png" alt="Travel fun" className="h-16 w-16 object-contain" loading="lazy" />
              </div>
              <div className="relative aspect-[16/11] sm:aspect-[16/10] lg:aspect-[16/9] min-h-[280px] sm:min-h-[360px] lg:min-h-[420px] bg-gradient-to-br from-purple-100 via-orange-50 to-white rounded-[36px] overflow-hidden shadow-2xl">
                <img
                  src="/assets/right-shape.png"
                  alt="Travel illustration"
                  className="absolute inset-0 h-full w-full object-cover mix-blend-multiply"
                  loading="lazy"
                />
                <img
                  src="/assets/fun-1.png"
                  alt="Why choose us illustration"
                  className="relative z-10 h-full w-full object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhySection;
