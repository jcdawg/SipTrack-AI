export interface SavedDrink {
  id: string;
  user_id: string;
  name: string;
  type: string;
  volume_ml: number;
  alcohol_percentage: number;
  calories: number;
  cost: number;
  image_url?: string;
  created_at: string;
  last_used_at: string;
}

export interface DrinkLog {
  id: string;
  user_id: string;
  drink_id?: string;
  brand: string;
  name: string;
  type: string;
  volume: number;
  abv: number;
  calories: number;
  carbs: number;
  sugar: number;
  price: number;
  quantity: number;
  date: string;
  mood_before?: string;
  mood_after?: string;
  notes?: string;
}

export type Period = 'daily' | 'weekly' | 'monthly';

export interface StreakData {
  currentDrinkingStreak: number;
  longestDrinkingStreak: number;
  currentDryStreak: number;
  longestDryStreak: number;
  lastDrinkDate: string | null;
}

export type MoodLevel = 1 | 2 | 3 | 4 | 5; // 1 = very low, 5 = very high

export interface MoodEntry {
  id: string;
  date: string;
  mood: MoodLevel;
  notes?: string;
  tags: string[];
}

export interface MoodCorrelation {
  averageMoodWithDrinks: number;
  averageMoodWithoutDrinks: number;
  correlationStrength: number;
  daysAnalyzed: number;
}