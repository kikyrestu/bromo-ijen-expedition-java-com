import { Metadata } from 'next';
import DynamicHeader from '@/components/DynamicHeader';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service - Bromo Ijen Adventure',
  description: 'Terms of Service for Bromo Ijen Adventure Tour & Travel',
};

interface TermsPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { lang } = await params;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DynamicHeader />
      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg prose-slate max-w-none">
            <p className="text-slate-600 mb-6">
              Last updated: December 7, 2025
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Agreement to Terms</h2>
            <p className="text-slate-600 mb-4">
              By accessing our website and booking our services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Booking and Payments</h2>
            <p className="text-slate-600 mb-4">
              All bookings are subject to availability and confirmation. A deposit may be required to secure your booking. Full payment terms will be provided at the time of booking.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Cancellation and Refunds</h2>
            <p className="text-slate-600 mb-4">
              Cancellation policies vary depending on the tour package and timing of cancellation. Please refer to the specific cancellation policy provided with your booking confirmation. Generally, cancellations made within 24 hours of the tour start time are non-refundable.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Liability</h2>
            <p className="text-slate-600 mb-4">
              While we take every precaution to ensure your safety, Bromo Ijen Adventure is not liable for any personal injury, loss, or damage to property during the tour, except where such liability cannot be excluded by law. We recommend all travelers obtain comprehensive travel insurance.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Changes to Itinerary</h2>
            <p className="text-slate-600 mb-4">
              We reserve the right to alter itineraries due to weather conditions, safety concerns, or other unforeseen circumstances. We will make every effort to provide a comparable alternative.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Governing Law</h2>
            <p className="text-slate-600 mb-4">
              These terms shall be governed by and construed in accordance with the laws of Indonesia.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
