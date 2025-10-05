import React, { useState, useEffect } from 'react';
import type { DrinkLog, MoodEntry, SavedDrink } from './types';
import LogDrinkForm from './components/LogDrinkForm';
import Dashboard from './components/Dashboard';
import DrinkList from './components/DrinkList';
import MoodTracker from './components/MoodTracker';
import { drinkService } from './services/drinkService';
import { moodService } from './services/moodService';

const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

const App: React.FC = () => {
  const [savedDrinks, setSavedDrinks] = useState<SavedDrink[]>([]);
  const [drinkLogs, setDrinkLogs] = useState<DrinkLog[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [hasMigratedMoods, setHasMigratedMoods] = useState(false);

  useEffect(() => {
    loadSavedDrinks();
    loadDrinkLogs();
    loadMoodEntries();
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

  const loadMoodEntries = async () => {
    if (!hasMigratedMoods) {
      await migrateLocalStorageMoods();
      setHasMigratedMoods(true);
    }
    const moods = await moodService.getMoodEntries(MOCK_USER_ID);
    setMoodEntries(moods);
  };

  const migrateLocalStorageMoods = async () => {
    try {
      const savedMoods = localStorage.getItem('moodEntries');
      if (!savedMoods) return;

      const parsedMoods: any[] = JSON.parse(savedMoods);
      const sanitizedMoods = parsedMoods
        .map(mood => {
          if (!mood || typeof mood !== 'object' || !mood.id) {
            return null;
          }
          return {
            id: String(mood.id),
            date: String(mood.date ?? new Date().toISOString()),
            mood: Number(mood.mood) || 3,
            notes: mood.notes ? String(mood.notes) : undefined,
            tags: Array.isArray(mood.tags) ? mood.tags.map(String) : [],
          };
        })
        .filter((mood): mood is MoodEntry => mood !== null);

      if (sanitizedMoods.length > 0) {
        await moodService.migrateMoodsFromLocalStorage(MOCK_USER_ID, sanitizedMoods);
        localStorage.removeItem('moodEntries');
        console.log('Successfully migrated moods from localStorage to Supabase');
      }
    } catch (error) {
      console.error('Error migrating moods from localStorage:', error);
      localStorage.removeItem('moodEntries');
    }
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

  const addMoodEntry = async (mood: Omit<MoodEntry, 'id' | 'date'>) => {
    try {
      await moodService.saveMoodEntry({
        user_id: MOCK_USER_ID,
        mood: mood.mood,
        notes: mood.notes,
        tags: mood.tags,
      });
      await loadMoodEntries();
    } catch (error) {
      console.error('Error adding mood entry:', error);
      throw error;
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