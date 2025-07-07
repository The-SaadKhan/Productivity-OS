import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import routes from backend/routes/
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import habitRoutes from './routes/habits.js';
import focusRoutes from './routes/focus.js';
import noteRoutes from './routes/notes.js';
import dashboardRoutes from './routes/dashboard.js';

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Secure headers middleware
app.use(helmet());

// ✅ CORS: allow frontend dev and prod
const allowedOrigins = [
  'http://localhost:5173',
  'https://productivity-os.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean); // removes undefined

app.use(
  3({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  })
);

// ✅ Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// ✅ Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// ✅ API Routes (all under /api/)
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ✅ Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date() });
});

// ✅ 404 fallback
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ✅ Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

// ✅ Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
