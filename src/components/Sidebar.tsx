'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Compass, BookOpen, Award, Sparkles, ShieldCheck } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/classifier', label: 'Identify Waste', icon: Compass },
    { href: '/guide', label: 'Segregation Guide', icon: BookOpen },
    { href: '/quiz', label: 'Awareness Quiz', icon: Award },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-r border-gray-100 flex flex-col justify-between p-4 sm:p-6 lg:min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 px-3">
            Management
          </span>
          <nav className="mt-2 space-y-1">
            {menuItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-forest-subtle text-forest font-semibold shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-forest' : 'text-gray-600'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick Tips Box */}
        <div className="bg-forest-subtle/70 rounded-xl p-4 border border-forest-200">
          <div className="flex items-center gap-2 text-forest-dark font-semibold text-xs mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Green Tip of the Day</span>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">
            Always rinse food containers before recycling. A single soiled item can contaminate an entire recycling batch!
          </p>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-600">
        <ShieldCheck className="w-4 h-4 text-forest" />
        <span>Stitch Design System Standard</span>
      </div>
    </aside>
  );
}
