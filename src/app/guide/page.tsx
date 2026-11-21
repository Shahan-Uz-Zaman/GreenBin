'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Leaf,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Compass,
  FileText,
  Info,
} from 'lucide-react';
import { WasteCategory } from '@/lib/wasteData';

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState<'all' | WasteCategory>('all');

  const categories = [
    {
      id: 'biodegradable',
      category: 'Biodegradable' as WasteCategory,
      title: 'Biodegradable Waste',
      bin: 'Green Bin (Wet / Organic Waste)',
      binHex: '#228B52',
      badgeClass: 'bg-green-50 text-emerald-800 border-green-200',
      icon: Leaf,
      description:
        'Biodegradable waste consists of organic material capable of decomposing naturally into soil and fertilizer under the action of microorganisms.',
      examples: [
        'Fruit and vegetable peels',
        'Leftover cooked foods and bread',
        'Coffee grounds & paper tea bags',
        'Crushed eggshells',
        'Garden dry leaves and lawn clippings',
        'Natural wood toothpicks and coconut shells',
      ],
      instructions: [
        'Collect kitchen organic waste in a dedicated wet bin lined with paper or compostable bags.',
        'Do NOT mix plastic wrappings, grocery stickers, or twist ties with vegetable matter.',
        'Drain excess gravies or liquids into the sink drain to minimize moisture buildup.',
        'Transfer to your community vermicompost pit or municipal green bin daily.',
      ],
      dos: [
        'Compost at home whenever possible to enrich garden soil.',
        'Remove synthetic mesh bags from tea leaves.',
        'Crush eggshells to accelerate decomposition.',
      ],
      donts: [
        'Never wrap wet waste inside non-biodegradable polythene bags.',
        'Do not dump dead electronic batteries or chemical bottles into wet bins.',
        'Avoid dumping large animal bones that do not break down in simple compost pits.',
      ],
    },
    {
      id: 'recyclable',
      category: 'Recyclable' as WasteCategory,
      title: 'Recyclable Waste',
      bin: 'Blue Bin (Dry Recyclables)',
      binHex: '#1E88E5',
      badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: RefreshCw,
      description:
        'Dry solid materials that can be remanufactured into new products. Keeping them clean and dry is essential to prevent contamination.',
      examples: [
        'PET plastic bottles (#1) and HDPE bottles (#2)',
        'Newspapers, books, magazines & office paper',
        'Cardboard shipping boxes & cereal cartons',
        'Soda cans, tin food cans & clean aluminum foil',
        'Glass beverage bottles and glass jars',
        'Aseptic Tetra Pak cartons (milk & juice)',
      ],
      instructions: [
        'Empty and rinse containers to remove sugary or oily food residues.',
        'Flatten cardboard boxes and crush plastic bottles to save collection space.',
        'Keep dry items completely separated from kitchen wet waste.',
        'Screw plastic bottle caps back onto bottles before disposal so they do not get lost.',
      ],
      dos: [
        'Rinse jars and food cans before tossing into the blue bin.',
        'Bundle newspapers and cardboard neatly.',
        'Look for the recycling chasing arrows symbol (#1, #2, #5).',
      ],
      donts: [
        'Do not place oil-soaked pizza boxes into paper recycling.',
        'Do not include broken window mirrors, ceramics, or crystal glassware.',
        'Avoid single-use thin polythene pouches that clog recycling sorter machinery.',
      ],
    },
    {
      id: 'hazardous',
      category: 'Hazardous' as WasteCategory,
      title: 'Hazardous & Special Waste',
      bin: 'Red Bin / Designated Special Collection',
      binHex: '#E53935',
      badgeClass: 'bg-red-50 text-red-800 border-red-200',
      icon: AlertTriangle,
      description:
        'Materials containing toxic chemicals, corrosive compounds, heavy metals, or infectious agents that pose severe risks to sanitation workers and environment.',
      examples: [
        'AA, AAA, lithium-ion, and button cell batteries',
        'Old smartphones, chargers, laptops & e-waste',
        'Expired medicines, antibiotics & blister packs',
        'Fluorescent tube lights & compact fluorescent lamps (CFL)',
        'Paints, chemical solvents, bleaches & pesticides',
        'Used syringes and sanitary waste (wrapped securely)',
      ],
      instructions: [
        'Tape battery terminals with clear tape to prevent short circuits and fire hazards.',
        'Keep chemical solvents in their original labeled containers.',
        'Never flush unused medicines down the toilet or kitchen drain.',
        'Deliver to certified e-waste drives, pharmacy take-backs, or hazardous drop-off kiosks.',
      ],
      dos: [
        'Store household batteries safely until visiting an authorized e-waste kiosk.',
        'Return expired medications to local pharmacy take-back bins.',
        'Handle fluorescent bulbs gently to prevent toxic mercury vapor leaks.',
      ],
      donts: [
        'Never throw batteries or electronics into household garbage.',
        'Never pour leftover paint or automotive fluids into storm drains.',
        'Do not burn hazardous plastic containers or medicine packaging.',
      ],
    },
  ];

  const displayedCategories =
    activeTab === 'all'
      ? categories
      : categories.filter((c) => c.category === activeTab);

  return (
    <div className="py-10 sm:py-14 bg-gray-50/50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-forest">
            Comprehensive Reference
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-1">
            Waste Segregation Guide
          </h1>
          <p className="mt-2 text-sm text-gray-600 max-w-xl mx-auto">
            Learn proper source segregation for Biodegradable, Recyclable, and Hazardous waste to minimize landfill burden and protect public health.
          </p>

          {/* Category filter tabs */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'all'
                  ? 'bg-forest text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              All Categories
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('Biodegradable')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'Biodegradable'
                  ? 'bg-[#228B52] text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#228B52]"></span>
              Biodegradable
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('Recyclable')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'Recyclable'
                  ? 'bg-[#1E88E5] text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#1E88E5]"></span>
              Recyclable
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('Hazardous')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'Hazardous'
                  ? 'bg-[#E53935] text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#E53935]"></span>
              Hazardous
            </button>
          </div>
        </div>

        {/* Categories Sections */}
        <div className="space-y-10">
          {displayedCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <section
                key={cat.id}
                id={cat.id}
                className="card-stitch bg-white p-6 sm:p-8 border border-gray-200 shadow-sm scroll-mt-20"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: cat.binHex }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {cat.title}
                      </h2>
                      <p className="text-xs font-medium text-gray-500">
                        {cat.bin}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cat.badgeClass}`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cat.binHex }}
                    ></span>
                    Target Bin: {cat.bin.split(' ')[0]}
                  </span>
                </div>

                {/* Description */}
                <p className="mt-4 text-sm text-gray-700 leading-relaxed">
                  {cat.description}
                </p>

                {/* Common Examples */}
                <div className="mt-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2.5">
                    Common Examples
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {cat.examples.map((ex, i) => (
                      <div
                        key={i}
                        className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 text-xs font-medium text-gray-800 flex items-center gap-2"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.binHex }}
                        ></span>
                        <span className="truncate">{ex}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Segregation Instructions */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-forest" />
                    Proper Segregation Steps
                  </h3>
                  <div className="space-y-2">
                    {cat.instructions.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700 bg-gray-50/60 p-3 rounded-lg border border-gray-100"
                      >
                        <span className="w-5 h-5 rounded-full bg-forest-subtle text-forest text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dos and Don'ts */}
                <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dos */}
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      Recommended Practices (Do&apos;s)
                    </h4>
                    <ul className="space-y-1.5 text-xs text-emerald-950">
                      {cat.dos.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-700 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Don'ts */}
                  <div className="p-4 rounded-xl bg-red-50/60 border border-red-100">
                    <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                      <XCircle className="w-4 h-4 text-red-700" />
                      Harmful Mistakes (Don&apos;ts)
                    </h4>
                    <ul className="space-y-1.5 text-xs text-red-950">
                      {cat.donts.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-red-700 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Quick Helper CTA */}
        <div className="mt-12 bg-white card-stitch p-6 text-center border-gray-200">
          <h3 className="text-base font-bold text-gray-900 mb-1">
            Unsure About a Specific Item?
          </h3>
          <p className="text-xs text-gray-600 mb-4 max-w-md mx-auto">
            Use the Waste Classifier search engine to instantly look up any item by name or material type.
          </p>
          <Link
            href="/classifier"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-dark transition-colors shadow-2xs"
          >
            <Compass className="w-4 h-4" />
            Open Waste Classifier
          </Link>
        </div>
      </div>
    </div>
  );
}
