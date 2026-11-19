export type AppView =
  | 'landing'
  | 'chat'
  | 'dashboard'
  | 'vision'
  | 'letter'
  | 'affirmations'
  | 'goals';

export interface FutureSelfProfile {
  name: string;
  age: string;
  currentRole: string;
  careerAmbition: string;
  fiveYearVision: string;
  personalDreams: string;
  currentChallenges: string;
  skillsToDevelop: string;
  idealLifestyle: string;
  personalityStyle: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
}

export type VisionCategory =
  | 'Career and Professional Life'
  | 'Financial Independence'
  | 'Education and Skills'
  | 'Family and Relationships'
  | 'Health and Lifestyle'
  | 'Personal Achievements'
  | 'Travel and Experiences';

export interface VisionItem {
  id: string;
  title: string;
  category: VisionCategory;
  description: string;
  targetYear: string;
  imageUrl: string;
  createdAt: string;
}

export type LetterHorizon = '1 year' | '3 years' | '5 years' | '10 years';

export interface FutureLetter {
  id: string;
  horizon: LetterHorizon;
  title: string;
  content: string;
  focusNote?: string;
  createdAt: string;
}

export interface Affirmation {
  id: string;
  text: string;
  focusArea: string;
  isFavorite: boolean;
  createdAt: string;
}

export interface GoalMilestone {
  id: string;
  title: string;
  tip?: string;
  targetDate: string;
  completed: boolean;
}

export interface GoalItem {
  id: string;
  title: string;
  category: string;
  targetDate: string;
  milestones: GoalMilestone[];
  aiAdvice?: string;
  createdAt: string;
}
