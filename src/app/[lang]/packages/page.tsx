import { Metadata } from 'next';
import DynamicHeader from '@/components/DynamicHeader';
import TourPackagesClient from '@/components/TourPackagesClient';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Tour Packages - Bromo Ijen Adventure',
  description: 'Explore our amazing tour packages: Bromo Sunrise, Ijen Blue Fire, and Combo Tours. Book your adventure today!',
};

interface PackagesPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function PackagesPage({ params }: PackagesPageProps) {
  const { lang } = await params;

  return (
    <div className="min-h-screen flex flex-col">
      <DynamicHeader />
      <main className="flex-grow pt-20">
        <TourPackagesClient lang={lang} />
      </main>
      <Footer />
    </div>
  );
}

