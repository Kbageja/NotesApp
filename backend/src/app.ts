import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/database';
import authRoutes from './routes/authRoutes';
import noteRoutes from './routes/noteRoutes';
import { sendErrorResponse } from './utils/response';

// Load environment variables
dotenv.config();

const app: Application = express();

// Connect to database
connectDB();



// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173/',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  sendErrorResponse(res, 404, `Route ${req.originalUrl} not found`);
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global Error Handler:', err);
  
  // MongoDB duplicate key error
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    sendErrorResponse(res, 400, 'Duplicate field value entered');
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendErrorResponse(res, 401, 'Invalid token');
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendErrorResponse(res, 401, 'Token expired');
    return;
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values((err as any).errors).map((error: any) => ({
      field: error.path,
      message: error.message
    }));
    sendErrorResponse(res, 400, 'Validation error', errors);
    return;
  }

  sendErrorResponse(res, 500, 'Internal server error');
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app;