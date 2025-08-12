import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Sun, 
  Moon, 
  LogOut, 
  User,
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  Clock, 
  StickyNote
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/habits', icon: Target, label: 'Habits' },
  { path: '/focus', icon: Clock, label: 'Focus' },
  { path: '/notes', icon: StickyNote, label: 'Notes' },
];

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo (desktop) or Welcome message (mobile) */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            {/* Desktop Logo */}
            <div className="hidden lg:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ✨ Productivity OS
              </h1>
            </div>
            
            {/* Mobile Welcome Message */}
            <div className="lg:hidden">
              <h2 className="text-sm sm:text-lg font-semibold text-gray-800 dark:text-white truncate">
                Welcome back, {user?.name}!
              </h2>
            </div>
          </div>
          
          {/* Center - Navigation (desktop only) */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </NavLink>
            ))}
          </div>
          
          {/* Right side - User controls */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-shrink-0">
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
              </div>
              <span className="text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-20 lg:max-w-none">
                {user?.name}
              </span>
            </div>
            
            <button
              onClick={logout}
              className="p-1.5 sm:p-2 rounded-lg bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-300" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};