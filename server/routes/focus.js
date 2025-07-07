import express from 'express';
import { authenticate } from '../middleware/auth.js';
import FocusSession from '../models/FocusSession.js';
import User from '../models/User.js';

const router = express.Router();

// Get all focus sessions for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const { type, completed, page = 1, limit = 50 } = req.query;
    
    let query = { user: req.user._id };
    
    if (type) query.type = type;
    if (completed !== undefined) query.completed = completed === 'true';
    
    const sessions = await FocusSession.find(query)
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('task', 'title');
    
    const totalSessions = await FocusSession.countDocuments(query);
    
    res.json({
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalSessions,
        pages: Math.ceil(totalSessions / limit)
      }
    });
  } catch (error) {
    console.error('Get focus sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get focus session statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const thisMonth = new Date(today);
    thisMonth.setMonth(thisMonth.getMonth() - 1);
    
    const [
      todayStats,
      weekStats,
      monthStats,
      totalStats
    ] = await Promise.all([
      FocusSession.aggregate([
        {
          $match: {
            user: req.user._id,
            startTime: { $gte: today },
            completed: true,
            type: 'focus'
          }
        },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            totalTime: { $sum: '$duration' }
          }
        }
      ]),
      FocusSession.aggregate([
        {
          $match: {
            user: req.user._id,
            startTime: { $gte: thisWeek },
            completed: true,
            type: 'focus'
          }
        },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            totalTime: { $sum: '$duration' }
          }
        }
      ]),
      FocusSession.aggregate([
        {
          $match: {
            user: req.user._id,
            startTime: { $gte: thisMonth },
            completed: true,
            type: 'focus'
          }
        },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            totalTime: { $sum: '$duration' }
          }
        }
      ]),
      FocusSession.aggregate([
        {
          $match: {
            user: req.user._id,
            completed: true,
            type: 'focus'
          }
        },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            totalTime: { $sum: '$duration' }
          }
        }
      ])
    ]);
    
    res.json({
      today: todayStats[0] || { totalSessions: 0, totalTime: 0 },
      week: weekStats[0] || { totalSessions: 0, totalTime: 0 },
      month: monthStats[0] || { totalSessions: 0, totalTime: 0 },
      total: totalStats[0] || { totalSessions: 0, totalTime: 0 }
    });
  } catch (error) {
    console.error('Get focus stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new focus session
router.post('/', authenticate, async (req, res) => {
  try {
    const { duration, type, task, notes } = req.body;
    
    if (!duration) {
      return res.status(400).json({ message: 'Duration is required' });
    }
    
    const session = new FocusSession({
      user: req.user._id,
      duration,
      type: type || 'focus',
      task,
      notes,
      startTime: new Date()
    });
    
    await session.save();
    
    res.status(201).json({
      message: 'Focus session created successfully',
      session
    });
  } catch (error) {
    console.error('Create focus session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete a focus session
router.put('/:id/complete', authenticate, async (req, res) => {
  try {
    const { notes } = req.body;
    
    const session = await FocusSession.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!session) {
      return res.status(404).json({ message: 'Focus session not found' });
    }
    
    if (session.completed) {
      return res.status(400).json({ message: 'Session already completed' });
    }
    
    session.completed = true;
    session.endTime = new Date();
    if (notes) session.notes = notes;
    
    await session.save();
    
    // Update user stats if it's a focus session
    if (session.type === 'focus') {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: {
          'stats.totalFocusSessions': 1,
          'stats.totalFocusTime': session.duration
        }
      });
    }
    
    res.json({
      message: 'Focus session completed successfully',
      session
    });
  } catch (error) {
    console.error('Complete focus session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a focus session
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { duration, type, task, notes, completed } = req.body;
    
    const session = await FocusSession.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!session) {
      return res.status(404).json({ message: 'Focus session not found' });
    }
    
    // Update session fields
    if (duration !== undefined) session.duration = duration;
    if (type !== undefined) session.type = type;
    if (task !== undefined) session.task = task;
    if (notes !== undefined) session.notes = notes;
    if (completed !== undefined) session.completed = completed;
    
    await session.save();
    
    res.json({
      message: 'Focus session updated successfully',
      session
    });
  } catch (error) {
    console.error('Update focus session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a focus session
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const session = await FocusSession.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!session) {
      return res.status(404).json({ message: 'Focus session not found' });
    }
    
    // Update user stats if it was a completed focus session
    if (session.completed && session.type === 'focus') {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: {
          'stats.totalFocusSessions': -1,
          'stats.totalFocusTime': -session.duration
        }
      });
    }
    
    await FocusSession.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Focus session deleted successfully' });
  } catch (error) {
    console.error('Delete focus session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;