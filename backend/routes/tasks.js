import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

const router = express.Router();

// Get all tasks for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const { filter, sort, page = 1, limit = 50 } = req.query;
    
    let query = { user: req.user._id };
    
    // Apply filters
    if (filter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.dueDate = { $gte: today, $lt: tomorrow };
    } else if (filter === 'overdue') {
      query.dueDate = { $lt: new Date() };
      query.completed = false;
    } else if (filter === 'completed') {
      query.completed = true;
    } else if (filter === 'pending') {
      query.completed = false;
    }
    
    // Sort options
    let sortQuery = {};
    if (sort === 'priority') {
      sortQuery = { priority: -1, dueDate: 1 };
    } else if (sort === 'dueDate') {
      sortQuery = { dueDate: 1 };
    } else {
      sortQuery = { createdAt: -1 };
    }
    
    const tasks = await Task.find(query)
      .sort(sortQuery)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const totalTasks = await Task.countDocuments(query);
    
    res.json({
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalTasks,
        pages: Math.ceil(totalTasks / limit)
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific task
router.get('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new task
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, priority, dueDate, category, tags } = req.body;
    
    if (!title || !dueDate) {
      return res.status(400).json({ message: 'Title and due date are required' });
    }
    
    const task = new Task({
      user: req.user._id,
      title,
      description,
      priority,
      dueDate,
      category,
      tags
    });
    
    await task.save();
    
    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a task
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, description, priority, dueDate, category, tags, completed } = req.body;
    
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if task is being marked as completed
    const wasCompleted = task.completed;
    
    // Update task fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (category !== undefined) task.category = category;
    if (tags !== undefined) task.tags = tags;
    if (completed !== undefined) task.completed = completed;
    
    await task.save();
    
    // Update user stats if task was completed
    if (!wasCompleted && task.completed) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'stats.totalTasksCompleted': 1 }
      });
    } else if (wasCompleted && !task.completed) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'stats.totalTasksCompleted': -1 }
      });
    }
    
    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a task
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Update user stats if completed task is being deleted
    if (task.completed) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'stats.totalTasksCompleted': -1 }
      });
    }
    
    await Task.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;