import { Metadata } from 'next';
import DynamicHeader from '@/components/DynamicHeader';
import BlogDetailClient from '@/components/BlogDetailClient';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Blog Post - Bromo Ijen Adventure',
  description: 'Read our latest travel guides and adventure stories.',
};

interface BlogDetailPageProps {
  params: Promise<{
    id: string;
    lang: string;
  }>;
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { id, lang } = await params;

  return (
    <div className="min-h-screen flex flex-col">
      <DynamicHeader />
      <main className="flex-grow pt-20">
        <BlogDetailClient params={Promise.resolve({ id, lang })} />
      </main>
      <Footer />
    </div>
  );
}
