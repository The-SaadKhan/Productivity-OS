import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Habit from '../models/Habit.js';

const router = express.Router();

// Get all habits for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const { active } = req.query;
    
    let query = { user: req.user._id };
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    const habits = await Habit.find(query).sort({ createdAt: -1 });
    
    res.json({ habits });
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific habit
router.get('/:id', authenticate, async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    res.json(habit);
  } catch (error) {
    console.error('Get habit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new habit
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, color, targetFrequency } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Habit name is required' });
    }
    
    const habit = new Habit({
      user: req.user._id,
      name,
      description,
      color,
      targetFrequency
    });
    
    await habit.save();
    
    res.status(201).json({
      message: 'Habit created successfully',
      habit
    });
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a habit
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, description, color, targetFrequency, isActive } = req.body;
    
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    // Update habit fields
    if (name !== undefined) habit.name = name;
    if (description !== undefined) habit.description = description;
    if (color !== undefined) habit.color = color;
    if (targetFrequency !== undefined) habit.targetFrequency = targetFrequency;
    if (isActive !== undefined) habit.isActive = isActive;
    
    await habit.save();
    
    res.json({
      message: 'Habit updated successfully',
      habit
    });
  } catch (error) {
    console.error('Update habit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark habit as completed for a specific date
router.post('/:id/complete', authenticate, async (req, res) => {
  try {
    const { date } = req.body;
    
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    const completionDate = new Date(date || Date.now());
    completionDate.setHours(0, 0, 0, 0);
    
    // Check if already completed for this date
    const existingCompletion = habit.completions.find(
      c => c.date.getTime() === completionDate.getTime()
    );
    
    if (existingCompletion) {
      existingCompletion.completed = true;
    } else {
      habit.completions.push({
        date: completionDate,
        completed: true
      });
    }
    
    // Recalculate streaks
    habit.calculateStreaks();
    
    await habit.save();
    
    res.json({
      message: 'Habit marked as completed',
      habit
    });
  } catch (error) {
    console.error('Complete habit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark habit as incomplete for a specific date
router.post('/:id/incomplete', authenticate, async (req, res) => {
  try {
    const { date } = req.body;
    
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    const completionDate = new Date(date || Date.now());
    completionDate.setHours(0, 0, 0, 0);
    
    // Find and update the completion
    const existingCompletion = habit.completions.find(
      c => c.date.getTime() === completionDate.getTime()
    );
    
    if (existingCompletion) {
      existingCompletion.completed = false;
    } else {
      habit.completions.push({
        date: completionDate,
        completed: false
      });
    }
    
    // Recalculate streaks
    habit.calculateStreaks();
    
    await habit.save();
    
    res.json({
      message: 'Habit marked as incomplete',
      habit
    });
  } catch (error) {
    console.error('Incomplete habit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a habit
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    await Habit.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;