import { VisionCategory } from '../types';

export const HERO_ARTWORK = '/src/assets/images/hero_future_self_1795080257053.jpg';

export interface VisionPresetImage {
  id: string;
  label: string;
  url: string;
  categoryHint: VisionCategory;
}

export const VISION_PRESET_IMAGES: VisionPresetImage[] = [
  {
    id: 'career-studio',
    label: 'Twilight Studio',
    url: '/src/assets/images/vision_career_studio_1795080257701.jpg',
    categoryHint: 'Career and Professional Life',
  },
  {
    id: 'travel-horizon',
    label: 'Alpine Sanctuary',
    url: '/src/assets/images/vision_travel_horizon_1795080257311.jpg',
    categoryHint: 'Travel and Experiences',
  },
  {
    id: 'wellness-sanctuary',
    label: 'Quiet Reading Corner',
    url: '/src/assets/images/vision_wellness_sanctuary_1795080256967.jpg',
    categoryHint: 'Health and Lifestyle',
  },
  {
    id: 'milestone-summit',
    label: 'Starlight Observatory',
    url: '/src/assets/images/vision_milestone_summit_1795080257442.jpg',
    categoryHint: 'Personal Achievements',
  },
];

export const VISION_CATEGORIES: VisionCategory[] = [
  'Career and Professional Life',
  'Financial Independence',
  'Education and Skills',
  'Family and Relationships',
  'Health and Lifestyle',
  'Personal Achievements',
  'Travel and Experiences',
];

export const SUGGESTED_CHAT_PROMPTS: string[] = [
  'Did we achieve our biggest dream?',
  'Tell me about our future career.',
  'What does our daily life look like?',
  'What challenges did we overcome?',
  'What advice would you give our present self?',
  'Are you proud of me?',
  'What should I start doing today?',
];
