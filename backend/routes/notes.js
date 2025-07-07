import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Note from '../models/Note.js';

const router = express.Router();

// Get all notes for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, tag, page = 1, limit = 20 } = req.query;
    
    let query = { user: req.user._id };
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by tag
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    const notes = await Note.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const totalNotes = await Note.countDocuments(query);
    
    res.json({
      notes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalNotes,
        pages: Math.ceil(totalNotes / limit)
      }
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific note
router.get('/:id', authenticate, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    res.json(note);
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new note
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, content, tags, isPinned, color } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    const note = new Note({
      user: req.user._id,
      title,
      content,
      tags: tags || [],
      isPinned: isPinned || false,
      color: color || '#FFFFFF'
    });
    
    await note.save();
    
    res.status(201).json({
      message: 'Note created successfully',
      note
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a note
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, content, tags, isPinned, color } = req.body;
    
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Update note fields
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (isPinned !== undefined) note.isPinned = isPinned;
    if (color !== undefined) note.color = color;
    
    await note.save();
    
    res.json({
      message: 'Note updated successfully',
      note
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a note
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    await Note.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all unique tags for the user
router.get('/tags/all', authenticate, async (req, res) => {
  try {
    const tags = await Note.distinct('tags', { user: req.user._id });
    res.json({ tags });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;