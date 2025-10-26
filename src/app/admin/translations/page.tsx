import TranslationCoverageDisplay from '@/components/TranslationCoverageDisplay';

export const metadata = {
  title: 'Translation Coverage - Admin Dashboard',
  description: 'Monitor translation coverage across all content sections'
};

export default function TranslationCoveragePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Translation Coverage Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor translation status across all content sections. Check which items need translation or have incomplete translations.
          </p>
        </div>

        <TranslationCoverageDisplay autoRefresh={true} refreshInterval={60} />
      </div>
    </div>
  );
}
