import { Metadata } from 'next';
import HomePageClient from '@/components/HomePageClient';

interface HomePageProps {
  params: Promise<{
    lang: string;
  }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { lang } = await params;
  
  // Basic SEO - in a real app, fetch this from CMS/DB based on lang
  const titles: Record<string, string> = {
    id: 'Bromo Ijen Tour & Travel - Paket Wisata Gunung Berapi Terbaik',
    en: 'Bromo Ijen Tour & Travel - Best Volcano Tours Indonesia',
    de: 'Bromo Ijen Tour & Travel - Beste Vulkantouren Indonesien',
    nl: 'Bromo Ijen Tour & Travel - Beste Vulkaantours Indonesië',
    zh: 'Bromo Ijen Tour & Travel - 印尼最佳火山旅游',
  };

  const descriptions: Record<string, string> = {
    id: 'Nikmati petualangan gunung berapi yang menakjubkan dengan pemandu profesional. Pesan tur Gunung Bromo dan Kawah Ijen Anda hari ini!',
    en: 'Experience breathtaking volcanic adventures with professional guides. Book your Mount Bromo and Ijen Crater tour today!',
    de: 'Erleben Sie atemberaubende Vulkanabenteuer mit professionellen Guides. Buchen Sie noch heute Ihre Tour zum Mount Bromo und Ijen-Krater!',
    nl: 'Beleef adembenemende vulkaanavonturen met professionele gidsen. Boek vandaag nog uw Mount Bromo en Ijen Crater tour!',
    zh: '与专业导游一起体验惊险刺激的火山探险。立即预订您的布罗莫火山和伊真火山口之旅！',
  };

  return {
    title: titles[lang] || titles['en'],
    description: descriptions[lang] || descriptions['en'],
    alternates: {
      canonical: `https://bromoijen.com/${lang}`,
      languages: {
        'en': 'https://bromoijen.com/en',
        'id': 'https://bromoijen.com/id',
        'de': 'https://bromoijen.com/de',
        'nl': 'https://bromoijen.com/nl',
        'zh': 'https://bromoijen.com/zh',
      },
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params;
  
  return <HomePageClient lang={lang} />;
}
