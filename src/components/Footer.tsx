import React from 'react';
import Link from 'next/link';
import { Recycle, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-forest-subtle flex items-center justify-center text-forest">
                <Recycle className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-lg font-bold text-gray-900">
                Green<span className="text-forest">Bin</span>
              </span>
            </Link>
            <p className="text-sm text-gray-600 max-w-sm leading-relaxed">
              Make Every Waste Count. Simple, beginner-friendly smart waste management assistant promoting responsible disposal and segregation habits.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-forest transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/classifier" className="hover:text-forest transition-colors">
                  Waste Classifier
                </Link>
              </li>
              <li>
                <Link href="/guide" className="hover:text-forest transition-colors">
                  Segregation Guide
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-forest transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="hover:text-forest transition-colors">
                  Awareness Quiz
                </Link>
              </li>
            </ul>
          </div>

          {/* Waste Categories */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Segregation Bins
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#228B52]"></span>
                <span>Green: Biodegradable</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E88E5]"></span>
                <span>Blue: Recyclable</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E53935]"></span>
                <span>Red: Hazardous & E-Waste</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <p>© {new Date().getFullYear()} GreenBin. Built for a cleaner, greener planet.</p>
          <p className="flex items-center gap-1">
            Designed for responsible living
          </p>
        </div>
      </div>
    </footer>
  );
}
