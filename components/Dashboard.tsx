import React from 'react';
import type { DrinkLog, MoodEntry, MoodCorrelation } from '../types';
import SummaryCard from './SummaryCard';
import { BeerIcon, MoneyIcon, CalorieIcon, WeightIcon, HeartIcon } from './Icons';
import SpendingChart from './SpendingChart';
import HealthChart from './HealthChart';
import MoodChart from './MoodChart';

interface DashboardProps {
  logs: DrinkLog[];
  moods: MoodEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ logs, moods }) => {
  // Lifetime Totals for main display, now with defensive checks
  const totalDrinks = logs.reduce((sum, log) => sum + (Number(log.quantity) || 0), 0);
  const totalSpent = logs.reduce((sum, log) => sum + (Number(log.price) || 0) * (Number(log.quantity) || 0), 0);
  const totalCalories = logs.reduce((sum, log) => sum + (Number(log.calories) || 0) * (Number(log.quantity) || 0), 0);
  const estimatedWeightGain = totalCalories / 3500; // 3500 calories ~ 1 lb of fat

  // Calculate mood correlation with drinking
  const calculateMoodCorrelation = (logs: DrinkLog[], moods: MoodEntry[]): MoodCorrelation => {
    if (moods.length === 0) {
      return {
        averageMoodWithDrinks: 0,
        averageMoodWithoutDrinks: 0,
        correlationStrength: 0,
        daysAnalyzed: 0,
      };
    }

    // Get unique days with drinks
    const drinkDays = new Set(
      logs.map(log => new Date(log.date).toDateString())
    );

    // Group moods by day
    const moodsByDay = moods.reduce((acc, mood) => {
      const day = new Date(mood.date).toDateString();
      if (!acc[day]) acc[day] = [];
      acc[day].push(mood);
      return acc;
    }, {} as Record<string, MoodEntry[]>);

    // Calculate average mood for days with and without drinks
    let moodWithDrinks = 0;
    let moodWithoutDrinks = 0;
    let daysWithDrinks = 0;
    let daysWithoutDrinks = 0;

    Object.entries(moodsByDay).forEach(([day, dayMoods]) => {
      const averageMood = dayMoods.reduce((sum, mood) => sum + mood.mood, 0) / dayMoods.length;
      
      if (drinkDays.has(day)) {
        moodWithDrinks += averageMood;
        daysWithDrinks++;
      } else {
        moodWithoutDrinks += averageMood;
        daysWithoutDrinks++;
      }
    });

    const avgMoodWithDrinks = daysWithDrinks > 0 ? moodWithDrinks / daysWithDrinks : 0;
    const avgMoodWithoutDrinks = daysWithoutDrinks > 0 ? moodWithoutDrinks / daysWithoutDrinks : 0;
    
    // Simple correlation calculation
    const correlationStrength = avgMoodWithDrinks - avgMoodWithoutDrinks;
    const daysAnalyzed = daysWithDrinks + daysWithoutDrinks;

    return {
      averageMoodWithDrinks: avgMoodWithDrinks,
      averageMoodWithoutDrinks: avgMoodWithoutDrinks,
      correlationStrength,
      daysAnalyzed,
    };
  };

  const moodCorrelation = calculateMoodCorrelation(logs, moods);

  // Calculate average mood
  const averageMood = moods.length > 0 
    ? moods.reduce((sum, mood) => sum + mood.mood, 0) / moods.length 
    : 0;

  // Trend Calculation (Last 7 days vs. Previous 7 days)
  const getMetricsForPeriod = (logs: DrinkLog[], startDate: Date, endDate: Date) => {
    const filteredLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= startDate && logDate < endDate;
    });

    // Added defensive Number() checks to prevent crashes from bad data
    const drinks = filteredLogs.reduce((sum, log) => sum + (Number(log.quantity) || 0), 0);
    const spent = filteredLogs.reduce((sum, log) => sum + (Number(log.price) || 0) * (Number(log.quantity) || 0), 0);
    const calories = filteredLogs.reduce((sum, log) => sum + (Number(log.calories) || 0) * (Number(log.quantity) || 0), 0);
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

  const getMoodTrend = () => {
    if (moods.length < 2) return { direction: 'stable' as const, change: 0 };
    
    const recentMoods = moods.slice(-7); // Last 7 mood entries
    const olderMoods = moods.slice(-14, -7); // Previous 7 mood entries
    
    if (recentMoods.length === 0 || olderMoods.length === 0) {
      return { direction: 'stable' as const, change: 0 };
    }
    
    const recentAvg = recentMoods.reduce((sum, mood) => sum + mood.mood, 0) / recentMoods.length;
    const olderAvg = olderMoods.reduce((sum, mood) => sum + mood.mood, 0) / olderMoods.length;
    
    return calculateTrend(recentAvg, olderAvg);
  };

  const moodTrend = getMoodTrend();

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <SummaryCard title="Lifetime Drinks" value={totalDrinks.toString()} Icon={BeerIcon} colorClass="bg-blue-500" trend={drinksTrend} />
        <SummaryCard title="Lifetime Spent" value={`$${totalSpent.toFixed(2)}`} Icon={MoneyIcon} colorClass="bg-green-500" trend={spentTrend} />
        <SummaryCard title="Lifetime Calories" value={totalCalories.toLocaleString()} Icon={CalorieIcon} colorClass="bg-orange-500" trend={caloriesTrend} />
        <SummaryCard title="Est. Lifetime Gain" value={`${estimatedWeightGain.toFixed(2)} lbs`} Icon={WeightIcon} colorClass="bg-red-500" trend={weightTrend} />
        <SummaryCard title="Average Mood" value={averageMood > 0 ? `${averageMood.toFixed(1)}/5` : 'N/A'} Icon={HeartIcon} colorClass="bg-pink-500" trend={moodTrend} />
      </div>

      {/* Mood Correlation Analysis */}
      {moodCorrelation.daysAnalyzed > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center mb-4">
            <HeartIcon className="w-6 h-6 text-pink-500 mr-2" />
            <h3 className="text-xl font-semibold text-slate-900">Mood & Drinking Correlation</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-cyan-50 rounded-lg">
              <div className="text-2xl font-bold text-cyan-600">
                {moodCorrelation.averageMoodWithDrinks.toFixed(1)}
              </div>
              <div className="text-sm text-slate-600">Avg mood on drinking days</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {moodCorrelation.averageMoodWithoutDrinks.toFixed(1)}
              </div>
              <div className="text-sm text-slate-600">Avg mood on dry days</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className={`text-2xl font-bold ${moodCorrelation.correlationStrength > 0 ? 'text-purple-600' : 'text-orange-600'}`}>
                {moodCorrelation.correlationStrength > 0 ? '+' : ''}{moodCorrelation.correlationStrength.toFixed(1)}
              </div>
              <div className="text-sm text-slate-600">Mood difference</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-700">
              {moodCorrelation.correlationStrength > 0.5 ? 
                "📈 You tend to feel better on days when you drink" :
                moodCorrelation.correlationStrength < -0.5 ?
                "📉 You tend to feel better on days when you don't drink" :
                "📊 Your mood doesn't show a strong correlation with drinking patterns"
              }
            </p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-2 text-slate-900">Spending Trend</h3>
          <SpendingChart logs={logs} />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-2 text-slate-900">Health Impact</h3>
           <HealthChart logs={logs} />
        </div>
      </div>

      {/* Mood Chart */}
      {moods.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-2 text-slate-900">Mood Trends</h3>
          <MoodChart moods={moods} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;