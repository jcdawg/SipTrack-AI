
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
