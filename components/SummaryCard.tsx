import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from './Icons';

interface SummaryCardProps {
  title: string;
  value: string;
  Icon: React.ElementType;
  colorClass: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    change: number;
  };
}

const TrendIndicator: React.FC<{ trend: SummaryCardProps['trend'] }> = ({ trend }) => {
  if (!trend || trend.direction === 'stable') {
    return <p className="text-xs text-slate-500">No change from previous 7 days</p>;
  }
  
  // For all metrics, 'up' is considered negative (red), and 'down' is positive (green).
  const isUp = trend.direction === 'up';
  const color = isUp ? 'text-red-500' : 'text-green-500';
  const TrendIcon = isUp ? ArrowUpIcon : ArrowDownIcon;

  return (
    <div className={`flex items-center text-xs font-semibold ${color}`}>
      <TrendIcon className="w-4 h-4 mr-1" />
      <span>
        {trend.change.toFixed(1)}% {isUp ? 'increase' : 'decrease'} vs last 7 days
      </span>
    </div>
  );
};


const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, Icon, colorClass, trend }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClass}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
      <div className="mt-4">
        <TrendIndicator trend={trend} />
      </div>
    </div>
  );
};

export default SummaryCard;