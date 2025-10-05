import React, { useState, useEffect } from 'react';
import type { DrinkLog, MoodEntry, SavedDrink } from './types';
import LogDrinkForm from './components/LogDrinkForm';
import Dashboard from './components/Dashboard';
import DrinkList from './components/DrinkList';
import MoodTracker from './components/MoodTracker';
import { drinkService } from './services/drinkService';

const MOCK_USER_ID = 'demo-user-123';

const App: React.FC = () => {
  const [savedDrinks, setSavedDrinks] = useState<SavedDrink[]>([]);
  const [drinkLogs, setDrinkLogs] = useState<DrinkLog[]>(() => {
    try {
      const savedLogs = localStorage.getItem('drinkLogs');
      if (!savedLogs) return [];
      
      const parsedLogs: any[] = JSON.parse(savedLogs);

      // Sanitize logs to ensure numeric fields are numbers and handle legacy data issues.
      const sanitizedLogs = parsedLogs.map(log => {
        // A simple check to filter out any potentially malformed log entries
        if (!log || typeof log !== 'object' || !log.id) {
          return null;
        }
        return {
          id: String(log.id),
          brand: String(log.brand ?? ''),
          name: String(log.name ?? ''),
          volume: Number(log.volume) || 0,
          abv: Number(log.abv) || 0,
          calories: Number(log.calories) || 0,
          carbs: Number(log.carbs) || 0,
          sugar: Number(log.sugar) || 0,
          price: Number(log.price) || 0,
          quantity: Number(log.quantity) || 1, // Default quantity to 1 if missing/invalid
          date: String(log.date ?? new Date().toISOString()),
        };
      }).filter((log): log is DrinkLog => log !== null); // Filter out nulls and assert type

      return sanitizedLogs;
    } catch (error) {
      console.error("Could not parse or sanitize drink logs from localStorage", error);
      // If parsing/sanitization fails, it's safer to start fresh to prevent app crashes.
      localStorage.removeItem('drinkLogs'); 
      return [];
    }
  });

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
    localStorage.setItem('drinkLogs', JSON.stringify(drinkLogs));
  }, [drinkLogs]);

  useEffect(() => {
    localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
  }, [moodEntries]);

  useEffect(() => {
    loadSavedDrinks();
  }, []);

  const loadSavedDrinks = async () => {
    const drinks = await drinkService.getSavedDrinks(MOCK_USER_ID);
    setSavedDrinks(drinks);
  };

  const addDrinkLog = async (drink: Omit<DrinkLog, 'id' | 'date'>) => {
    const newLog: DrinkLog = {
      ...drink,
      id: new Date().toISOString() + Math.random(),
      date: new Date().toISOString(),
      user_id: MOCK_USER_ID,
      type: drink.brand || 'unknown',
    };
    setDrinkLogs(prevLogs => [...prevLogs, newLog]);

    const savedDrink = await drinkService.saveDrink({
      user_id: MOCK_USER_ID,
      name: drink.name,
      type: drink.brand || 'unknown',
      volume_ml: drink.volume,
      alcohol_percentage: drink.abv,
      calories: drink.calories,
      cost: drink.price,
    });

    await drinkService.logDrink({
      user_id: MOCK_USER_ID,
      drink_id: savedDrink?.id,
      name: drink.name,
      type: drink.brand || 'unknown',
      volume_ml: drink.volume,
      alcohol_percentage: drink.abv,
      calories: drink.calories,
      cost: drink.price,
    });

    await loadSavedDrinks();
  };

  const removeDrinkLog = (id: string) => {
    setDrinkLogs(prevLogs => prevLogs.filter(log => log.id !== id));
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