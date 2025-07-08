import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { focusAPI } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { FocusTimer } from '../components/FocusTimer';
import { FocusStats } from '../components/FocusStats';
import { FocusHistory } from '../components/FocusHistory';
import { Play, Pause, RotateCcw, Coffee, Clock, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

interface FocusSession {
  _id: string;
  duration: number;
  type: 'focus' | 'break';
  completed: boolean;
  startTime: string;
  endTime?: string;
  notes?: string;
}

export const FocusPage: React.FC = () => {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Custom duration settings
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const fetchStats = async () => {
    try {
      const response = await focusAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch focus stats:', error);
    }
  };

  const getCurrentDuration = () => {
    return sessionType === 'focus' ? focusDuration : breakDuration;
  };

  const startSession = async () => {
    try {
      setIsLoading(true);
      const duration = getCurrentDuration();
      
      const response = await focusAPI.createSession({
        duration,
        type: sessionType
      });
      
      setActiveSession(response.data.session);
      setTimeLeft(duration * 60);
      setIsRunning(true);
      
      toast.success(`${sessionType} session started!`);
    } catch (error) {
      toast.error('Failed to start session');
    } finally {
      setIsLoading(false);
    }
  };

  const pauseSession = () => {
    setIsRunning(false);
    toast.success('Session paused');
  };

  const resumeSession = () => {
    setIsRunning(true);
    toast.success('Session resumed');
  };

  const resetSession = () => {
    if (activeSession) {
      setActiveSession(null);
      setIsRunning(false);
      setTimeLeft(0);
      toast.success('Session reset');
    }
  };

  const handleSessionComplete = async () => {
    if (!activeSession) return;
    
    try {
      await focusAPI.completeSession(activeSession._id);
      setIsRunning(false);
      setActiveSession(null);
      setTimeLeft(0);
      
      // Show completion notification
      if (sessionType === 'focus') {
        toast.success('Focus session completed! Great job!');
        setSessionType('break');
      } else {
        toast.success('Break completed! Ready for the next session?');
        setSessionType('focus');
      }
      
      fetchStats();
    } catch (error) {
      toast.error('Failed to complete session');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Focus Timer
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
          Stay focused and productive with customizable timer sessions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Timer Section */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-8 shadow-sm text-center">
            {/* Session Type Toggle */}
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
                <button
                  onClick={() => setSessionType('focus')}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    sessionType === 'focus'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                  disabled={isRunning}
                >
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                  Focus ({focusDuration} min)
                </button>
                <button
                  onClick={() => setSessionType('break')}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    sessionType === 'break'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                  disabled={isRunning}
                >
                  <Coffee className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                  Break ({breakDuration} min)
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                  disabled={isRunning}
                >
                  <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Duration Settings */}
              {showSettings && !isRunning && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 mb-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Timer Settings
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Focus Duration (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="180"
                        value={focusDuration}
                        onChange={(e) => setFocusDuration(parseInt(e.target.value) || 25)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Break Duration (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={breakDuration}
                        onChange={(e) => setBreakDuration(parseInt(e.target.value) || 5)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-center">
                    <button
                      onClick={() => setShowSettings(false)}
                      className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs sm:text-sm"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              )}
            </div>

            <FocusTimer
              timeLeft={timeLeft}
              totalTime={getCurrentDuration() * 60}
              isRunning={isRunning}
              sessionType={sessionType}
            />

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              {!activeSession ? (
                <button
                  onClick={startSession}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border border-transparent text-sm sm:text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <LoadingSpinner size="small" className="mr-2 text-white" />
                  ) : (
                    <Play className="w-4 h-4 sm:w-6 sm:h-6 mr-2" />
                  )}
                  <span className="hidden sm:inline">Start {sessionType} ({getCurrentDuration()} min)</span>
                  <span className="sm:hidden">Start ({getCurrentDuration()}m)</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={isRunning ? pauseSession : resumeSession}
                    className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Resume
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={resetSession}
                    className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-sm sm:text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Reset
                  </button>
                </>
              )}
            </div>

            {/* Quick Duration Presets */}
            {!isRunning && !activeSession && (
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Quick Presets:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {sessionType === 'focus' ? (
                    <>
                      <button
                        onClick={() => setFocusDuration(15)}
                        className="px-2 sm:px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                      >
                        15 min
                      </button>
                      <button
                        onClick={() => setFocusDuration(25)}
                        className="px-2 sm:px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                      >
                        25 min
                      </button>
                      <button
                        onClick={() => setFocusDuration(45)}
                        className="px-2 sm:px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                      >
                        45 min
                      </button>
                      <button
                        onClick={() => setFocusDuration(60)}
                        className="px-2 sm:px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                      >
                        60 min
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setBreakDuration(5)}
                        className="px-2 sm:px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                      >
                        5 min
                      </button>
                      <button
                        onClick={() => setBreakDuration(10)}
                        className="px-2 sm:px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                      >
                        10 min
                      </button>
                      <button
                        onClick={() => setBreakDuration(15)}
                        className="px-2 sm:px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                      >
                        15 min
                      </button>
                      <button
                        onClick={() => setBreakDuration(30)}
                        className="px-2 sm:px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                      >
                        30 min
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="space-y-6">
          {stats && <FocusStats stats={stats} />}
        </div>
      </div>

      {/* History Section */}
      <FocusHistory />
    </div>
  );
};