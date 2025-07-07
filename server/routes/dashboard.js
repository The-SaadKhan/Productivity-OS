import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Task from '../models/Task.js';
import Habit from '../models/Habit.js';
import FocusSession from '../models/FocusSession.js';
import Note from '../models/Note.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const thisMonth = new Date(today);
    thisMonth.setMonth(thisMonth.getMonth() - 1);
    
    const [
      taskStats,
      habitStats,
      focusStats,
      noteStats
    ] = await Promise.all([
      // Task statistics
      Task.aggregate([
        { $match: { user: req.user._id } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: { $sum: { $cond: ['$completed', 1, 0] } },
            pending: { $sum: { $cond: ['$completed', 0, 1] } },
            overdue: {
              $sum: {
                $cond: [
                  { $and: [{ $lt: ['$dueDate', new Date()] }, { $eq: ['$completed', false] }] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),
      
      // Habit statistics
      Habit.aggregate([
        { $match: { user: req.user._id, isActive: true } },
        {
          $group: {
            _id: null,
            totalHabits: { $sum: 1 },
            avgCurrentStreak: { $avg: '$stats.currentStreak' },
            avgBestStreak: { $avg: '$stats.bestStreak' },
            totalCompletions: { $sum: '$stats.totalCompletions' }
          }
        }
      ]),
      
      // Focus session statistics
      FocusSession.aggregate([
        { $match: { user: req.user._id, completed: true, type: 'focus' } },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            totalTime: { $sum: '$duration' },
            avgSessionLength: { $avg: '$duration' }
          }
        }
      ]),
      
      // Note statistics
      Note.aggregate([
        { $match: { user: req.user._id } },
        {
          $group: {
            _id: null,
            totalNotes: { $sum: 1 },
            pinnedNotes: { $sum: { $cond: ['$isPinned', 1, 0] } }
          }
        }
      ])
    ]);
    
    res.json({
      tasks: taskStats[0] || { total: 0, completed: 0, pending: 0, overdue: 0 },
      habits: habitStats[0] || { totalHabits: 0, avgCurrentStreak: 0, avgBestStreak: 0, totalCompletions: 0 },
      focus: focusStats[0] || { totalSessions: 0, totalTime: 0, avgSessionLength: 0 },
      notes: noteStats[0] || { totalNotes: 0, pinnedNotes: 0 }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get productivity analytics
router.get('/analytics', authenticate, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    let startDate = new Date();
    let groupFormat;
    
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
      groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
    }
    
    const [
      taskCompletions,
      focusSessions,
      habitCompletions
    ] = await Promise.all([
      // Task completions over time
      Task.aggregate([
        {
          $match: {
            user: req.user._id,
            completed: true,
            completedAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // Focus sessions over time
      FocusSession.aggregate([
        {
          $match: {
            user: req.user._id,
            completed: true,
            type: 'focus',
            startTime: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
            count: { $sum: 1 },
            totalTime: { $sum: '$duration' }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // Habit completions over time
      Habit.aggregate([
        { $match: { user: req.user._id, isActive: true } },
        { $unwind: '$completions' },
        {
          $match: {
            'completions.completed': true,
            'completions.date': { $gte: startDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$completions.date' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);
    
    res.json({
      taskCompletions,
      focusSessions,
      habitCompletions
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;