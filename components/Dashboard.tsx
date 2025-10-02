import * as React from 'react';
import type { DrinkLog } from '../types';
import SummaryCard from './SummaryCard';
import { BeerIcon, MoneyIcon, CalorieIcon, WeightIcon } from './Icons';

interface DashboardProps {
  logs: DrinkLog[];
}

const Dashboard: React.FC<DashboardProps> = ({ logs }) => {
  // Lifetime Totals for main display
  const totalDrinks = logs.reduce((sum, log) => sum + log.quantity, 0);
  const totalSpent = logs.reduce((sum, log) => sum + log.price * log.quantity, 0);
  const totalCalories = logs.reduce((sum, log) => sum + log.calories * log.quantity, 0);
  const estimatedWeightGain = totalCalories / 3500; // 3500 calories ~ 1 lb of fat

  // Trend Calculation (Last 7 days vs. Previous 7 days)
  const getMetricsForPeriod = (logs: DrinkLog[], startDate: Date, endDate: Date) => {
    const filteredLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= startDate && logDate < endDate;
    });

    const drinks = filteredLogs.reduce((sum, log) => sum + log.quantity, 0);
    const spent = filteredLogs.reduce((sum, log) => sum + log.price * log.quantity, 0);
    const calories = filteredLogs.reduce((sum, log) => sum + log.calories * log.quantity, 0);
    const weightGain = calories / 3500;

    return { drinks, spent, calories, weightGain };
  };

  const now = new Date();
  const last7DaysEndDate = new Date(now);
  const last7DaysStartDate = new Date(now);
  last7DaysStartDate.setDate(now.getDate() - 7);
  
  const prev7DaysEndDate = new Date(last7DaysStartDate);
  const prev7DaysStartDate = new Date(last7DaysStartDate);
  prev7DaysStartDate.setDate(last7DaysStartDate.getDate() - 7);

  const last7DaysMetrics = getMetricsForPeriod(logs, last7DaysStartDate, last7DaysEndDate);
  const prev7DaysMetrics = getMetricsForPeriod(logs, prev7DaysStartDate, prev7DaysEndDate);

  // Fix: Add explicit return type to `calculateTrend` to match the type expected by the `SummaryCard`'s `trend` prop.
  const calculateTrend = (current: number, previous: number): { direction: 'up' | 'down' | 'stable'; change: number; } => {
    if (previous === 0 && current === 0) {
      return { direction: 'stable', change: 0 };
    }
    if (previous === 0) {
        return { direction: 'up', change: 100 }; // Representing an increase from zero
    }
    if (current === previous) {
        return { direction: 'stable', change: 0 };
    }
    const change = ((current - previous) / previous) * 100;
    return {
        direction: current > previous ? 'up' : 'down',
        change: Math.abs(change),
    };
  };

  const drinksTrend = calculateTrend(last7DaysMetrics.drinks, prev7DaysMetrics.drinks);
  const spentTrend = calculateTrend(last7DaysMetrics.spent, prev7DaysMetrics.spent);
  const caloriesTrend = calculateTrend(last7DaysMetrics.calories, prev7DaysMetrics.calories);
  const weightTrend = calculateTrend(last7DaysMetrics.weightGain, prev7DaysMetrics.weightGain);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="Lifetime Drinks" value={totalDrinks.toString()} Icon={BeerIcon} colorClass="bg-blue-500" trend={drinksTrend} />
        <SummaryCard title="Lifetime Spent" value={`$${totalSpent.toFixed(2)}`} Icon={MoneyIcon} colorClass="bg-green-500" trend={spentTrend} />
        <SummaryCard title="Lifetime Calories" value={totalCalories.toLocaleString()} Icon={CalorieIcon} colorClass="bg-orange-500" trend={caloriesTrend} />
        <SummaryCard title="Est. Lifetime Gain" value={`${estimatedWeightGain.toFixed(2)} lbs`} Icon={WeightIcon} colorClass="bg-red-500" trend={weightTrend} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-slate-900">Spending Trend</h3>
          <div className="w-full h-[300px] flex items-center justify-center bg-slate-100 rounded-lg">
            <p className="text-slate-500">Chart is temporarily unavailable.</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-slate-900">Health Impact</h3>
           <div className="w-full h-[300px] flex items-center justify-center bg-slate-100 rounded-lg">
            <p className="text-slate-500">Chart is temporarily unavailable.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;