import React from 'react';
import Link from 'next/link';
import { ArrowRight, Leaf, RefreshCw, AlertTriangle } from 'lucide-react';
import { WasteCategory } from '@/lib/wasteData';

interface WasteCardProps {
  category: WasteCategory;
  title: string;
  binColorName: string;
  description: string;
  examples: string[];
  binColorHex: string;
}

export default function WasteCard({
  category,
  title,
  binColorName,
  description,
  examples,
  binColorHex,
}: WasteCardProps) {
  const getCategoryStyles = () => {
    switch (category) {
      case 'Biodegradable':
        return {
          icon: Leaf,
          badgeBg: 'bg-green-50 text-emerald-800 border-green-200',
          dotBg: 'bg-[#228B52]',
          tag: 'Green Bin',
        };
      case 'Recyclable':
        return {
          icon: RefreshCw,
          badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
          dotBg: 'bg-[#1E88E5]',
          tag: 'Blue Bin',
        };
      case 'Hazardous':
        return {
          icon: AlertTriangle,
          badgeBg: 'bg-red-50 text-red-800 border-red-200',
          dotBg: 'bg-[#E53935]',
          tag: 'Red / Special Bin',
        };
    }
  };

  const config = getCategoryStyles();
  const IconComponent = config.icon;

  return (
    <div className="card-stitch p-6 flex flex-col justify-between hover:border-gray-300">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
            style={{ backgroundColor: binColorHex }}
          >
            <IconComponent className="w-6 h-6" />
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.badgeBg}`}
          >
            <span className={`w-2 h-2 rounded-full ${config.dotBg}`}></span>
            {config.tag}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-xs font-medium text-gray-500 mb-3">{binColorName}</p>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">{description}</p>

        <div className="border-t border-gray-100 pt-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-2">
            Common Examples
          </span>
          <div className="flex flex-wrap gap-1.5">
            {examples.map((item, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md text-xs bg-gray-50 text-gray-700 border border-gray-100 font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <Link
          href={`/guide#${category.toLowerCase()}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:text-forest-dark transition-colors"
        >
          View Full Guidelines
          <ArrowRight className="w-4 h-4 ml-0.5" />
        </Link>
      </div>
    </div>
  );
}
