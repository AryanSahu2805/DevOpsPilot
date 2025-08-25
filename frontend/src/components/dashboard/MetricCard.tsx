// src/components/dashboard/MetricCard.tsx
import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: LucideIcon;
  color: 'emerald' | 'blue' | 'purple' | 'orange' | 'red';
  description?: string;
}

const colorClasses = {
  emerald: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  blue: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  purple: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
  orange: 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
  red: 'bg-red-500/20 text-red-600 dark:text-red-400'
};

const changeColorClasses = {
  increase: 'text-emerald-600 dark:text-emerald-400',
  decrease: 'text-red-600 dark:text-red-400',
  neutral: 'text-gray-600 dark:text-gray-400'
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  description
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center space-x-1">
          {changeType === 'increase' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
          {changeType === 'decrease' && <TrendingDown className="w-4 h-4 text-red-500" />}
          <span className={`text-sm font-medium ${changeColorClasses[changeType]}`}>
            {change}
          </span>
        </div>
      </div>
      
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        )}
      </div>
      
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {value}
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            color === 'emerald' ? 'bg-emerald-500' :
            color === 'blue' ? 'bg-blue-500' :
            color === 'purple' ? 'bg-purple-500' :
            color === 'orange' ? 'bg-orange-500' :
            'bg-red-500'
          }`}
          style={{ 
            width: typeof value === 'string' && value.includes('%') 
              ? value.replace('%', '') + '%' 
              : '60%' 
          }}
        ></div>
      </div>
    </div>
  );
};
