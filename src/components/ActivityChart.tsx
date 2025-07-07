import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ActivityChartProps {
  data: {
    taskCompletions: Array<{ _id: string; count: number }>;
    focusSessions: Array<{ _id: string; count: number; totalTime: number }>;
    habitCompletions: Array<{ _id: string; count: number }>;
  };
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  // Create a combined dataset for the last 7 days
  const today = new Date();
  const chartData = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const taskData = data.taskCompletions.find(item => item._id === dateStr);
    const focusData = data.focusSessions.find(item => item._id === dateStr);
    const habitData = data.habitCompletions.find(item => item._id === dateStr);
    
    chartData.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      tasks: taskData?.count || 0,
      focus: focusData?.count || 0,
      habits: habitData?.count || 0
    });
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis 
          dataKey="date" 
          className="text-gray-600 dark:text-gray-400"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          className="text-gray-600 dark:text-gray-400"
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'var(--toast-bg)',
            border: '1px solid var(--toast-border)',
            borderRadius: '8px',
            color: 'var(--toast-color)'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="tasks" 
          stroke="#3B82F6" 
          strokeWidth={2}
          name="Tasks Completed"
          dot={{ fill: '#3B82F6', strokeWidth: 2 }}
        />
        <Line 
          type="monotone" 
          dataKey="focus" 
          stroke="#8B5CF6" 
          strokeWidth={2}
          name="Focus Sessions"
          dot={{ fill: '#8B5CF6', strokeWidth: 2 }}
        />
        <Line 
          type="monotone" 
          dataKey="habits" 
          stroke="#10B981" 
          strokeWidth={2}
          name="Habits Completed"
          dot={{ fill: '#10B981', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};