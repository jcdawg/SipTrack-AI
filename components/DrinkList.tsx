import React from 'react';
import type { DrinkLog } from '../types';
import { TrashIcon } from './Icons';

interface DrinkListProps {
  logs: DrinkLog[];
  removeDrinkLog: (id: string) => void;
}

const DrinkList: React.FC<DrinkListProps> = ({ logs, removeDrinkLog }) => {
  if (logs.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl text-center">
        <p className="text-slate-500">No drinks logged yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-slate-900">Recent Drinks</h3>
      <div className="space-y-4">
        {logs.slice().reverse().map((log) => (
          <div key={log.id} className="bg-slate-50 p-4 rounded-lg flex justify-between items-center">
            <div>
              <p className="font-bold text-lg text-slate-800">
                {log.quantity}x {log.brand} {log.name}
              </p>
              <p className="text-sm text-slate-500">
                {(Number(log.calories) || 0)} kcal &bull; {(Number(log.abv) || 0)}% ABV &bull; $${(Number(log.price) || 0).toFixed(2)} &bull; {new Date(log.date).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => removeDrinkLog(log.id)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-200 rounded-full transition-colors duration-200"
              aria-label="Delete log"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DrinkList;