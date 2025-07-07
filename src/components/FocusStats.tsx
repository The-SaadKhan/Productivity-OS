import React from 'react';
import { Clock, Target, TrendingUp, Calendar } from 'lucide-react';

interface FocusStatsProps {
  stats: {
    today: { totalSessions: number; totalTime: number };
    week: { totalSessions: number; totalTime: number };
    month: { totalSessions: number; totalTime: number };
    total: { totalSessions: number; totalTime: number };
  };
}

export const FocusStats: React.FC<FocusStatsProps> = ({ stats }) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Focus Statistics
      </h3>
      
      <div className="space-y-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Today
              </span>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {stats.today.totalSessions}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(stats.today.totalTime)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                This Week
              </span>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {stats.week.totalSessions}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(stats.week.totalTime)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                This Month
              </span>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {stats.month.totalSessions}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(stats.month.totalTime)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                All Time
              </span>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {stats.total.totalSessions}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(stats.total.totalTime)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};