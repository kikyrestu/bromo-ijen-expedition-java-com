import HomePageClient from '@/components/HomePageClient';

interface HomePageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params;
  
  return <HomePageClient lang={lang} />;
}
