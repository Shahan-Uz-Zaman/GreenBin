import React from 'react';
import Link from 'next/link';
import {
  Compass,
  BookOpen,
  ArrowRight,
  Search,
  CheckCircle2,
  Trash2,
  Sparkles,
  BarChart3,
  Award,
} from 'lucide-react';
import WasteCard from '@/components/WasteCard';
import HomeUnifiedHub from '@/components/HomeUnifiedHub';

export default function HomePage() {
  const categories = [
    {
      category: 'Biodegradable' as const,
      title: 'Biodegradable Waste',
      binColorName: 'Green Bin (Wet / Organic Waste)',
      binColorHex: '#228B52',
      description:
        'Organic waste that decomposes naturally through bacterial activity into rich soil nutrients.',
      examples: ['Fruit Peels', 'Vegetable Scraps', 'Coffee Grounds', 'Eggshells', 'Dry Leaves'],
    },
    {
      category: 'Recyclable' as const,
      title: 'Recyclable Waste',
      binColorName: 'Blue Bin (Dry Recyclables)',
      binColorHex: '#1E88E5',
      description:
        'Clean and dry materials that can be processed and transformed into reusable raw products.',
      examples: ['Plastic Bottles', 'Newspaper', 'Cardboard', 'Glass Jars', 'Aluminum Cans'],
    },
    {
      category: 'Hazardous' as const,
      title: 'Hazardous & Special Waste',
      binColorName: 'Red Bin (Special Disposal)',
      binColorHex: '#E53935',
      description:
        'Substances that pose toxic, chemical, or biological threats to health and groundwater.',
      examples: ['Batteries', 'Expired Medicines', 'Paint Cans', 'E-Waste', 'CFL Bulbs'],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-forest-50/60 via-white to-white border-b border-gray-100 pt-14 pb-16 sm:pt-18 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-subtle text-forest text-xs font-semibold border border-forest-200 mb-5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Environmental Awareness</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Make Every <span className="text-forest">Waste Count.</span>
          </h1>

          {/* Description */}
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            GreenBin helps you accurately identify waste categories, master proper segregation, and practice responsible disposal habits.
          </p>

          {/* UNIFIED INTERACTIVE PANEL DIRECTLY BELOW */}
          <div className="mt-10 text-left">
            <HomeUnifiedHub />
          </div>
        </div>
      </section>

      {/* Three Waste Categories Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Three Bins, One Cleaner World
            </h2>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Every item has its proper place. Segregating waste at the source prevents landfill overflow and protects natural ecosystems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <WasteCard
                key={cat.category}
                category={cat.category}
                title={cat.title}
                binColorName={cat.binColorName}
                binColorHex={cat.binColorHex}
                description={cat.description}
                examples={cat.examples}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50/60 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest">
              Simple & Beginner Friendly
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mt-1">
              How GreenBin Works
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Three straightforward steps to dispose of any household or office item correctly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="card-stitch p-6 text-left relative overflow-hidden">
              <div className="text-4xl font-extrabold text-forest/15 absolute right-4 top-3 select-none">
                01
              </div>
              <div className="w-10 h-10 rounded-xl bg-forest-subtle flex items-center justify-center text-forest mb-4 font-bold">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">
                Search Waste Item
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Type any waste item name into the search box to instantly identify its material category.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card-stitch p-6 text-left relative overflow-hidden">
              <div className="text-4xl font-extrabold text-recycle/15 absolute right-4 top-3 select-none">
                02
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-recycle mb-4 font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">
                Check Recommended Bin
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                View whether it belongs in the Green, Blue, or Red bin, along with crucial prep guidelines like rinsing or taping terminals.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card-stitch p-6 text-left relative overflow-hidden">
              <div className="text-4xl font-extrabold text-hazard/15 absolute right-4 top-3 select-none">
                03
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-hazard mb-4 font-bold">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">
                Dispose Responsibly
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Log your disposal on the dashboard, monitor your recycling footprint, and test your knowledge with interactive quizzes.
              </p>
            </div>
          </div>

          {/* Quick Features Highlight Banner */}
          <div className="mt-12 bg-white card-stitch p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-forest-subtle flex items-center justify-center text-forest shrink-0">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  Track Your Waste Footprint
                </h4>
                <p className="text-xs text-gray-600">
                  View waste segregation metrics and activity breakdown on your personalized dashboard.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link
                href="/dashboard"
                className="px-4 py-2.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors w-full md:w-auto text-center"
              >
                View Dashboard
              </Link>
              <Link
                href="/quiz"
                className="px-4 py-2.5 text-xs font-semibold rounded-lg bg-forest text-white hover:bg-forest-dark transition-colors flex items-center justify-center gap-1.5 w-full md:w-auto text-center"
              >
                <Award className="w-3.5 h-3.5" />
                Take Eco Quiz
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
