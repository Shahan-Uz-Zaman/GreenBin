'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Recycle, Mail, Lock, User, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/classifier';

  const { signUp, signInWithGoogle, isConfigured, user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      router.push(redirectPath);
    }
  }, [user, redirectPath, router]);

  const mapFirebaseError = (errCode: string): string => {
    switch (errCode) {
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address. Please log in.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/operation-not-allowed':
        return 'Email/Password sign-up is not enabled in your Firebase Console. Please enable it under Authentication > Sign-in method.';
      case 'auth/popup-closed-by-user':
        return 'Sign-up popup was closed before completing.';
      default:
        return 'Failed to create account. Please try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name.trim() || undefined);
      router.push(redirectPath);
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      setError(mapFirebaseError(errorObj.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.push(redirectPath);
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      setError(mapFirebaseError(errorObj.code || ''));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-6">
      {/* Brand Header */}
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
          <div className="w-11 h-11 rounded-2xl bg-forest-subtle flex items-center justify-center text-forest group-hover:bg-forest group-hover:text-white transition-colors duration-200 shadow-sm">
            <Recycle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-900">
            Green<span className="text-forest">Bin</span>
          </span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Create an account
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Join GreenBin to classify items, track stats, and earn eco badges
        </p>
      </div>

      {/* Configuration Notice if Firebase credentials not set */}
      {!isConfigured && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-amber-950">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Firebase Credentials Required in .env.local</span>
          </div>
          <p>
            To enable real authentication, paste your Firebase project config keys into{' '}
            <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">.env.local</code> and ensure
            <strong> Email/Password</strong> sign-in is enabled in your Firebase Console.
          </p>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Green"
                autoComplete="name"
                className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Password (min. 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-forest hover:bg-forest-dark text-white font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400 font-medium">Or continue with</span>
          </div>
        </div>

        {/* Google Sign Up */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={googleLoading}
          className="w-full py-2.5 px-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors flex items-center justify-center gap-2.5 disabled:opacity-60 shadow-xs"
        >
          {googleLoading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google</span>
            </>
          )}
        </button>
      </div>

      {/* Footer Link */}
      <p className="text-center text-xs text-gray-600">
        Already have an account?{' '}
        <Link
          href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
          className="font-semibold text-forest hover:text-forest-dark transition-colors"
        >
          Log in instead
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/60">
      <Suspense fallback={<div className="w-8 h-8 border-2 border-forest border-t-transparent rounded-full animate-spin" />}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
