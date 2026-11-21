'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Recycle, Menu, X, Compass, CheckCircle2, BarChart3, HelpCircle, LogOut, User as UserIcon, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/classifier', label: 'Waste Classifier', icon: Compass },
  { href: '/guide', label: 'Segregation Guide', icon: CheckCircle2 },
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/quiz', label: 'Quiz', icon: HelpCircle },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.displayName || user.email?.split('@')[0] || 'User';
  };

  const getUserInitial = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-forest-subtle flex items-center justify-center text-forest group-hover:bg-forest group-hover:text-white transition-colors duration-200">
              <Recycle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-gray-900 leading-none">
                Green<span className="text-forest">Bin</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                Smart Waste Assistant
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'text-forest bg-forest-subtle font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions & Auth */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/classifier"
              className="px-3.5 py-2 text-sm font-medium rounded-xl bg-forest-subtle text-forest hover:bg-forest hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4" />
              Classify
            </Link>

            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-7 h-7 rounded-lg bg-forest text-white font-semibold text-xs flex items-center justify-center shadow-xs">
                    {getUserInitial()}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 max-w-[120px] truncate">
                    {getUserDisplayName()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="p-2 rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 py-2 text-sm font-medium rounded-xl bg-forest text-white hover:bg-forest-dark transition-colors shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-100 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active
                    ? 'text-forest bg-forest-subtle font-semibold'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {link.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-gray-100 space-y-2">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-forest text-white font-semibold text-xs flex items-center justify-center">
                    {getUserInitial()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{getUserDisplayName()}</span>
                    <span className="text-xs text-gray-500 truncate">{user.email}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 text-center text-sm font-medium rounded-xl text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-4 text-center text-sm font-medium rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors block"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-4 text-center text-sm font-medium rounded-xl bg-forest text-white hover:bg-forest-dark transition-colors block shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
