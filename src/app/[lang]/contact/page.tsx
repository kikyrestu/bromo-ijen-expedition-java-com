import { Metadata } from 'next';

interface ContactPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { lang } = await params;
  
  const titles: Record<string, string> = {
    id: 'Kontak Kami',
    en: 'Contact Us',
    de: 'Kontaktieren Sie uns',
    nl: 'Neem contact met ons op',
    zh: '联系我们'
  };
  
  return {
    title: titles[lang] || titles.en,
    description: 'Get in touch with us for your Bromo Ijen adventure'
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { lang } = await params;
  
  const content: Record<string, { title: string; subtitle: string; description: string }> = {
    id: {
      title: 'Kontak Kami',
      subtitle: 'Hubungi Kami',
      description: 'Silakan hubungi kami untuk informasi lebih lanjut tentang paket wisata Bromo Ijen.'
    },
    en: {
      title: 'Contact Us',
      subtitle: 'Get in Touch',
      description: 'Please contact us for more information about our Bromo Ijen tour packages.'
    },
    de: {
      title: 'Kontaktieren Sie uns',
      subtitle: 'Kontakt aufnehmen',
      description: 'Bitte kontaktieren Sie uns für weitere Informationen zu unseren Bromo Ijen Tourpaketen.'
    },
    nl: {
      title: 'Neem contact met ons op',
      subtitle: 'Contact opnemen',
      description: 'Neem contact met ons op voor meer informatie over onze Bromo Ijen tourpakketten.'
    },
    zh: {
      title: '联系我们',
      subtitle: '取得联系',
      description: '请联系我们了解更多关于我们的布罗莫伊真旅游套餐的信息。'
    }
  };
  
  const pageContent = content[lang] || content.en;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {pageContent.title}
          </h1>
          <p className="text-xl text-gray-600 mb-2">{pageContent.subtitle}</p>
          <p className="text-gray-500">{pageContent.description}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {lang === 'id' 
                ? 'Untuk informasi lebih lanjut, silakan hubungi kami melalui WhatsApp atau email.'
                : 'For more information, please contact us via WhatsApp or email.'}
            </p>
            <div className="space-y-4">
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {lang === 'id' ? 'Hubungi via WhatsApp' : 'Contact via WhatsApp'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

