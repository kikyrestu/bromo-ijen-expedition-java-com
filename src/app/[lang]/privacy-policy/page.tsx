import { Metadata } from 'next';
import DynamicHeader from '@/components/DynamicHeader';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy - Bromo Ijen Adventure',
  description: 'Privacy Policy for Bromo Ijen Adventure Tour & Travel',
};

interface PrivacyPolicyPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function PrivacyPolicyPage({ params }: PrivacyPolicyPageProps) {
  const { lang } = await params;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DynamicHeader />
      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg prose-slate max-w-none">
            <p className="text-slate-600 mb-6">
              Last updated: December 7, 2025
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Introduction</h2>
            <p className="text-slate-600 mb-4">
              Welcome to Bromo Ijen Adventure ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Information We Collect</h2>
            <p className="text-slate-600 mb-4">
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
            </p>
            <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
              <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
              <li><strong>Technical Data</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform and other technology on the devices you use to access this website.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. How We Use Your Personal Data</h2>
            <p className="text-slate-600 mb-4">
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal or regulatory obligation.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Data Security</h2>
            <p className="text-slate-600 mb-4">
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Contact Us</h2>
            <p className="text-slate-600 mb-4">
              If you have any questions about this privacy policy or our privacy practices, please contact us via WhatsApp or email provided in our contact section.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
