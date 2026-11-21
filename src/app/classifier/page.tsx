'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Leaf,
  RefreshCw,
  AlertTriangle,
  BookmarkCheck,
  RotateCcw,
  Sparkles,
  Bot,
  User,
  Scale,
  LayoutDashboard,
} from 'lucide-react';
import {
  classifyWaste,
  ClassificationResult,
  WasteCategory,
  WasteItem,
} from '@/lib/wasteData';
import { useAuth } from '@/context/AuthContext';
import { addUserActivity } from '@/lib/userService';

type ClassifierResult = ClassificationResult & {
  aiStatus?: 'unavailable' | 'missing_key';
  aiErrorCode?: string;
};

const WEIGHT_PRESETS = [0.1, 0.25, 0.5, 1.0, 2.0, 5.0];

export default function ClassifierPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState<ClassifierResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [loggedNotification, setLoggedNotification] = useState(false);
  const [loggedWeight, setLoggedWeight] = useState<number>(0.5);
  const [isVerifying, setIsVerifying] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  const [usedAI, setUsedAI] = useState<boolean>(false);
  const [quantityKg, setQuantityKg] = useState<number>(0.5);

  // Popular quick-suggestion items
  const popularItems = [
    'Plastic Bottle',
    'Banana Peel',
    'Battery',
    'Newspaper',
    'Cardboard Box',
    'Glass Bottle',
    'Vegetable Scraps',
    'Smartphone',
  ];

  const recordActivity = (item: WasteItem, weight: number) => {
    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const payload = {
      item: item.name,
      category: item.category,
      bin: item.binName,
      weightKg: weight,
      date: dateStr,
      timestamp: Date.now(),
    };

    if (user) {
      addUserActivity(user.uid, payload);
    } else {
      // Guest session fallback
      try {
        const existingLogs = JSON.parse(
          localStorage.getItem('greenbin_recent_activity') || '[]'
        );
        const newLog = {
          id: Date.now().toString(),
          ...payload,
        };
        localStorage.setItem(
          'greenbin_recent_activity',
          JSON.stringify([newLog, ...existingLogs.slice(0, 29)])
        );
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSearch = (termToSearch?: string) => {
    const query = termToSearch !== undefined ? termToSearch : searchTerm;
    if (!query.trim()) return;

    setHasSearched(false);
    setLoggedNotification(false);
    setConfidenceScore(null);
    setUsedAI(false);
    setIsVerifying(true);

    if (termToSearch) {
      setSearchTerm(termToSearch);
    }

    fetch('/api/classify-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemName: query }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (data.success && data.item) {
          setUsedAI(!!(data.usedOpenAI || data.usedGemini));
          setConfidenceScore(data.confidence ? Math.round(data.confidence * 100) : null);
          setResult({
            found: true,
            item: data.item,
            query: data.item.name || query,
            matchedBy: 'exact',
            aiStatus: data.aiStatus,
            aiErrorCode: data.aiErrorCode,
          });
        } else {
          const classification = classifyWaste(query);
          const finalItem = classification.item ? { ...classification.item, name: query } : undefined;
          setResult({
            ...classification,
            item: finalItem,
            aiStatus: data.aiStatus,
            aiErrorCode: data.aiErrorCode,
          });
        }
        setHasSearched(true);
      })
      .catch((error) => {
        console.warn('Classification API error, using local dataset:', error);
        setUsedAI(false);
        const classification = classifyWaste(query);
        const finalItem = classification.item ? { ...classification.item, name: query } : undefined;
        setResult({
          ...classification,
          item: finalItem,
        });
        setHasSearched(true);
      })
      .finally(() => setIsVerifying(false));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const logWasteToDashboard = () => {
    if (!result?.item) return;
    const finalWeight = quantityKg > 0 ? quantityKg : 0.5;
    recordActivity(result.item, finalWeight);
    setLoggedWeight(finalWeight);
    setLoggedNotification(true);
    setTimeout(() => setLoggedNotification(false), 5000);
  };

  const getCategoryUI = (category: WasteCategory) => {
    switch (category) {
      case 'Biodegradable':
        return {
          icon: Leaf,
          color: '#228B52',
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-900',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          borderAccent: 'border-l-4 border-l-[#228B52]',
        };
      case 'Recyclable':
        return {
          icon: RefreshCw,
          color: '#1E88E5',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-900',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
          borderAccent: 'border-l-4 border-l-[#1E88E5]',
        };
      case 'Hazardous':
        return {
          icon: AlertTriangle,
          color: '#E53935',
          bgColor: 'bg-rose-50',
          textColor: 'text-rose-900',
          badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
          borderAccent: 'border-l-4 border-l-[#E53935]',
        };
      default:
        return {
          icon: AlertCircle,
          color: '#6B7280',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-900',
          badgeColor: 'bg-gray-100 text-gray-800 border-gray-300',
          borderAccent: 'border-l-4 border-l-gray-400',
        };
    }
  };

  return (
    <div className="py-10 sm:py-14 bg-gray-50/50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-subtle text-forest text-xs font-semibold mb-3 border border-forest-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Verified Waste Classification</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Identify Waste & Bin Placement
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Search any household item to get its exact waste category, correct disposal bin, and segregation instructions.
          </p>

          {/* User state banner */}
          {user ? (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              <User className="w-3.5 h-3.5 text-forest" />
              <span>
                Logged in as <strong>{user.displayName || user.email}</strong> — items you log save directly to your dashboard.
              </span>
            </div>
          ) : (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>
                Browsing in Guest Mode.{' '}
                <Link href="/login?redirect=/classifier" className="font-semibold underline hover:text-amber-950">
                  Log in
                </Link>{' '}
                to permanently sync activity to your personal cloud dashboard.
              </span>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="card-stitch bg-white p-6 sm:p-8 shadow-sm mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter waste item (e.g., Plastic bottle, Battery, Banana peel, Milk carton...)"
              className="w-full pl-12 pr-28 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest text-sm sm:text-base text-gray-900 placeholder-gray-400 shadow-2xs transition-all"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <button
              type="button"
              onClick={() => handleSearch()}
              disabled={isVerifying || !searchTerm.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-forest hover:bg-forest-dark text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-2xs"
            >
              {isVerifying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <span>Classify</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500 mr-1">Popular:</span>
            {popularItems.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleSearch(item)}
                className="px-2.5 py-1 rounded-lg text-xs bg-gray-50 text-gray-700 hover:bg-forest-subtle hover:text-forest transition-colors font-medium border border-gray-100"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Verification in Progress State */}
        {isVerifying && (
          <div className="card-stitch bg-white p-8 shadow-sm text-center mb-8">
            <div className="w-10 h-10 border-3 border-forest/20 border-t-forest rounded-full animate-spin mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-900">
              Verifying &quot;{searchTerm}&quot;...
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Checking database and AI classification guidelines
            </p>
          </div>
        )}

        {/* Results Section */}
        {hasSearched && result && !isVerifying && (
          <div>
            {result.found && result.item ? (
              <div className="card-stitch bg-white p-6 sm:p-8 shadow-sm">
                {/* Result Top Badge */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        getCategoryUI(result.item.category).badgeColor
                      }`}
                    >
                      {React.createElement(getCategoryUI(result.item.category).icon, {
                        className: 'w-3.5 h-3.5',
                      })}
                      {result.item.category} Waste
                    </span>

                    {usedAI && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Bot className="w-3 h-3 text-emerald-600" />
                        AI Verified
                      </span>
                    )}

                    {confidenceScore !== null && (
                      <span className="text-[11px] font-medium text-gray-500">
                        {confidenceScore}% confidence
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-gray-500">
                    Query: <strong className="text-gray-800">&quot;{result.query}&quot;</strong>
                  </span>
                </div>

                {/* Main Item Info */}
                <div className="py-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 capitalize">
                        {result.item.name}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1 max-w-xl">
                        {result.item.tips || result.item.disposalMethod}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                        style={{
                          backgroundColor: getCategoryUI(result.item.category).color,
                        }}
                      >
                        {React.createElement(getCategoryUI(result.item.category).icon, {
                          className: 'w-6 h-6',
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bin & Disposal Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div
                    className={`p-4 rounded-xl border ${
                      getCategoryUI(result.item.category).borderAccent
                    } ${getCategoryUI(result.item.category).bgColor}`}
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                      Designated Disposal Bin
                    </span>
                    <p className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: getCategoryUI(result.item.category).color,
                        }}
                      />
                      {result.item.binName}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                      Recommended Disposal Method
                    </span>
                    <p className="text-sm font-semibold text-gray-900">
                      {result.item.disposalMethod}
                    </p>
                  </div>
                </div>

                {/* Disposal Instructions */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-forest" />
                    Proper Disposal Instructions
                  </h3>
                  <ul className="space-y-2">
                    {result.item.instructions.map((step, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-sm text-gray-700 bg-gray-50/70 p-3 rounded-lg border border-gray-100"
                      >
                        <span className="w-5 h-5 rounded-full bg-forest-subtle text-forest text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* QUANTITY & WEIGHT SELECTION SECTION */}
                <div className="mb-6 p-5 rounded-2xl bg-forest-subtle/30 border border-forest-200/80">
                  <div className="flex items-center gap-2 mb-3">
                    <Scale className="w-4 h-4 text-forest" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-forest-dark">
                      Specify Quantity / Approx Weight (kg)
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    Choose or enter how much waste you are disposing of so your dashboard reflects real segregated weight.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {WEIGHT_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setQuantityKg(preset)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          quantityKg === preset
                            ? 'bg-forest text-white shadow-xs'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-forest/50'
                        }`}
                      >
                        {preset} kg
                      </button>
                    ))}

                    <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-gray-200">
                      <span className="text-xs text-gray-500 font-medium">Custom:</span>
                      <input
                        type="number"
                        min="0.05"
                        max="100"
                        step="0.05"
                        value={quantityKg}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val > 0) setQuantityKg(val);
                        }}
                        className="w-16 text-xs font-bold text-gray-900 border-none outline-none text-right"
                      />
                      <span className="text-xs font-semibold text-gray-600">kg</span>
                    </div>
                  </div>
                </div>

                {/* Logged Notification Toast */}
                {loggedNotification && (
                  <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold">
                        Logged {loggedWeight} kg of {result.item.name} to your dashboard!
                      </span>
                    </div>
                    <Link
                      href="/dashboard"
                      className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shrink-0 flex items-center gap-1"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      View Dashboard
                    </Link>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={logWasteToDashboard}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-forest text-white text-xs sm:text-sm font-semibold hover:bg-forest-dark transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <BookmarkCheck className="w-4 h-4" />
                    <span>Log {quantityKg} kg to Dashboard</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <Link
                      href="/dashboard"
                      className="text-xs font-semibold text-forest hover:underline flex items-center gap-1"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Go to Dashboard
                    </Link>
                    <span className="text-gray-300">|</span>
                    <Link
                      href={`/guide#${result.item.category.toLowerCase()}`}
                      className="text-xs font-semibold text-gray-600 hover:text-forest flex items-center gap-1 transition-colors"
                    >
                      View guide
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* Unsupported Item Message */
              <div className="card-stitch bg-white p-6 sm:p-8 border-amber-200 shadow-sm text-center">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Item Not Found in Predefined Database
                </h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto mb-6 leading-relaxed">
                  We could not find a confirmed category for{' '}
                  <span className="font-semibold text-gray-900">
                    &quot;{result.query}&quot;
                  </span>
                  . To avoid contamination, please verify against our Segregation Guide or local municipal rules rather than guessing.
                </p>

                {result.suggestions && result.suggestions.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 max-w-lg mx-auto mb-6">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2.5">
                      Or try searching these verified waste items:
                    </span>
                    <div className="flex flex-wrap justify-center gap-2">
                      {result.suggestions.map((sug) => (
                        <button
                          key={sug.id}
                          type="button"
                          onClick={() => handleSearch(sug.name)}
                          className="px-3 py-1.5 rounded-lg text-xs bg-white text-gray-800 border border-gray-200 hover:border-forest hover:text-forest transition-colors font-medium shadow-2xs"
                        >
                          {sug.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSearch(result.query)}
                    className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-forest text-white hover:bg-forest-dark transition-colors flex items-center gap-1.5"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    Verify with AI API
                  </button>
                  <Link
                    href="/guide"
                    className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Explore Guide
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setResult(null);
                      setHasSearched(false);
                    }}
                    className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Clear Search
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
