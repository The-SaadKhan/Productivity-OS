import React, { useState, useEffect } from 'react';
import { tasksAPI } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { TaskCard } from '../components/TaskCard';
import { TaskForm } from '../components/TaskForm';
import { Plus, Filter, Calendar, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Task {
  _id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  dueDate: string;
  category?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'today' | 'overdue' | 'completed' | 'pending'>('all');

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const params = filter !== 'all' ? { filter } : {};
      const response = await tasksAPI.getTasks(params);
      setTasks(response.data.tasks);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (taskData: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await tasksAPI.createTask(taskData);
      toast.success('Task created successfully');
      setShowForm(false);
      fetchTasks();
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId: string, taskData: Partial<Task>) => {
    try {
      await tasksAPI.updateTask(taskId, taskData);
      toast.success('Task updated successfully');
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await tasksAPI.deleteTask(taskId);
      toast.success('Task deleted successfully');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      await tasksAPI.updateTask(taskId, { completed });
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Tasks', icon: null },
    { value: 'today', label: 'Today', icon: Calendar },
    { value: 'overdue', label: 'Overdue', icon: AlertCircle },
    { value: 'pending', label: 'Pending', icon: Clock },
    { value: 'completed', label: 'Completed', icon: null }
  ];

  const getTaskCounts = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
      all: tasks.length,
      today: tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate >= today && dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      }).length,
      overdue: tasks.filter(task => new Date(task.dueDate) < today && !task.completed).length,
      pending: tasks.filter(task => !task.completed).length,
      completed: tasks.filter(task => task.completed).length
    };
  };

  const taskCounts = getTaskCounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Tasks
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Task</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1 sm:gap-2">
        {filterOptions.map(option => {
          const Icon = option.icon;
          const count = taskCounts[option.value as keyof typeof taskCounts];
          
          return (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as any)}
              className={`inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                filter === option.value
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {Icon && <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
              <span className="hidden sm:inline">{option.label}</span>
              <span className="sm:hidden">{option.label.split(' ')[0]}</span>
              <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tasks List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No tasks found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating a new task.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}

      {/* Task Form Modal */}
      {(showForm || editingTask) && (
        <TaskForm
          task={editingTask}
          onSave={editingTask ? 
            (taskData) => handleUpdateTask(editingTask._id, taskData) : 
            handleCreateTask
          }
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};