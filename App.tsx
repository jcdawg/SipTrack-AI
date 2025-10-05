import React, { useState, useEffect } from 'react';
import type { DrinkLog, MoodEntry, SavedDrink } from './types';
import LogDrinkForm from './components/LogDrinkForm';
import Dashboard from './components/Dashboard';
import DrinkList from './components/DrinkList';
import MoodTracker from './components/MoodTracker';
import { drinkService } from './services/drinkService';

const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

const App: React.FC = () => {
  const [savedDrinks, setSavedDrinks] = useState<SavedDrink[]>([]);
  const [drinkLogs, setDrinkLogs] = useState<DrinkLog[]>([]);

  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>(() => {
    try {
      const savedMoods = localStorage.getItem('moodEntries');
      if (!savedMoods) return [];
      
      const parsedMoods: any[] = JSON.parse(savedMoods);

      // Sanitize mood entries
      const sanitizedMoods = parsedMoods.map(mood => {
        if (!mood || typeof mood !== 'object' || !mood.id) {
          return null;
        }
        return {
          id: String(mood.id),
          date: String(mood.date ?? new Date().toISOString()),
          mood: Number(mood.mood) || 3, // Default to neutral if invalid
          notes: mood.notes ? String(mood.notes) : undefined,
          tags: Array.isArray(mood.tags) ? mood.tags.map(String) : [],
        };
      }).filter((mood): mood is NonNullable<typeof mood> => mood !== null);

      return sanitizedMoods;
    } catch (error) {
      console.error("Could not parse or sanitize mood entries from localStorage", error);
      localStorage.removeItem('moodEntries');
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
  }, [moodEntries]);

  useEffect(() => {
    loadSavedDrinks();
    loadDrinkLogs();
  }, []);

  const loadSavedDrinks = async () => {
    const drinks = await drinkService.getSavedDrinks(MOCK_USER_ID);
    setSavedDrinks(drinks);
  };

  const loadDrinkLogs = async () => {
    const logs = await drinkService.getDrinkLogs(MOCK_USER_ID);
    const mappedLogs: DrinkLog[] = logs.map(log => ({
      id: log.id,
      user_id: log.user_id,
      drink_id: log.drink_id,
      brand: log.type || '',
      name: log.name,
      type: log.type,
      volume: log.volume_ml || 0,
      abv: log.alcohol_percentage || 0,
      calories: log.calories || 0,
      carbs: 0,
      sugar: 0,
      price: log.cost || 0,
      quantity: 1,
      date: log.logged_at,
      mood_before: log.mood_before,
      mood_after: log.mood_after,
      notes: log.notes,
    }));
    setDrinkLogs(mappedLogs);
  };

  const addDrinkLog = async (drink: Omit<DrinkLog, 'id' | 'date'>) => {
    try {
      console.log('addDrinkLog called with:', drink);

      const drinkType = drink.brand || drink.type || 'unknown';

      const savedDrink = await drinkService.saveDrink({
        user_id: MOCK_USER_ID,
        name: drink.name,
        type: drinkType,
        volume_ml: drink.volume || 0,
        alcohol_percentage: drink.abv || 0,
        calories: drink.calories || 0,
        cost: drink.price || 0,
      });

      console.log('Saved drink result:', savedDrink);

      const logResult = await drinkService.logDrink({
        user_id: MOCK_USER_ID,
        drink_id: savedDrink?.id,
        name: drink.name,
        type: drinkType,
        volume_ml: drink.volume || 0,
        alcohol_percentage: drink.abv || 0,
        calories: drink.calories || 0,
        cost: drink.price || 0,
      });

      console.log('Log drink result:', logResult);

      await loadSavedDrinks();
      await loadDrinkLogs();

      console.log('Successfully added drink and refreshed data');
    } catch (error) {
      console.error('Error in addDrinkLog:', error);
      throw error;
    }
  };

  const removeDrinkLog = async (id: string) => {
    await drinkService.deleteDrinkLog(id);
    await loadDrinkLogs();
  };

  const addMoodEntry = (mood: Omit<MoodEntry, 'id' | 'date'>) => {
    const today = new Date().toDateString();
    const existingMoodIndex = moodEntries.findIndex(
      entry => new Date(entry.date).toDateString() === today
    );

    const newMoodEntry: MoodEntry = {
      ...mood,
      id: new Date().toISOString() + Math.random(),
      date: new Date().toISOString(),
    };

    if (existingMoodIndex >= 0) {
      // Update existing mood for today
      setMoodEntries(prevMoods => 
        prevMoods.map((entry, index) => 
          index === existingMoodIndex ? newMoodEntry : entry
        )
      );
    } else {
      // Add new mood entry
      setMoodEntries(prevMoods => [...prevMoods, newMoodEntry]);
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
            SipTrack AI
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Your Personal Alcohol Consumption, Spending & Mood Tracker
          </p>
        </header>

        <main className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <LogDrinkForm addDrinkLog={addDrinkLog} savedDrinks={savedDrinks} />
            <MoodTracker moods={moodEntries} addMoodEntry={addMoodEntry} />
          </div>
          <Dashboard logs={drinkLogs} moods={moodEntries} />
          <DrinkList logs={drinkLogs} removeDrinkLog={removeDrinkLog} />
        </main>
        
        <footer className="text-center text-slate-500 text-sm pt-8">
          <p>&copy; {new Date().getFullYear()} SipTrack AI. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;