import {
  Affirmation,
  ChatThread,
  FutureLetter,
  FutureSelfProfile,
  GoalItem,
  VisionItem,
} from '../types';
import { VISION_PRESET_IMAGES } from './assets';

const KEYS = {
  PROFILE: 'futureme_profile_v1',
  THREADS: 'futureme_threads_v1',
  ACTIVE_THREAD: 'futureme_active_thread_v1',
  VISIONS: 'futureme_visions_v1',
  LETTERS: 'futureme_letters_v1',
  AFFIRMATIONS: 'futureme_affirmations_v1',
  GOALS: 'futureme_goals_v1',
};

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function loadProfile(): FutureSelfProfile | null {
  return safeRead<FutureSelfProfile | null>(KEYS.PROFILE, null);
}

export function saveProfile(profile: FutureSelfProfile): void {
  safeWrite(KEYS.PROFILE, profile);
}

export function loadThreads(): ChatThread[] {
  return safeRead<ChatThread[]>(KEYS.THREADS, []);
}

export function saveThreads(threads: ChatThread[]): void {
  safeWrite(KEYS.THREADS, threads);
}

export function loadActiveThreadId(): string | null {
  return safeRead<string | null>(KEYS.ACTIVE_THREAD, null);
}

export function saveActiveThreadId(id: string | null): void {
  safeWrite(KEYS.ACTIVE_THREAD, id);
}

const DEFAULT_VISIONS: VisionItem[] = [
  {
    id: 'starter-career',
    title: 'Meaningful Work with Deep Focus',
    category: 'Career and Professional Life',
    description:
      'Leading thoughtful projects in a calm, inspiring space where curiosity and craft meet real-world impact.',
    targetYear: '2029',
    imageUrl: VISION_PRESET_IMAGES[0].url,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'starter-wellness',
    title: 'Unhurried Mornings & Peace of Mind',
    category: 'Health and Lifestyle',
    description:
      'Protecting quiet morning routines for reading, reflection, movement, and nourishing conversations.',
    targetYear: '2028',
    imageUrl: VISION_PRESET_IMAGES[2].url,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'starter-travel',
    title: 'Exploring Quiet Alpine Horizons',
    category: 'Travel and Experiences',
    description:
      'Taking restorative journeys to places that remind me how wide the world is and how far I have grown.',
    targetYear: '2030',
    imageUrl: VISION_PRESET_IMAGES[1].url,
    createdAt: new Date().toISOString(),
  },
];

export function loadVisions(): VisionItem[] {
  const existing = safeRead<VisionItem[] | null>(KEYS.VISIONS, null);
  if (existing === null) {
    safeWrite(KEYS.VISIONS, DEFAULT_VISIONS);
    return DEFAULT_VISIONS;
  }
  return existing;
}

export function saveVisions(visions: VisionItem[]): void {
  safeWrite(KEYS.VISIONS, visions);
}

export function loadLetters(): FutureLetter[] {
  return safeRead<FutureLetter[]>(KEYS.LETTERS, []);
}

export function saveLetters(letters: FutureLetter[]): void {
  safeWrite(KEYS.LETTERS, letters);
}

const DEFAULT_AFFIRMATIONS: Affirmation[] = [
  {
    id: 'aff-1',
    text: 'I am becoming the person I always dreamed of being, one deliberate step at a time.',
    focusArea: 'Identity',
    isFavorite: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'aff-2',
    text: 'Every small effort today is quietly compounding into the future I am building.',
    focusArea: 'Consistency',
    isFavorite: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'aff-3',
    text: 'I am capable of learning difficult things with patience, curiosity, and resilience.',
    focusArea: 'Growth Mindset',
    isFavorite: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'aff-4',
    text: 'My future is shaped by the honest, courageous actions I take today.',
    focusArea: 'Agency',
    isFavorite: false,
    createdAt: new Date().toISOString(),
  },
];

export function loadAffirmations(): Affirmation[] {
  const existing = safeRead<Affirmation[] | null>(KEYS.AFFIRMATIONS, null);
  if (existing === null) {
    safeWrite(KEYS.AFFIRMATIONS, DEFAULT_AFFIRMATIONS);
    return DEFAULT_AFFIRMATIONS;
  }
  return existing;
}

export function saveAffirmations(affirmations: Affirmation[]): void {
  safeWrite(KEYS.AFFIRMATIONS, affirmations);
}

export function loadGoals(): GoalItem[] {
  return safeRead<GoalItem[]>(KEYS.GOALS, []);
}

export function saveGoals(goals: GoalItem[]): void {
  safeWrite(KEYS.GOALS, goals);
}
