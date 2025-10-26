import { Metadata } from 'next';
import DynamicHeader from '@/components/DynamicHeader';
import BlogClient from '@/components/BlogClient';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Blog - Bromo Ijen Adventure',
  description: 'Read our latest travel tips, guides, and stories about Bromo and Ijen adventures.',
};

interface BlogPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { lang } = await params;

  return (
    <div className="min-h-screen flex flex-col">
      <DynamicHeader />
      <main className="flex-grow pt-20">
        <BlogClient lang={lang} />
      </main>
      <Footer />
    </div>
  );
}

