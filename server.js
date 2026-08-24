import 'dotenv/config'; // Must be at the very top so environment variables load before other imports
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';

import connectDB from './config/db.js';
import songRoutes from './routes/songRoutes.js';
import authRoutes from './routes/authRoutes.js';
import supportRoutes from './routes/supportRoutes.js';

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Trust proxy for Render/Vercel to get real client IP
app.set('trust proxy', 1);

// IP Logger Middleware - Print every incoming request with real IP
app.use((req, res, next) => {
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || req.ip;
  const timestamp = new Date().toLocaleTimeString('vi-VN');
  console.log(`[${timestamp}] 🌐 IP: ${clientIp} -> ${req.method} ${req.originalUrl}`);
  next();
});

// Standard middlewares - CORS first
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security Headers with Helmet configured for Web Audio & Cross-Origin media
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

// Global Rate Limiter: 1000 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu từ địa chỉ IP của bạn. Vui lòng thử lại sau 15 phút.',
  },
});
app.use('/api', globalLimiter);

// Auth Rate Limiter: 60 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu xác thực. Vui lòng thử lại sau 15 phút để bảo vệ tài khoản.',
  },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/send-otp', authLimiter);

// Serve static uploads folder with CORS headers enabled for Web Audio API
app.use(
  '/uploads',
  express.static(path.resolve('uploads'), {
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  })
);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/support', supportRoutes);

// Root route - Welcome / API Index
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Music Web App Backend API 🎵',
    endpoints: {
      health: '/api/health',
      songs: '/api/songs',
      songById: '/api/songs/:id (GET)',
      createSong: '/api/songs (POST - multipart/form-data)',
      staticUploads: '/uploads/:filename',
    },
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Music API server is running smoothly' });
});

// 404 Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[Global Error]:', err.stack || err.message);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected server error occurred',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});
