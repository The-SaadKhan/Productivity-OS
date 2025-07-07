import mongoose from 'mongoose';

const habitCompletionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Habit name is required'],
    trim: true,
    maxlength: [100, 'Habit name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  targetFrequency: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'daily'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  completions: [habitCompletionSchema],
  stats: {
    currentStreak: {
      type: Number,
      default: 0
    },
    bestStreak: {
      type: Number,
      default: 0
    },
    totalCompletions: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
habitSchema.index({ user: 1, isActive: 1 });
habitSchema.index({ user: 1, 'completions.date': 1 });

// Calculate streaks when completions are updated
habitSchema.methods.calculateStreaks = function() {
  if (this.completions.length === 0) {
    this.stats.currentStreak = 0;
    this.stats.bestStreak = 0;
    this.stats.totalCompletions = 0;
    return;
  }

  // Sort completions by date
  const sortedCompletions = this.completions
    .filter(c => c.completed)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  this.stats.totalCompletions = sortedCompletions.length;

  if (sortedCompletions.length === 0) {
    this.stats.currentStreak = 0;
    this.stats.bestStreak = 0;
    return;
  }

  // Calculate current streak
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < sortedCompletions.length; i++) {
    const completionDate = new Date(sortedCompletions[i].date);
    completionDate.setHours(0, 0, 0, 0);
    
    if (i === 0) {
      // Check if the most recent completion is today or yesterday
      const daysDiff = Math.floor((today - completionDate) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 1) {
        currentStreak = 1;
        tempStreak = 1;
      }
    } else {
      const prevDate = new Date(sortedCompletions[i - 1].date);
      prevDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((prevDate - completionDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        tempStreak++;
        if (i === 0 || currentStreak > 0) {
          currentStreak = tempStreak;
        }
      } else {
        tempStreak = 1;
        if (i === 0) {
          currentStreak = 0;
        }
      }
    }
    
    bestStreak = Math.max(bestStreak, tempStreak);
  }

  this.stats.currentStreak = currentStreak;
  this.stats.bestStreak = bestStreak;
};

export default mongoose.model('Habit', habitSchema);