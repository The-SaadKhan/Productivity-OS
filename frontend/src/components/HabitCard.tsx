import React from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Edit2, Trash2, Flame, Award, Calendar } from 'lucide-react';

interface Habit {
  _id: string;
  name: string;
  description: string;
  color: string;
  targetFrequency: 'daily' | 'weekly';
  isActive: boolean;
  completions: Array<{
    date: string;
    completed: boolean;
  }>;
  stats: {
    currentStreak: number;
    bestStreak: number;
    totalCompletions: number;
  };
}

interface HabitCardProps {
  habit: Habit;
  onToggleCompletion: (habitId: string, date: string, completed: boolean) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onToggleCompletion,
  onEdit,
  onDelete
}) => {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getCompletionForDate = (date: Date) => {
    return habit.completions.find(completion => 
      isSameDay(new Date(completion.date), date)
    );
  };

  const isCompletedToday = () => {
    const todayCompletion = getCompletionForDate(today);
    return todayCompletion?.completed || false;
  };

  const handleTodayToggle = () => {
    const completed = !isCompletedToday();
    onToggleCompletion(habit._id, today.toISOString(), completed);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: habit.color }}
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {habit.name}
            </h3>
            {habit.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {habit.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(habit)}
            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onDelete(habit._id)}
            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Today's Completion */}
      <div className="mb-4">
        <button
          onClick={handleTodayToggle}
          className={`w-full p-3 rounded-lg border-2 transition-colors ${
            isCompletedToday()
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              : 'border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">
              {isCompletedToday() ? 'Completed Today!' : 'Mark as Done Today'}
            </span>
          </div>
        </button>
      </div>

      {/* Weekly Progress */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          This Week
        </h4>
        <div className="flex space-x-1">
          {weekDays.map(day => {
            const completion = getCompletionForDate(day);
            const isCompleted = completion?.completed || false;
            const isToday = isSameDay(day, today);
            
            return (
              <div
                key={day.toISOString()}
                className={`flex-1 h-8 rounded flex items-center justify-center text-xs font-medium ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isToday
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-2 border-blue-500'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {format(day, 'EEE')[0]}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-center space-x-1 text-orange-600 dark:text-orange-400">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-medium">
              {habit.stats.currentStreak}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Current
          </p>
        </div>
        
        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-center space-x-1 text-yellow-600 dark:text-yellow-400">
            <Award className="w-4 h-4" />
            <span className="text-sm font-medium">
              {habit.stats.bestStreak}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Best
          </p>
        </div>
        
        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-center space-x-1 text-green-600 dark:text-green-400">
            <span className="text-sm font-medium">
              {habit.stats.totalCompletions}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Total
          </p>
        </div>
      </div>
    </div>
  );
};