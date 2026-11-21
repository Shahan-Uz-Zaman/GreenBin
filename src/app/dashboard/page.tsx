'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  RefreshCw,
  Leaf,
  AlertTriangle,
  Trash2,
  Calendar,
  Sparkles,
  PlusCircle,
  RotateCcw,
  Cloud,
  CheckCircle2,
  Scale,
  Award,
  X,
  Plus,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import Sidebar from '@/components/Sidebar';
import {
  PieChart,
  Pie,
  Cell,
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
  addUserActivity,
  clearUserActivities,
  computeUserStats,
} from '@/lib/userService';

const DEFAULT_SAMPLE_ACTIVITIES: Omit<UserActivity, 'id' | 'timestamp'>[] = [
  {
    item: 'Plastic Water Bottles (x3)',
    category: 'Recyclable',
    bin: 'Blue Bin (Dry Recyclables)',
    weightKg: 0.35,
    date: 'Today, 09:30 AM',
  },
  {
    item: 'Banana Peels & Fruit Scraps',
    category: 'Biodegradable',
    bin: 'Green Bin (Wet / Organic)',
    weightKg: 0.45,
    date: 'Today, 08:15 AM',
  },
  {
    item: 'Used AA Alkaline Batteries',
    category: 'Hazardous',
    bin: 'Red Bin Drop-off',
    weightKg: 0.15,
    date: 'Yesterday, 04:20 PM',
  },
  {
    item: 'Cardboard Delivery Boxes',
    category: 'Recyclable',
    bin: 'Blue Bin (Dry Recyclables)',
    weightKg: 1.20,
    date: 'Yesterday, 11:00 AM',
  },
  {
    item: 'Coffee Grounds & Tea Residue',
    category: 'Biodegradable',
    bin: 'Green Bin (Wet / Organic)',
    weightKg: 0.50,
    date: 'Nov 19, 07:45 AM',
  },
  {
    item: 'Aluminum Beverage Cans',
    category: 'Recyclable',
    bin: 'Blue Bin (Dry Recyclables)',
    weightKg: 0.25,
    date: 'Nov 18, 06:10 PM',
  },
];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [quizScore, setQuizScore] = useState<UserQuizScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Quick Log Modal State
  const [showLogModal, setShowLogModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'Biodegradable' | 'Recyclable' | 'Hazardous'>('Recyclable');
  const [newItemWeight, setNewItemWeight] = useState<number>(0.5);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch activities and quiz score whenever user changes
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);

      if (user) {
        // Authenticated user data
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
          console.error('Error loading user dashboard data:', e);
        }
      } else {
        // Guest mode: load guest activities from local storage
        try {
          const raw = localStorage.getItem('greenbin_recent_activity');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              if (isMounted) setActivities(parsed);
            } else {
              const sampleWithIds: UserActivity[] = DEFAULT_SAMPLE_ACTIVITIES.map((s, idx) => ({
                ...s,
                id: `sample_${idx}`,
                timestamp: Date.now() - idx * 86400000 * 0.5,
              }));
              if (isMounted) setActivities(sampleWithIds);
            }
          } else {
            // Provide sample starter for guests so the UI looks great
            const sampleWithIds: UserActivity[] = DEFAULT_SAMPLE_ACTIVITIES.map((s, idx) => ({
              ...s,
              id: `sample_${idx}`,
              timestamp: Date.now() - idx * 86400000 * 0.5,
            }));
            if (isMounted) setActivities(sampleWithIds);
          }

          const rawQuiz = localStorage.getItem('greenbin_last_quiz_score');
          if (rawQuiz && isMounted) {
            setQuizScore(JSON.parse(rawQuiz));
          }
        } catch (e) {
          console.error('Error loading guest data:', e);
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  // Compute dynamic stats
  const stats = computeUserStats(activities);

  // Dynamic Pie Chart Data
  const pieData = [
    { name: 'Biodegradable', value: stats.bioKg, count: stats.bioCount, color: '#228B52' },
    { name: 'Recyclable', value: stats.recyclableKg, count: stats.recyclableCount, color: '#1E88E5' },
    { name: 'Hazardous', value: stats.hazardKg, count: stats.hazardCount, color: '#E53935' },
  ];

  // Dynamic Weekly Trend: map activities across past 7 days
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const last7Days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push(daysOfWeek[d.getDay()]);
  }

  const weeklyTrendData = last7Days.map((dayName) => {
    // Sum weights for items on this day
    const matchingActs = activities.filter((act) => {
      if (!act.timestamp) return false;
      const actDay = daysOfWeek[new Date(act.timestamp).getDay()];
      return actDay === dayName;
    });

    const bio = matchingActs
      .filter((a) => a.category === 'Biodegradable')
      .reduce((sum, a) => sum + (a.weightKg || 0.45), 0);
    const rec = matchingActs
      .filter((a) => a.category === 'Recyclable')
      .reduce((sum, a) => sum + (a.weightKg || 0.35), 0);
    const haz = matchingActs
      .filter((a) => a.category === 'Hazardous')
      .reduce((sum, a) => sum + (a.weightKg || 0.15), 0);

    return {
      day: dayName,
      Biodegradable: Number(bio.toFixed(2)),
      Recyclable: Number(rec.toFixed(2)),
      Hazardous: Number(haz.toFixed(2)),
    };
  });

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear your waste activity log?')) return;
    if (user) {
      await clearUserActivities(user.uid);
      setActivities([]);
    } else {
      localStorage.removeItem('greenbin_recent_activity');
      setActivities([]);
    }
  };

  const handleLoadSampleData = async () => {
    if (user) {
      for (const item of DEFAULT_SAMPLE_ACTIVITIES) {
        await addUserActivity(user.uid, item);
      }
      const updated = await getUserActivities(user.uid);
      setActivities(updated);
    } else {
      const sampleWithIds: UserActivity[] = DEFAULT_SAMPLE_ACTIVITIES.map((s, idx) => ({
        ...s,
        id: `sample_${idx}`,
        timestamp: Date.now() - idx * 86400000 * 0.5,
      }));
      localStorage.setItem('greenbin_recent_activity', JSON.stringify(sampleWithIds));
      setActivities(sampleWithIds);
    }
  };

  const handleQuickLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const binName =
      newItemCategory === 'Biodegradable'
        ? 'Green Bin (Wet / Organic)'
        : newItemCategory === 'Recyclable'
        ? 'Blue Bin (Dry Recyclables)'
        : 'Red Bin Drop-off';

    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const payload = {
      item: newItemName.trim(),
      category: newItemCategory,
      bin: binName,
      weightKg: newItemWeight > 0 ? newItemWeight : 0.5,
      date: dateStr,
      timestamp: Date.now(),
    };

    if (user) {
      const created = await addUserActivity(user.uid, payload);
      setActivities((prev) => [created, ...prev]);
    } else {
      const newAct: UserActivity = {
        ...payload,
        id: `guest_${Date.now()}`,
      };
      const updated = [newAct, ...activities];
      localStorage.setItem('greenbin_recent_activity', JSON.stringify(updated.slice(0, 30)));
      setActivities(updated);
    }

    setNewItemName('');
    setNewItemWeight(0.5);
    setShowLogModal(false);
  };

  const getBadge = (category: UserActivity['category']) => {
    switch (category) {
      case 'Biodegradable':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-emerald-800 border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#228B52]"></span>
            Biodegradable
          </span>
        );
      case 'Recyclable':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E88E5]"></span>
            Recyclable
          </span>
        );
      case 'Hazardous':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E53935]"></span>
            Hazardous
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50/50">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        {/* Guest Mode Banner if not logged in */}
        {!user && !authLoading && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start sm:items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <p className="text-xs sm:text-sm font-semibold">
                  You are currently viewing in Guest Mode
                </p>
                <p className="text-xs text-amber-800">
                  Log in or create an account to save your personal recycling activity and sync it across devices.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/login?redirect=/dashboard"
                className="px-3 py-1.5 rounded-xl bg-white text-gray-800 text-xs font-semibold border border-amber-300 hover:bg-amber-100/50 transition-colors shadow-2xs"
              >
                Log In
              </Link>
              <Link
                href="/signup?redirect=/dashboard"
                className="px-3 py-1.5 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-dark transition-colors shadow-2xs"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}

        {/* Welcome Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-forest uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Waste Dashboard</span>
              {user && (
                <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  <Cloud className="w-3 h-3" />
                  Synced with Account
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {user
                ? `Welcome back, ${user.displayName || user.email?.split('@')[0]}!`
                : 'Welcome to GreenBin Dashboard'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {user
                ? `Tracking household waste segregation and eco-footprint for ${user.email}.`
                : 'Track household waste segregation trends, bin compliance, and environmental footprint.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLogModal(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4 text-forest" />
              Quick Log Waste
            </button>
            <Link
              href="/classifier"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-forest text-white hover:bg-forest-dark transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              Classify & Log
            </Link>
          </div>
        </div>

        {/* 4 Dynamic Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Waste Segregated"
            value={stats.totalKg.toFixed(1)}
            unit="kg"
            subtitle={`${stats.totalItems} items logged • ~${stats.co2SavedKg}kg CO₂ saved`}
            icon={Trash2}
            colorVariant="default"
            trend={user ? 'Saved to your profile' : 'Local session'}
          />
          <StatCard
            title="Recyclable Waste"
            value={stats.recyclableKg.toFixed(1)}
            unit="kg"
            subtitle={`${stats.recyclableCount} items sorted`}
            icon={RefreshCw}
            colorVariant="blue"
            trend={stats.totalKg > 0 ? `${Math.round((stats.recyclableKg / stats.totalKg) * 100)}% of total kg` : '0%'}
          />
          <StatCard
            title="Biodegradable Waste"
            value={stats.bioKg.toFixed(1)}
            unit="kg"
            subtitle={`${stats.bioCount} organic items`}
            icon={Leaf}
            colorVariant="forest"
            trend={stats.totalKg > 0 ? `${Math.round((stats.bioKg / stats.totalKg) * 100)}% of total kg` : '0%'}
          />
          <StatCard
            title="Hazardous Waste"
            value={stats.hazardKg.toFixed(1)}
            unit="kg"
            subtitle={`${stats.hazardCount} drop-off items`}
            icon={AlertTriangle}
            colorVariant="red"
            trend="100% safely deposited"
          />
        </div>

        {/* Quiz Eco-Score Section on Dashboard */}
        {quizScore ? (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-forest-subtle flex items-center justify-center text-forest flex-shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Awareness Quiz Achievement
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-forest text-white">
                    {quizScore.percentage}% Score
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mt-0.5">
                  {quizScore.percentage >= 80 ? 'Master Recycler' : 'Eco Environmentalist'}
                </h3>
                <p className="text-xs text-gray-500">
                  Completed on {quizScore.date} with {quizScore.score}/{quizScore.total} correct answers.
                </p>
              </div>
            </div>
            <Link
              href="/quiz"
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 self-start sm:self-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retake / Challenge Quiz
            </Link>
          </div>
        ) : (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-forest-50/70 via-white to-forest-50/30 border border-forest-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-forest text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-forest uppercase tracking-wider">
                  Test Your Eco Knowledge
                </span>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mt-0.5">
                  Earn Your Master Recycler Badge
                </h3>
                <p className="text-xs text-gray-600">
                  Take the interactive quiz (5, 10, or 20 questions) to record your awareness score here!
                </p>
              </div>
            </div>
            <Link
              href="/quiz"
              className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-forest text-white hover:bg-forest-dark transition-colors flex items-center justify-center gap-1.5 self-start sm:self-center shadow-2xs"
            >
              <Award className="w-3.5 h-3.5" />
              Take Eco Quiz Now
            </Link>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Pie Chart: Waste Distribution */}
          <div className="card-stitch bg-white p-5 lg:col-span-1 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-900">
                Waste Distribution (kg)
              </h3>
              <span className="text-[11px] font-medium text-gray-500">
                By Weight
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Breakdown of organic, recyclable, and hazardous waste by kg.
            </p>

            <div className="h-64 w-full">
              {isClient && stats.totalKg > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [`${val} kg`, 'Weight']}
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
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <p className="text-xs text-gray-400 font-medium mb-2">
                    No waste items logged yet
                  </p>
                  <Link
                    href="/classifier"
                    className="text-xs font-semibold text-forest hover:underline"
                  >
                    Classify an item to view chart &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Bar Chart: Weekly Segregation Trend */}
          <div className="card-stitch bg-white p-5 lg:col-span-2 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-900">
                Weekly Segregation Activity (kg)
              </h3>
              <span className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gray-400" />
                Past 7 Days
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Real daily weight breakdown for Green, Blue, and Red bins.
            </p>

            <div className="h-64 w-full">
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
                  Loading chart...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Waste Activity Section */}
        <div className="card-stitch bg-white p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Recent Waste Activity
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {user
                  ? `Activity history for ${user.displayName || user.email}`
                  : 'Items identified and sorted into bins.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSampleData}
                className="text-xs font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-lg border border-gray-200"
                title="Populate starter sample items"
              >
                <PlusCircle className="w-3.5 h-3.5 text-forest" />
                Add Sample Items
              </button>
              {activities.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-xs font-medium text-rose-600 hover:text-rose-800 flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50"
                  title="Clear your activity list"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear History
                </button>
              )}
            </div>
          </div>

          {activities.length > 0 ? (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold">
                    <th className="pb-3 pl-2">Item Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Quantity (kg)</th>
                    <th className="pb-3">Assigned Bin</th>
                    <th className="pb-3 pr-2 text-right">Logged At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activities.map((act) => (
                    <tr key={act.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 pl-2 font-medium text-gray-900">
                        {act.item}
                      </td>
                      <td className="py-3.5">{getBadge(act.category)}</td>
                      <td className="py-3.5 font-bold text-gray-800">
                        <span className="inline-flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                          <Scale className="w-3 h-3 text-gray-500" />
                          {(act.weightKg !== undefined && act.weightKg > 0 ? act.weightKg : 0.5).toFixed(2)} kg
                        </span>
                      </td>
                      <td className="py-3.5 text-gray-600 font-medium">
                        {act.bin}
                      </td>
                      <td className="py-3.5 pr-2 text-right text-gray-500">
                        {act.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-gray-800 mb-1">
                No Activities Logged Yet
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                Whenever you classify items in the Waste Classifier and select a quantity, they will automatically be recorded here under your account!
              </p>
              <Link
                href="/classifier"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-dark transition-colors shadow-2xs"
              >
                <PlusCircle className="w-4 h-4" />
                Classify Your First Item
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-forest" />
                Quick Log Waste Item
              </h3>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickLog} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Item Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardboard box, Apple cores, Plastic bottle..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Waste Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Recyclable', 'Biodegradable', 'Hazardous'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewItemCategory(cat)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        newItemCategory === cat
                          ? cat === 'Biodegradable'
                            ? 'bg-emerald-50 border-forest text-forest-dark ring-2 ring-forest/20'
                            : cat === 'Recyclable'
                            ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20'
                            : 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/20'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Approx Weight / Quantity (kg)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    max="100"
                    required
                    value={newItemWeight}
                    onChange={(e) => setNewItemWeight(parseFloat(e.target.value) || 0.1)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                  />
                  <span className="text-sm font-semibold text-gray-500">kg</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-dark shadow-xs"
                >
                  Save to Dashboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
