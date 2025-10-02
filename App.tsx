import React, { useState, useEffect } from 'react';
import type { DrinkLog } from './types';
import LogDrinkForm from './components/LogDrinkForm';
import Dashboard from './components/Dashboard';
import DrinkList from './components/DrinkList';

const App: React.FC = () => {
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

  useEffect(() => {
    localStorage.setItem('drinkLogs', JSON.stringify(drinkLogs));
  }, [drinkLogs]);

  const addDrinkLog = (drink: Omit<DrinkLog, 'id' | 'date'>) => {
    const newLog: DrinkLog = {
      ...drink,
      id: new Date().toISOString() + Math.random(),
      date: new Date().toISOString(),
    };
    setDrinkLogs(prevLogs => [...prevLogs, newLog]);
  };

  const removeDrinkLog = (id: string) => {
    setDrinkLogs(prevLogs => prevLogs.filter(log => log.id !== id));
  };
  
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
            SipTrack AI
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Your Personal Alcohol Consumption & Spending Tracker
          </p>
        </header>

        <main className="space-y-8">
          <LogDrinkForm addDrinkLog={addDrinkLog} />
          <Dashboard logs={drinkLogs} />
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
