import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatsCard } from '../components/StatsCard';
import { ActivityChart } from '../components/ActivityChart';
import { 
  CheckSquare, 
  Target, 
  Clock, 
  StickyNote,
  TrendingUp,
  Calendar,
  Award
} from 'lucide-react';

interface DashboardStats {
  tasks: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  habits: {
    totalHabits: number;
    avgCurrentStreak: number;
    avgBestStreak: number;
    totalCompletions: number;
  };
  focus: {
    totalSessions: number;
    totalTime: number;
    avgSessionLength: number;
  };
  notes: {
    totalNotes: number;
    pinnedNotes: number;
  };
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, analyticsResponse] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getAnalytics('week')
        ]);
        
        setStats(statsResponse.data);
        setAnalytics(analyticsResponse.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  const completionRate = stats.tasks.total > 0 
    ? Math.round((stats.tasks.completed / stats.tasks.total) * 100)
    : 0;

  const avgFocusTime = stats.focus.totalSessions > 0
    ? Math.round(stats.focus.avgSessionLength)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
        <StatsCard
          title="Tasks"
          value={stats.tasks.completed}
          total={stats.tasks.total}
          icon={CheckSquare}
          color="blue"
          subtitle={`${completionRate}% completion rate`}
        />
        
        <StatsCard
          title="Active Habits"
          value={stats.habits.totalHabits}
          icon={Target}
          color="green"
          subtitle={`${Math.round(stats.habits.avgCurrentStreak)} avg streak`}
        />
        
        <StatsCard
          title="Focus Sessions"
          value={stats.focus.totalSessions}
          icon={Clock}
          color="purple"
          subtitle={`${avgFocusTime} min average`}
        />
        
        <StatsCard
          title="Notes"
          value={stats.notes.totalNotes}
          icon={StickyNote}
          color="orange"
          subtitle={`${stats.notes.pinnedNotes} pinned`}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Focus Time
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(stats.focus.totalTime / 60)}h {stats.focus.totalTime % 60}m
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                Overdue Tasks
              </p>
              <p className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.tasks.overdue}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                Best Streak
              </p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {Math.round(stats.habits.avgBestStreak)} days
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Chart */}
      {analytics && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Weekly Activity
          </h3>
          <div className="h-48 sm:h-64 lg:h-80">
            <ActivityChart data={analytics} />
          </div>
        </div>
      )}
    </div>
  );
};