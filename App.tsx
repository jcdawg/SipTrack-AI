import * as React from 'react';
import type { DrinkLog } from './types';
import LogDrinkForm from './components/LogDrinkForm';
import Dashboard from './components/Dashboard';
import DrinkList from './components/DrinkList';

const App: React.FC = () => {
  const [drinkLogs, setDrinkLogs] = React.useState<DrinkLog[]>(() => {
    try {
      const savedLogs = localStorage.getItem('drinkLogs');
      return savedLogs ? JSON.parse(savedLogs) : [];
    } catch (error) {
      console.error("Could not parse drink logs from localStorage", error);
      return [];
    }
  });

  React.useEffect(() => {
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