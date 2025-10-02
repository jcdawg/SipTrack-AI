import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DrinkLog } from '../types';

interface SpendingChartProps {
  logs: DrinkLog[];
}

type Period = 'weekly' | 'monthly';

const processData = (logs: DrinkLog[], period: Period) => {
    const dataMap = new Map<string, number>();

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

        const cost = (Number(log.price) || 0) * (Number(log.quantity) || 0);
        dataMap.set(key, (dataMap.get(key) || 0) + cost);
    });

    const sortedData = Array.from(dataMap.entries()).sort(([keyA], [keyB]) => {
        if (period === 'weekly') {
            return new Date(keyA).getTime() - new Date(keyB).getTime();
        }
        return keyA.localeCompare(keyB);
    });

    return sortedData.map(([key, spending]) => {
        let name: string;
        if (period === 'weekly') {
            const date = new Date(key);
            name = `Wk of ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
        } else {
            const [year, month] = key.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1);
            name = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        }
        return { name, spending: parseFloat(spending.toFixed(2)) };
    });
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-slate-300 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-700">{label}</p>
          <p className="text-cyan-600">{`Spending: $${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };
  

const SpendingChart: React.FC<SpendingChartProps> = ({ logs }) => {
  const [period, setPeriod] = useState<Period>('weekly');

  const chartData = useMemo(() => processData(logs, period), [logs, period]);

  if (logs.length === 0) {
    return (
        <div className="w-full h-[300px] flex items-center justify-center bg-slate-100 rounded-lg">
            <p className="text-slate-500">Log some drinks to see your spending trend.</p>
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
            <YAxis tickFormatter={(value) => `$${value}`} tick={{ fontSize: 12 }} stroke="#64748b" />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
            <Legend wrapperStyle={{fontSize: "14px"}} />
            <Bar dataKey="spending" fill="#0891b2" name="Spending" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpendingChart;