'use client';

import React, { useState, useEffect } from 'react';
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
  Scale,
  Award,
  Calendar,
  BarChart3,
  HelpCircle,
  PlusCircle,
  LayoutDashboard,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import {
  classifyWaste,
  ClassificationResult,
  WasteCategory,
  WasteItem,
} from '@/lib/wasteData';
import { useAuth } from '@/context/AuthContext';
import {
  UserActivity,
  UserQuizScore,
  getUserActivities,
  getUserQuizScore,
  addUserActivity,
  computeUserStats,
} from '@/lib/userService';

type ClassifierResult = ClassificationResult & {
  aiStatus?: 'unavailable' | 'missing_key';
  aiErrorCode?: string;
};

const POPULAR_ITEMS = [
  'Plastic Bottle',
  'Banana Peel',
  'Battery',
  'Cardboard Box',
  'Glass Bottle',
  'Newspaper',
];

const WEIGHT_PRESETS = [0.2, 0.5, 1.0, 2.0];

const DEFAULT_SAMPLE_ACTIVITIES: UserActivity[] = [
  {
    id: 'h1',
    item: 'Plastic Water Bottles (x3)',
    category: 'Recyclable',
    bin: 'Blue Bin (Dry Recyclables)',
    weightKg: 0.35,
    date: 'Today, 09:30 AM',
    timestamp: Date.now(),
  },
  {
    id: 'h2',
    item: 'Banana Peels & Fruit Scraps',
    category: 'Biodegradable',
    bin: 'Green Bin (Wet / Organic)',
    weightKg: 0.45,
    date: 'Today, 08:15 AM',
    timestamp: Date.now() - 3600000 * 2,
  },
  {
    id: 'h3',
    item: 'Cardboard Delivery Box',
    category: 'Recyclable',
    bin: 'Blue Bin (Dry Recyclables)',
    weightKg: 1.20,
    date: 'Yesterday, 11:00 AM',
    timestamp: Date.now() - 86400000,
  },
  {
    id: 'h4',
    item: 'Coffee Grounds & Tea Residue',
    category: 'Biodegradable',
    bin: 'Green Bin (Wet / Organic)',
    weightKg: 0.50,
    date: '2 days ago',
    timestamp: Date.now() - 86400000 * 2,
  },
  {
    id: 'h5',
    item: 'Used AA Alkaline Batteries',
    category: 'Hazardous',
    bin: 'Red Bin Drop-off',
    weightKg: 0.15,
    date: '3 days ago',
    timestamp: Date.now() - 86400000 * 3,
  },
];

export default function HomeUnifiedHub() {
  const { user, loading: authLoading } = useAuth();

  // Left Panel: Classification State
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState<ClassifierResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [quantityKg, setQuantityKg] = useState<number>(0.5);
  const [loggedToast, setLoggedToast] = useState(false);

  // Right Panel: Activity & Quiz State
  const [activities, setActivities] = useState<UserActivity[]>(DEFAULT_SAMPLE_ACTIVITIES);
  const [quizScore, setQuizScore] = useState<UserQuizScore | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch activities and quiz score
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (user) {
        try {
          const [userActs, userQuiz] = await Promise.all([
            getUserActivities(user.uid),
            getUserQuizScore(user.uid),
          ]);
          if (isMounted) {
            setActivities(userActs || []);
            setQuizScore(userQuiz || null);
          }
        } catch (e) {
          console.error('Error loading data in home hub:', e);
        }
      } else {
        try {
          const rawActs = localStorage.getItem('greenbin_recent_activity');
          if (rawActs && isMounted) {
            const parsed = JSON.parse(rawActs);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setActivities(parsed);
            }
          }
          const rawQuiz = localStorage.getItem('greenbin_last_quiz_score');
          if (rawQuiz && isMounted) {
            setQuizScore(JSON.parse(rawQuiz));
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    if (!authLoading) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  // Handle Search
  const handleSearch = (termToSearch?: string) => {
    const query = termToSearch !== undefined ? termToSearch : searchTerm;
    if (!query.trim()) return;

    setIsVerifying(true);
    setHasSearched(false);
    setLoggedToast(false);

    if (termToSearch) {
      setSearchTerm(termToSearch);
    }

    fetch('/api/classify-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemName: query }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (data.success && data.item) {
          setResult({
            found: true,
            item: data.item,
            query: data.item.name || query,
            matchedBy: 'exact',
            aiStatus: data.aiStatus,
            aiErrorCode: data.aiErrorCode,
          });
        } else {
          const local = classifyWaste(query);
          setResult({
            ...local,
            item: local.item ? { ...local.item, name: query } : undefined,
            aiStatus: data.aiStatus,
            aiErrorCode: data.aiErrorCode,
          });
        }
        setHasSearched(true);
      })
      .catch((err) => {
        console.warn('Classification API error, falling back to local dataset', err);
        const local = classifyWaste(query);
        setResult({
          ...local,
          item: local.item ? { ...local.item, name: query } : undefined,
        });
        setHasSearched(true);
      })
      .finally(() => setIsVerifying(false));
  };

  // Log waste item to dashboard (and immediately update right-side chart in real-time)
  const handleLogWaste = async () => {
    if (!result?.item) return;

    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const weight = quantityKg > 0 ? quantityKg : 0.5;

    const payload = {
      item: result.item.name,
      category: result.item.category,
      bin: result.item.binName,
      weightKg: weight,
      date: dateStr,
      timestamp: Date.now(),
    };

    if (user) {
      const created = await addUserActivity(user.uid, payload);
      setActivities((prev) => [created, ...prev]);
    } else {
      const guestAct: UserActivity = {
        id: `guest_${Date.now()}`,
        ...payload,
      };
      const updated = [guestAct, ...activities];
      localStorage.setItem('greenbin_recent_activity', JSON.stringify(updated.slice(0, 30)));
      setActivities(updated);
    }

    setLoggedToast(true);
    setTimeout(() => setLoggedToast(false), 4000);
  };

  const stats = computeUserStats(activities);

  // Weekly Trend Chart Data (Past 7 Days)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const last7Days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push(daysOfWeek[d.getDay()]);
  }

  const weeklyTrendData = last7Days.map((dayName) => {
    const matching = activities.filter((act) => {
      if (!act.timestamp) return false;
      const actDay = daysOfWeek[new Date(act.timestamp).getDay()];
      return actDay === dayName;
    });

    const bio = matching
      .filter((a) => a.category === 'Biodegradable')
      .reduce((sum, a) => sum + (a.weightKg || 0.45), 0);
    const rec = matching
      .filter((a) => a.category === 'Recyclable')
      .reduce((sum, a) => sum + (a.weightKg || 0.35), 0);
    const haz = matching
      .filter((a) => a.category === 'Hazardous')
      .reduce((sum, a) => sum + (a.weightKg || 0.15), 0);

    return {
      day: dayName,
      Biodegradable: Number(bio.toFixed(2)),
      Recyclable: Number(rec.toFixed(2)),
      Hazardous: Number(haz.toFixed(2)),
    };
  });

  const getCategoryTheme = (category?: WasteCategory) => {
    switch (category) {
      case 'Biodegradable':
        return {
          icon: Leaf,
          color: '#228B52',
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          bg: 'bg-emerald-50/70',
        };
      case 'Recyclable':
        return {
          icon: RefreshCw,
          color: '#1E88E5',
          badge: 'bg-blue-50 text-blue-800 border-blue-200',
          bg: 'bg-blue-50/70',
        };
      case 'Hazardous':
        return {
          icon: AlertTriangle,
          color: '#E53935',
          badge: 'bg-rose-50 text-rose-800 border-rose-200',
          bg: 'bg-rose-50/70',
        };
      default:
        return {
          icon: AlertCircle,
          color: '#6B7280',
          badge: 'bg-gray-100 text-gray-800 border-gray-200',
          bg: 'bg-gray-50',
        };
    }
  };

  return (
    <div className="card-stitch bg-white p-5 sm:p-7 shadow-sm border border-gray-200/80 rounded-3xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================= LEFT SIDE: CLASSIFY WASTE (5 Cols) ================= */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-5 lg:pr-6 lg:border-r lg:border-gray-100">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-forest-subtle flex items-center justify-center text-forest">
                      <Search className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        Identify Waste Item
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Check correct bin & log quantity directly
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/classifier"
                    className="text-xs font-semibold text-forest hover:underline flex items-center gap-1"
                  >
                    Full Classifier →
                  </Link>
                </div>

                {/* Search input */}
                <div className="relative mb-3">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="e.g. Plastic bottle, Banana peel..."
                    className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => handleSearch()}
                    disabled={isVerifying || !searchTerm.trim()}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-forest hover:bg-forest-dark text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {isVerifying ? 'Checking...' : 'Classify'}
                  </button>
                </div>

                {/* Popular Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mb-5">
                  <span className="text-[11px] text-gray-400 font-medium">Quick:</span>
                  {POPULAR_ITEMS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleSearch(tag)}
                      className="px-2 py-0.5 rounded-md text-[11px] bg-gray-50 text-gray-600 hover:bg-forest-subtle hover:text-forest transition-colors font-medium border border-gray-100"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* RESULT CARD IF SEARCHED */}
                {hasSearched && result ? (
                  result.found && result.item ? (
                    <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              getCategoryTheme(result.item.category).badge
                            }`}
                          >
                            {React.createElement(getCategoryTheme(result.item.category).icon, {
                              className: 'w-3 h-3',
                            })}
                            {result.item.category} Waste
                          </span>
                          <h4 className="text-base font-bold text-gray-900 mt-1 capitalize">
                            {result.item.name}
                          </h4>
                        </div>
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: getCategoryTheme(result.item.category).color }}
                        >
                          {React.createElement(getCategoryTheme(result.item.category).icon, {
                            className: 'w-4 h-4',
                          })}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-gray-200/80 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                          Designated Bin
                        </span>
                        <span className="font-bold text-gray-800 flex items-center gap-1.5 mt-0.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: getCategoryTheme(result.item.category).color }}
                          />
                          {result.item.binName}
                        </span>
                      </div>

                      {/* Quantity / Approx Weight Selection */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-gray-700 mb-1.5">
                          <span className="flex items-center gap-1">
                            <Scale className="w-3 h-3 text-forest" />
                            Approx Quantity / Weight:
                          </span>
                          <span className="text-forest font-bold">{quantityKg} kg</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {WEIGHT_PRESETS.map((w) => (
                            <button
                              key={w}
                              type="button"
                              onClick={() => setQuantityKg(w)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                                quantityKg === w
                                  ? 'bg-forest text-white shadow-2xs'
                                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                              }`}
                            >
                              {w} kg
                            </button>
                          ))}
                          <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-gray-200 text-xs">
                            <input
                              type="number"
                              min="0.05"
                              max="50"
                              step="0.05"
                              value={quantityKg}
                              onChange={(e) => {
                                const v = parseFloat(e.target.value);
                                if (!isNaN(v) && v > 0) setQuantityKg(v);
                              }}
                              className="w-10 text-[11px] font-bold text-right outline-none"
                            />
                            <span className="text-[10px] text-gray-500 font-medium">kg</span>
                          </div>
                        </div>
                      </div>

                      {/* Log to Dashboard Button */}
                      <button
                        type="button"
                        onClick={handleLogWaste}
                        className="w-full py-2.5 px-3 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        <span>Log {quantityKg} kg to Dashboard</span>
                      </button>

                      {loggedToast && (
                        <p className="text-[11px] text-center font-semibold text-emerald-700 animate-in fade-in">
                          ✓ Logged {quantityKg} kg to your dashboard!
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-center">
                      <p className="text-xs font-bold text-amber-900">
                        Item not found in standard database
                      </p>
                      <p className="text-[11px] text-amber-700 mt-1">
                        Try our AI-powered Waste Classifier for deep ingredient detection.
                      </p>
                      <Link
                        href={`/classifier?query=${encodeURIComponent(searchTerm)}`}
                        className="inline-block mt-2 px-3 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-semibold"
                      >
                        Search Full Classifier
                      </Link>
                    </div>
                  )
                ) : (
                  /* Placeholder when no item is searched yet */
                  <div className="p-6 rounded-2xl bg-forest-subtle/30 border border-dashed border-forest-200 text-center">
                    <div className="w-10 h-10 rounded-xl bg-forest-subtle text-forest flex items-center justify-center mx-auto mb-2">
                      <Search className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-gray-900">
                      Quick Waste Lookup
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed max-w-xs mx-auto">
                      Search any household item above or click one of the quick suggestion tags to view disposal instructions.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ================= RIGHT SIDE: ACTIVITY & QUIZ SCORE (7 Cols) ================= */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              
              {/* Top Section: Weekly Segregation Activity Chart */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        Weekly Segregation Activity
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Past 7 days waste weight breakdown (kg)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200 self-start sm:self-auto">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span>Past 7 Days</span>
                  </div>
                </div>

                {/* Mini Stats Bar */}
                <div className="grid grid-cols-3 gap-2.5 mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <span className="text-[10px] font-semibold text-emerald-800 flex items-center gap-1">
                      <Leaf className="w-3 h-3 text-forest" />
                      Organic
                    </span>
                    <span className="text-sm font-bold text-emerald-950 mt-0.5 block">
                      {stats.bioKg.toFixed(1)} <span className="text-[10px] font-normal text-emerald-700">kg</span>
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100">
                    <span className="text-[10px] font-semibold text-blue-800 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 text-blue-600" />
                      Recyclable
                    </span>
                    <span className="text-sm font-bold text-blue-950 mt-0.5 block">
                      {stats.recyclableKg.toFixed(1)} <span className="text-[10px] font-normal text-blue-700">kg</span>
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100">
                    <span className="text-[10px] font-semibold text-rose-800 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      Hazardous
                    </span>
                    <span className="text-sm font-bold text-rose-950 mt-0.5 block">
                      {stats.hazardKg.toFixed(1)} <span className="text-[10px] font-normal text-rose-700">kg</span>
                    </span>
                  </div>
                </div>

                {/* 7-Day Bar Chart */}
                <div className="h-48 w-full">
                  {isClient ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyTrendData}>
                        <XAxis dataKey="day" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                        <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} unit="kg" />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '0.75rem',
                            fontSize: '11px',
                            border: '1px solid #E5E7EB',
                          }}
                        />
                        <Bar dataKey="Biodegradable" fill="#228B52" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="Recyclable" fill="#1E88E5" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="Hazardous" fill="#E53935" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400">
                      Loading activity chart...
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Section: Quiz Score & Eco Achievement */}
              <div className="pt-4 border-t border-gray-100">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-forest-50/60 via-white to-forest-50/40 border border-forest-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-forest uppercase tracking-wider">
                          Awareness Quiz Score
                        </span>
                        {quizScore && (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-forest text-white">
                            {quizScore.percentage}%
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 mt-0.5">
                        {quizScore
                          ? quizScore.percentage >= 80
                            ? 'Master Recycler'
                            : 'Eco Environmentalist'
                          : 'Test Your Waste Knowledge'}
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        {quizScore
                          ? `Scored ${quizScore.score}/${quizScore.total} correct on ${quizScore.date}`
                          : 'Answer 5 to 20 questions across Easy, Medium, or Hard to earn your badge.'}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/quiz"
                    className="px-3.5 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-2xs self-start sm:self-center"
                  >
                    {quizScore ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retake Quiz</span>
                      </>
                    ) : (
                      <>
                        <Award className="w-3.5 h-3.5" />
                        <span>Start Eco Quiz</span>
                      </>
                    )}
                  </Link>
                </div>

                {/* Dashboard Navigation footer link */}
                <div className="flex items-center justify-between pt-3 text-xs text-gray-500">
                  <span>
                    Total diverted: <strong className="text-gray-900">{stats.totalKg.toFixed(1)} kg</strong>
                  </span>
                  <Link
                    href="/dashboard"
                    className="font-semibold text-forest hover:text-forest-dark flex items-center gap-1"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Go to Full Dashboard →
                  </Link>
                </div>
              </div>

            </div>

          </div>
    </div>
  );
}
