'use client';

import { Shield, Users, Clock, Award, Heart, Globe } from 'lucide-react';

const WhySection = () => {
  const features = [
    {
      icon: Shield,
      title: "Keamanan Terjamin",
      description: "Prioritas utama kami adalah keselamatan dan keamanan Anda. Semua aktivitas telah melalui prosedur keamanan yang ketat dengan tim guide berpengalaman."
    },
    {
      icon: Users,
      title: "Tim Profesional",
      description: "Tim guide kami adalah profesional yang telah berpengalaman bertahun-tahun dan memiliki pengetahuan mendalam tentang destinasi wisata Indonesia."
    },
    {
      icon: Clock,
      title: "Fleksibilitas Waktu",
      description: "Kami memahami kebutuhan setiap traveler. Paket wisata kami dapat disesuaikan dengan jadwal dan preferensi Anda untuk pengalaman yang lebih personal."
    },
    {
      icon: Award,
      title: "Kualitas Terbaik",
      description: "Kami hanya bekerja dengan partner terpercaya dan menyediakan akomodasi serta transportasi berkualitas tinggi untuk kenyamanan maksimal."
    },
    {
      icon: Heart,
      title: "Pelayanan Ramah",
      description: "Tim customer service kami siap membantu Anda 24/7 dengan pelayanan yang ramah dan responsif untuk memastikan perjalanan Anda berjalan lancar."
    },
    {
      icon: Globe,
      title: "Destinasi Eksklusif",
      description: "Kami menghadirkan destinasi-destinasi tersembunyi yang belum banyak diketahui wisatawan, memberikan pengalaman unik dan tak terlupakan."
    }
  ];

  return (
    <section id="why" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Choose <span className="text-orange-600">Us?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Kami berkomitmen untuk memberikan pengalaman traveling terbaik dengan standar pelayanan yang tinggi. 
            Berikut adalah alasan mengapa ribuan wisatawan mempercayai kami untuk perjalanan mereka.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
            >
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-orange-700 transition-colors duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Your Adventure?
            </h3>
            <p className="text-xl mb-8 text-orange-100">
              Bergabunglah dengan ribuan wisatawan yang telah mempercayai kami untuk perjalanan mereka yang tak terlupakan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-orange-600 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
                Explore Packages
              </button>
              <button className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-orange-600 font-semibold rounded-full transition-all duration-300 transform hover:scale-105">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhySection;
