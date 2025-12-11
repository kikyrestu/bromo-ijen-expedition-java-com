import { Metadata } from 'next';
import DynamicHeader from '@/components/DynamicHeader';
import PackageDetailClient from '@/components/PackageDetailClient';
import Footer from '@/components/Footer';
import { PrismaClient } from '@/generated/prisma';
import { getPackageTranslation } from '@/lib/auto-translate';

const prisma = new PrismaClient();

interface PackageDetailPageProps {
  params: Promise<{
    id: string;
    lang: string;
  }>;
}

export async function generateMetadata({ params }: PackageDetailPageProps): Promise<Metadata> {
  const { id, lang } = await params;
  
  // Try to find by slug first, then ID
  let pkg = await prisma.package.findFirst({
    where: { slug: id }
  });

  if (!pkg) {
    pkg = await prisma.package.findUnique({
      where: { id }
    });
  }

  if (!pkg) {
    return {
      title: 'Package Not Found',
      description: 'The package you are looking for does not exist.'
    };
  }

  // Get translation if needed
  if (lang && lang !== 'id' && ['en', 'de', 'nl', 'zh'].includes(lang)) {
    const translation = await getPackageTranslation(pkg.id, lang as 'en' | 'de' | 'nl' | 'zh');
    if (translation) {
      pkg = { ...pkg, ...translation };
    }
  }

  return {
    title: `${pkg.title} | Bromo Ijen Tour`,
    description: pkg.description?.substring(0, 160) || 'Book your dream volcano tour with expert guides',
    openGraph: {
      title: pkg.title,
      description: pkg.description?.substring(0, 160),
      images: pkg.image ? [pkg.image] : [],
    }
  };
}

export default async function PackageDetailPage({ params }: PackageDetailPageProps) {
  const { id, lang } = await params;

  return (
    <div className="min-h-screen flex flex-col">
      <DynamicHeader />
      <main className="flex-grow pt-20">
        <PackageDetailClient params={Promise.resolve({ id, lang })} />
      </main>
      <Footer />
    </div>
  );
}
