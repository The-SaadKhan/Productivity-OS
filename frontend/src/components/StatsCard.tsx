import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  total?: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
  subtitle?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  total,
  icon: Icon,
  color,
  subtitle
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400',
    red: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">
            {value}
            {total && (
              <span className="text-xs sm:text-sm font-normal text-gray-500 dark:text-gray-400">
                /{total}
              </span>
            )}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-1.5 sm:p-2 lg:p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
        </div>
      </div>
    </div>
  );
};