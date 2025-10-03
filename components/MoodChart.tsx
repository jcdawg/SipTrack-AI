import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { MoodEntry } from '../types';

interface MoodChartProps {
  moods: MoodEntry[];
}

const MoodChart: React.FC<MoodChartProps> = ({ moods }) => {
  // Process mood data for the chart
  const processMoodData = (moods: MoodEntry[]) => {
    if (moods.length === 0) return [];

    // Sort by date
    const sortedMoods = [...moods].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Get the last 30 days or all available data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentMoods = sortedMoods.filter(mood => new Date(mood.date) >= thirtyDaysAgo);
    
    // Create data points for the chart
    const chartData = recentMoods.map(mood => ({
      date: new Date(mood.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: mood.mood,
      fullDate: mood.date,
      notes: mood.notes,
      tags: mood.tags,
    }));

    return chartData;
  };

  const chartData = processMoodData(moods);

  const getMoodColor = (mood: number) => {
    switch (mood) {
      case 1: return '#ef4444'; // red
      case 2: return '#f97316'; // orange
      case 3: return '#eab308'; // yellow
      case 4: return '#22c55e'; // green
      case 5: return '#3b82f6'; // blue
      default: return '#6b7280'; // gray
    }
  };

  const getMoodLabel = (mood: number) => {
    switch (mood) {
      case 1: return 'Very Low';
      case 2: return 'Low';
      case 3: return 'Neutral';
      case 4: return 'Good';
      case 5: return 'Excellent';
      default: return 'Unknown';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900">{label}</p>
          <p className="text-sm" style={{ color: getMoodColor(data.mood) }}>
            Mood: {data.mood}/5 - {getMoodLabel(data.mood)}
          </p>
          {data.notes && (
            <p className="text-xs text-slate-600 mt-1">"{data.notes}"</p>
          )}
          {data.tags && data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {data.tags.map((tag: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        <div className="text-center">
          <p className="text-lg font-medium">No mood data yet</p>
          <p className="text-sm">Start tracking your mood to see trends!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodChart;
