import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { focusAPI } from '../services/api';
import { LoadingSpinner } from './LoadingSpinner';
import { Clock, Coffee, Play } from 'lucide-react';

interface FocusSession {
  _id: string;
  duration: number;
  type: 'focus' | 'break';
  completed: boolean;
  startTime: string;
  endTime?: string;
  notes?: string;
}

export const FocusHistory: React.FC = () => {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const response = await focusAPI.getSessions({ completed: true, limit: 10 });
      setSessions(response.data.sessions);
    } catch (error) {
      console.error('Failed to fetch focus sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'focus':
        return <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'break':
        return <Coffee className="w-4 h-4 text-green-600 dark:text-green-400" />;
      default:
        return <Play className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getSessionColor = (type: string) => {
    switch (type) {
      case 'focus':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'break':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Sessions
        </h3>
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="medium" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recent Sessions
      </h3>
      
      {sessions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No completed sessions yet. Start your first focus session!
        </p>
      ) : (
        <div className="space-y-3">
          {sessions.map(session => (
            <div
              key={session._id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getSessionIcon(session.type)}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {session.duration} min
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSessionColor(session.type)}`}>
                      {session.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(session.startTime), 'MMM d, yyyy - h:mm a')}
                  </p>
                </div>
              </div>
              
              {session.notes && (
                <div className="text-xs text-gray-600 dark:text-gray-400 max-w-32 truncate">
                  {session.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};