import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import errorHandler from './middleware/errorHandler.js';
import sanitizeInput from './middleware/sanitizeInput.js';
import requestLogger from './middleware/requestLogger.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import taskRoutes from './routes/taskRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// Security middleware (apply first)
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
    credentials: false,
  })
);

// Body parsing with explicit size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Input sanitization
app.use(sanitizeInput);

// Rate limiting (apply to API routes only)
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public auth routes
app.use('/api/auth', authRoutes);

// API Routes
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/projects/:projectId/dashboard', dashboardRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;

