import React, { useState, useEffect } from 'react';
import { habitsAPI } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { HabitCard } from '../components/HabitCard';
import { HabitForm } from '../components/HabitForm';
import { Plus, Target } from 'lucide-react';
import toast from 'react-hot-toast';

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

export const HabitsPage: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      setIsLoading(true);
      const response = await habitsAPI.getHabits({ active: true });
      setHabits(response.data.habits);
    } catch (error) {
      toast.error('Failed to fetch habits');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateHabit = async (habitData: Omit<Habit, '_id' | 'completions' | 'stats'>) => {
    try {
      await habitsAPI.createHabit(habitData);
      toast.success('Habit created successfully');
      setShowForm(false);
      fetchHabits();
    } catch (error) {
      toast.error('Failed to create habit');
    }
  };

  const handleUpdateHabit = async (habitId: string, habitData: Partial<Habit>) => {
    try {
      await habitsAPI.updateHabit(habitId, habitData);
      toast.success('Habit updated successfully');
      setEditingHabit(null);
      fetchHabits();
    } catch (error) {
      toast.error('Failed to update habit');
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await habitsAPI.deleteHabit(habitId);
      toast.success('Habit deleted successfully');
      fetchHabits();
    } catch (error) {
      toast.error('Failed to delete habit');
    }
  };

  const handleToggleCompletion = async (habitId: string, date: string, completed: boolean) => {
    try {
      if (completed) {
        await habitsAPI.completeHabit(habitId, date);
      } else {
        await habitsAPI.incompleteHabit(habitId, date);
      }
      fetchHabits();
    } catch (error) {
      toast.error('Failed to update habit');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Habits
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Habit</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" />
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No habits found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating your first habit.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {habits.map(habit => (
            <HabitCard
              key={habit._id}
              habit={habit}
              onToggleCompletion={handleToggleCompletion}
              onEdit={setEditingHabit}
              onDelete={handleDeleteHabit}
            />
          ))}
        </div>
      )}

      {/* Habit Form Modal */}
      {(showForm || editingHabit) && (
        <HabitForm
          habit={editingHabit}
          onSave={editingHabit ? 
            (habitData) => handleUpdateHabit(editingHabit._id, habitData) : 
            handleCreateHabit
          }
          onCancel={() => {
            setShowForm(false);
            setEditingHabit(null);
          }}
        />
      )}
    </div>
  );
};