import mongoose from 'mongoose';

const focusSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  duration: {
    type: Number,
    required: true, // in minutes
    min: [1, 'Duration must be at least 1 minute'],
    max: [180, 'Duration cannot exceed 180 minutes']
  },
  type: {
    type: String,
    enum: ['focus', 'break'],
    default: 'focus'
  },
  completed: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }
}, {
  timestamps: true
});

// Index for better query performance
focusSessionSchema.index({ user: 1, startTime: 1 });
focusSessionSchema.index({ user: 1, completed: 1 });
focusSessionSchema.index({ user: 1, type: 1 });

// Calculate end time when session is completed
focusSessionSchema.pre('save', function(next) {
  if (this.isModified('completed') && this.completed && !this.endTime) {
    this.endTime = new Date();
  }
  next();
});

export default mongoose.model('FocusSession', focusSessionSchema);