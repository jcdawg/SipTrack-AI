export interface DrinkLog {
  id: string;
  brand: string;
  name: string;
  volume: number; // in ml
  abv: number; // percentage
  calories: number;
  carbs: number;
  sugar: number;
  price: number;
  quantity: number;
  date: string;
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