import { db, isFirebaseConfigured } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';

export interface UserActivity {
  id: string;
  item: string;
  category: 'Biodegradable' | 'Recyclable' | 'Hazardous';
  bin: string;
  weightKg?: number; // e.g. 0.5 kg
  date: string;
  timestamp: number;
}

export interface UserQuizScore {
  score: number;
  total: number;
  percentage: number;
  date: string;
  timestamp: number;
}

export interface UserProfileStats {
  totalItems: number;
  recyclableCount: number;
  bioCount: number;
  hazardCount: number;
  totalKg: number;
  recyclableKg: number;
  bioKg: number;
  hazardKg: number;
  co2SavedKg: number;
  lastQuizScore?: UserQuizScore;
}

const LOCAL_STORAGE_PREFIX = 'greenbin_user_';

/**
 * Get user activities (reads from Firestore if configured, synchronizes with localStorage)
 */
export async function getUserActivities(userId: string): Promise<UserActivity[]> {
  if (!userId) return [];

  const localKey = `${LOCAL_STORAGE_PREFIX}${userId}_activities`;
  let localData: UserActivity[] = [];
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) {
      localData = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse local user activities', e);
  }

  // If Firebase is configured, attempt to fetch from Firestore
  if (isFirebaseConfigured) {
    try {
      const q = query(
        collection(db, 'users', userId, 'activities'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const firestoreData: UserActivity[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<UserActivity, 'id'>),
        }));
        // Update local cache
        localStorage.setItem(localKey, JSON.stringify(firestoreData));
        return firestoreData;
      }
    } catch (err) {
      console.warn('Firestore fetch failed, falling back to local storage:', err);
    }
  }

  return localData;
}

/**
 * Add a new activity for a specific user
 */
export async function addUserActivity(
  userId: string,
  activity: Omit<UserActivity, 'id' | 'timestamp'> & { timestamp?: number }
): Promise<UserActivity> {
  const finalWeight = activity.weightKg && activity.weightKg > 0 ? Number(activity.weightKg) : 0.5;

  const newActivity: UserActivity = {
    ...activity,
    weightKg: finalWeight,
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: activity.timestamp || Date.now(),
  };

  // 1. Save immediately to user-scoped localStorage
  const localKey = `${LOCAL_STORAGE_PREFIX}${userId}_activities`;
  try {
    const current = await getUserActivities(userId);
    const updated = [newActivity, ...current.filter((a) => a.id !== newActivity.id)].slice(0, 50);
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save to local cache', e);
  }

  // 2. Persist to Firestore if available
  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'users', userId, 'activities', newActivity.id);
      await setDoc(docRef, {
        item: newActivity.item,
        category: newActivity.category,
        bin: newActivity.bin,
        weightKg: newActivity.weightKg,
        date: newActivity.date,
        timestamp: newActivity.timestamp,
      });
    } catch (err) {
      console.warn('Could not sync activity to Firestore:', err);
    }
  }

  return newActivity;
}

/**
 * Save user quiz score
 */
export async function saveUserQuizScore(
  userId: string,
  quizScore: UserQuizScore
): Promise<void> {
  if (!userId) return;

  const localKey = `${LOCAL_STORAGE_PREFIX}${userId}_quiz_score`;
  try {
    localStorage.setItem(localKey, JSON.stringify(quizScore));
  } catch (e) {
    console.warn('Failed to save quiz score to local storage', e);
  }

  if (isFirebaseConfigured) {
    try {
      const userDoc = doc(db, 'users', userId);
      await setDoc(userDoc, { lastQuizScore: quizScore }, { merge: true });
    } catch (err) {
      console.warn('Could not sync quiz score to Firestore:', err);
    }
  }
}

/**
 * Get user quiz score
 */
export async function getUserQuizScore(userId: string): Promise<UserQuizScore | null> {
  if (!userId) return null;

  const localKey = `${LOCAL_STORAGE_PREFIX}${userId}_quiz_score`;
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse user quiz score', e);
  }

  if (isFirebaseConfigured) {
    try {
      const userDoc = doc(db, 'users', userId);
      const snap = await getDoc(userDoc);
      if (snap.exists() && snap.data()?.lastQuizScore) {
        const score = snap.data().lastQuizScore as UserQuizScore;
        localStorage.setItem(localKey, JSON.stringify(score));
        return score;
      }
    } catch (err) {
      console.warn('Could not fetch quiz score from Firestore:', err);
    }
  }

  return null;
}

/**
 * Migrate guest activities and quiz score into the logged-in user account
 */
export async function migrateGuestDataToUser(userId: string): Promise<void> {
  if (!userId) return;

  try {
    const rawGuest = typeof window !== 'undefined' ? localStorage.getItem('greenbin_recent_activity') : null;
    if (rawGuest) {
      const guestActs: UserActivity[] = JSON.parse(rawGuest);
      if (Array.isArray(guestActs) && guestActs.length > 0) {
        for (const act of guestActs) {
          await addUserActivity(userId, {
            item: act.item,
            category: act.category,
            bin: act.bin,
            weightKg: act.weightKg,
            date: act.date,
            timestamp: act.timestamp || Date.now(),
          });
        }
        localStorage.removeItem('greenbin_recent_activity');
      }
    }

    const rawQuiz = typeof window !== 'undefined' ? localStorage.getItem('greenbin_last_quiz_score') : null;
    if (rawQuiz) {
      const guestQuiz: UserQuizScore = JSON.parse(rawQuiz);
      if (guestQuiz && guestQuiz.score !== undefined) {
        await saveUserQuizScore(userId, guestQuiz);
        localStorage.removeItem('greenbin_last_quiz_score');
      }
    }
  } catch (e) {
    console.warn('Error during guest data migration:', e);
  }
}

/**
 * Clear activities for a user
 */
export async function clearUserActivities(userId: string): Promise<void> {
  if (!userId) return;

  const localKey = `${LOCAL_STORAGE_PREFIX}${userId}_activities`;
  localStorage.removeItem(localKey);

  if (isFirebaseConfigured) {
    try {
      const snapshot = await getDocs(collection(db, 'users', userId, 'activities'));
      const deletions = snapshot.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deletions);
    } catch (err) {
      console.warn('Could not delete activities from Firestore:', err);
    }
  }
}

/**
 * Compute real user metrics from activities
 */
export function computeUserStats(activities: UserActivity[]): UserProfileStats {
  const totalItems = activities.length;

  let bioCount = 0;
  let recyclableCount = 0;
  let hazardCount = 0;

  let bioKg = 0;
  let recyclableKg = 0;
  let hazardKg = 0;

  activities.forEach((act) => {
    const weight = act.weightKg !== undefined && act.weightKg > 0
      ? act.weightKg
      : act.category === 'Biodegradable'
      ? 0.45
      : act.category === 'Recyclable'
      ? 0.35
      : 0.15;

    if (act.category === 'Biodegradable') {
      bioCount++;
      bioKg += weight;
    } else if (act.category === 'Recyclable') {
      recyclableCount++;
      recyclableKg += weight;
    } else if (act.category === 'Hazardous') {
      hazardCount++;
      hazardKg += weight;
    }
  });

  const totalKg = Number((bioKg + recyclableKg + hazardKg).toFixed(1));
  bioKg = Number(bioKg.toFixed(1));
  recyclableKg = Number(recyclableKg.toFixed(1));
  hazardKg = Number(hazardKg.toFixed(1));

  // Carbon offset estimation:
  // Recycling: ~0.8 kg CO2 saved per kg
  // Composting: ~0.5 kg CO2 saved per kg
  const co2SavedKg = Number((recyclableKg * 0.8 + bioKg * 0.5).toFixed(1));

  return {
    totalItems,
    recyclableCount,
    bioCount,
    hazardCount,
    totalKg,
    recyclableKg,
    bioKg,
    hazardKg,
    co2SavedKg,
  };
}
