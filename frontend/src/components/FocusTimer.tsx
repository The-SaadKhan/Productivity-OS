import React from 'react';

interface FocusTimerProps {
  timeLeft: number;
  totalTime: number;
  isRunning: boolean;
  sessionType: 'focus' | 'break';
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  timeLeft,
  totalTime,
  isRunning,
  sessionType
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress * circumference);

  const getTimerColor = () => {
    switch (sessionType) {
      case 'focus':
        return '#3B82F6';
      case 'break':
        return '#10B981';
      default:
        return '#3B82F6';
    }
  };

  const getSessionLabel = () => {
    switch (sessionType) {
      case 'focus':
        return 'Focus Time';
      case 'break':
        return 'Break Time';
      default:
        return 'Focus Time';
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <svg className="w-48 h-48 sm:w-64 sm:h-64 transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-gray-200 dark:text-gray-700 sm:hidden"
          />
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke={getTimerColor()}
            strokeWidth="6"
            fill="none"
            strokeDasharray={2 * Math.PI * 88}
            strokeDashoffset={2 * Math.PI * 88 - (progress * 2 * Math.PI * 88)}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out sm:hidden"
          />
          {/* Desktop version */}
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200 dark:text-gray-700 hidden sm:block"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke={getTimerColor()}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out hidden sm:block"
          />
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              {formatTime(timeLeft)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
              {getSessionLabel()}
            </div>
            {isRunning && (
              <div className="mt-1 sm:mt-2">
                <div className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  Running
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};