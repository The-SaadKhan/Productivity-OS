import React from 'react';
import { format, isToday, isPast } from 'date-fns';
import { Calendar, Clock, Edit2, Trash2, AlertCircle } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  dueDate: string;
  category?: string;
  tags?: string[];
}

interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete
}) => {
  const dueDate = new Date(task.dueDate);
  const isOverdue = isPast(dueDate) && !task.completed;
  const isDueToday = isToday(dueDate);

  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  };

  const borderColors = {
    low: 'border-green-200 dark:border-green-800',
    medium: 'border-yellow-200 dark:border-yellow-800',
    high: 'border-red-200 dark:border-red-800'
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm border-l-4 ${borderColors[task.priority]} ${
      task.completed ? 'opacity-60' : ''
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2 sm:space-x-3">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={(e) => onToggleComplete(task._id, e.target.checked)}
            className="mt-0.5 sm:mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="flex-1 min-w-0">
            <h3 className={`text-base sm:text-lg font-medium ${
              task.completed 
                ? 'text-gray-500 dark:text-gray-400 line-through' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {task.description}
              </p>
            )}
            
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{format(dueDate, 'MMM d, yyyy')}</span>
                {isOverdue && (
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                )}
              </div>
              
              {task.category && (
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                  {task.category}
                </span>
              )}
            </div>
            
            {task.tags && task.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {task.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
          <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(task)}
              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            
            <button
              onClick={() => onDelete(task._id)}
              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};