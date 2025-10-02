import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DrinkLog } from '../types';

interface HealthChartProps {
  logs: DrinkLog[];
}

type Period = 'weekly' | 'monthly';

interface HealthData {
    caloriesFromAlcohol: number;
    caloriesFromCarbs: number;
    caloriesFromSugar: number;
}

const processData = (logs: DrinkLog[], period: Period) => {
    const dataMap = new Map<string, HealthData>();

    logs.forEach(log => {
        const date = new Date(log.date);
        let key: string;

        if (period === 'weekly') {
            const day = date.getDay();
            const firstDayOfWeek = new Date(new Date(log.date).setDate(date.getDate() - day));
            key = firstDayOfWeek.toISOString().split('T')[0];
        } else {
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }

        const currentData = dataMap.get(key) || { caloriesFromAlcohol: 0, caloriesFromCarbs: 0, caloriesFromSugar: 0 };
        
        const quantity = Number(log.quantity) || 0;

        // Calorie calculation: 1g carb/sugar = 4 calories.
        const sugarCals = (Number(log.sugar) || 0) * quantity * 4;
        const totalCarbCals = (Number(log.carbs) || 0) * quantity * 4;
        const alcoholCals = Math.max(0, ((Number(log.calories) || 0) * quantity) - totalCarbCals);
        const otherCarbCals = totalCarbCals - sugarCals;

        dataMap.set(key, {
            caloriesFromSugar: currentData.caloriesFromSugar + sugarCals,
            caloriesFromCarbs: currentData.caloriesFromCarbs + otherCarbCals,
            caloriesFromAlcohol: currentData.caloriesFromAlcohol + alcoholCals,
        });
    });

    const sortedData = Array.from(dataMap.entries()).sort(([keyA], [keyB]) => {
        if (period === 'weekly') {
            return new Date(keyA).getTime() - new Date(keyB).getTime();
        }
        return keyA.localeCompare(keyB);
    });

    return sortedData.map(([key, data]) => {
        let name: string;
        if (period === 'weekly') {
            const date = new Date(key);
            name = `Wk of ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
        } else {
            const [year, month] = key.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1);
            name = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        }
        return { 
            name, 
            caloriesFromAlcohol: Math.round(data.caloriesFromAlcohol),
            caloriesFromCarbs: Math.round(data.caloriesFromCarbs),
            caloriesFromSugar: Math.round(data.caloriesFromSugar),
        };
    });
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const total = payload.reduce((sum, item) => sum + item.value, 0);
        return (
            <div className="bg-white p-3 border border-slate-300 rounded-lg shadow-lg text-sm">
                <p className="font-bold text-slate-800 mb-2">{label}</p>
                {payload.map((pld: any) => (
                    <div key={pld.dataKey} style={{ color: pld.fill }} className="flex justify-between">
                        <span>{pld.name}:</span>
                        <span className="font-semibold ml-4">{pld.value.toLocaleString()} kcal</span>
                    </div>
                ))}
                 <hr className="my-2 border-slate-200" />
                 <div className="flex justify-between font-bold text-slate-800">
                    <span>Total:</span>
                    <span>{total.toLocaleString()} kcal</span>
                 </div>
            </div>
        );
    }
    return null;
};

const HealthChart: React.FC<HealthChartProps> = ({ logs }) => {
  const [period, setPeriod] = useState<Period>('weekly');

  const chartData = useMemo(() => processData(logs, period), [logs, period]);

  if (logs.length === 0) {
    return (
        <div className="w-full h-[300px] flex items-center justify-center bg-slate-100 rounded-lg">
            <p className="text-slate-500">Log some drinks to see your health impact.</p>
        </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="flex bg-slate-200 rounded-lg p-1">
          <button onClick={() => setPeriod('weekly')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${period === 'weekly' ? 'bg-white text-cyan-600 shadow' : 'text-slate-600 hover:bg-slate-300'}`} aria-pressed={period === 'weekly'}>
            Weekly
          </button>
          <button onClick={() => setPeriod('monthly')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${period === 'monthly' ? 'bg-white text-cyan-600 shadow' : 'text-slate-600 hover:bg-slate-300'}`} aria-pressed={period === 'monthly'}>
            Monthly
          </button>
        </div>
      </div>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
            <YAxis tickFormatter={(value) => `${value / 1000}k`} tick={{ fontSize: 12 }} stroke="#64748b" />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
            <Legend wrapperStyle={{fontSize: "14px"}} />
            <Bar dataKey="caloriesFromSugar" stackId="a" name="From Sugar" fill="#f59e0b" />
            <Bar dataKey="caloriesFromCarbs" stackId="a" name="From Other Carbs" fill="#f97316" />
            <Bar dataKey="caloriesFromAlcohol" stackId="a" name="From Alcohol/Other" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HealthChart;