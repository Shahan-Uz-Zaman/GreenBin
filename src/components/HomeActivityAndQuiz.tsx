'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BarChart3,
  CheckCircle2,
  HelpCircle,
  Leaf,
  RefreshCw,
  AlertTriangle,
  Scale,
  PlusCircle,
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
import { useAuth } from '@/context/AuthContext';
import {
  UserActivity,
  UserQuizScore,
  getUserActivities,
  getUserQuizScore,
  computeUserStats,
} from '@/lib/userService';

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

export default function HomeActivityAndQuiz() {
  const { user, loading: authLoading } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>(DEFAULT_SAMPLE_ACTIVITIES);
  const [quizScore, setQuizScore] = useState<UserQuizScore | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
            if (userActs && userActs.length > 0) {
              setActivities(userActs);
            }
            if (userQuiz) {
              setQuizScore(userQuiz);
            }
          }
        } catch (e) {
          console.error('Error loading home activity data:', e);
        }
      } else {
        // Guest mode fallback
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

  return (
    <section className="py-16 bg-gradient-to-b from-white via-gray-50/50 to-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-subtle text-forest text-xs font-semibold mb-3 border border-forest-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community & Personal Progress</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Weekly Segregation Activity & Eco Score
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Real-time tracking of waste diverted from landfills and eco-awareness quiz performance.
          </p>
        </div>

        {/* 2-Column Grid: Chart on Left, Quiz Score on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Left Column: Weekly Segregation Activity Chart (2 Cols) */}
          <div className="card-stitch bg-white p-6 lg:col-span-2 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-forest" />
                    Weekly Segregation Activity (kg)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Daily breakdown for Green (Organic), Blue (Recyclables), and Red (Hazardous).
                  </p>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto text-[11px] font-semibold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>Past 7 Days</span>
                </div>
              </div>

              {/* Quick weight indicators */}
              <div className="grid grid-cols-3 gap-3 my-4">
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                    <Leaf className="w-3.5 h-3.5 text-forest" />
                    Organic
                  </div>
                  <div className="text-lg font-bold text-emerald-950 mt-1">
                    {stats.bioKg.toFixed(1)} <span className="text-xs font-medium text-emerald-700">kg</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-800">
                    <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                    Recyclables
                  </div>
                  <div className="text-lg font-bold text-blue-950 mt-1">
                    {stats.recyclableKg.toFixed(1)} <span className="text-xs font-medium text-blue-700">kg</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Hazardous
                  </div>
                  <div className="text-lg font-bold text-rose-950 mt-1">
                    {stats.hazardKg.toFixed(1)} <span className="text-xs font-medium text-rose-700">kg</span>
                  </div>
                </div>
              </div>

              {/* Bar Chart Container */}
              <div className="h-64 w-full mt-2">
                {isClient ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyTrendData}>
                      <XAxis
                        dataKey="day"
                        stroke="#9CA3AF"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        fontSize={11}
                        tickLine={false}
                        unit="kg"
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '0.75rem',
                          fontSize: '12px',
                          border: '1px solid #E5E7EB',
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(val) => (
                          <span className="text-xs text-gray-700 font-medium">
                            {val}
                          </span>
                        )}
                      />
                      <Bar
                        dataKey="Biodegradable"
                        fill="#228B52"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="Recyclable"
                        fill="#1E88E5"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="Hazardous"
                        fill="#E53935"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400">
                    Loading segregation activity...
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 mt-2">
              <span>
                Total waste tracked: <strong className="text-gray-900">{stats.totalKg.toFixed(1)} kg</strong>
              </span>
              <Link
                href="/dashboard"
                className="font-semibold text-forest hover:text-forest-dark flex items-center gap-1"
              >
                Open Full Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Quiz Score & Eco Achievement Card (1 Col) */}
          <div className="card-stitch bg-white p-6 shadow-sm flex flex-col justify-between border-t-4 border-t-forest">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-forest-subtle flex items-center justify-center text-forest">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Eco Awareness Quiz
                    </h3>
                    <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
                      Knowledge Score
                    </span>
                  </div>
                </div>

                {quizScore && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-forest text-white shadow-2xs">
                    {quizScore.percentage}%
                  </span>
                )}
              </div>

              {quizScore ? (
                /* User has a completed quiz score */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-forest-subtle/40 border border-forest-200/70 text-center">
                    <div className="w-12 h-12 rounded-xl bg-forest text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
                      <Award className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-forest-dark">
                      {quizScore.percentage >= 80 ? 'Master Recycler' : 'Eco Environmentalist'}
                    </h4>
                    <p className="text-xs text-forest-dark/80 mt-1">
                      {quizScore.percentage >= 80
                        ? 'Outstanding segregation knowledge!'
                        : 'Great effort on waste separation rules.'}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-gray-500 font-medium">Questions Correct</span>
                      <span className="font-bold text-gray-900">
                        {quizScore.score} / {quizScore.total}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-gray-500 font-medium">Last Completed</span>
                      <span className="font-semibold text-gray-700">{quizScore.date}</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-gray-500 font-medium">Account Sync</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* No quiz taken yet */
                <div className="space-y-4 text-center py-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 border border-amber-200/60">
                    <HelpCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900">
                      Test Your Sorting Skills
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
                      Choose 5, 10, or 20 questions across Easy, Medium, or Hard to test your segregation awareness.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold text-gray-600 pt-1">
                    <span className="py-1 px-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                      Easy
                    </span>
                    <span className="py-1 px-2 rounded-lg bg-blue-50 text-blue-800 border border-blue-100">
                      Medium
                    </span>
                    <span className="py-1 px-2 rounded-lg bg-rose-50 text-rose-800 border border-rose-100">
                      Hard
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Button */}
            <div className="pt-4 border-t border-gray-100 mt-6">
              <Link
                href="/quiz"
                className="w-full py-2.5 px-4 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-2xs"
              >
                {quizScore ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Quiz / Challenge Hard Mode</span>
                  </>
                ) : (
                  <>
                    <Award className="w-3.5 h-3.5" />
                    <span>Start 5-Min Eco Quiz</span>
                  </>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
