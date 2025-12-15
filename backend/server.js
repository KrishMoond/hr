const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

// Import security middleware (with fallbacks)
let generalLimiter, sanitizeError, requestLogger, logger;
try {
  ({ generalLimiter, sanitizeError } = require('./middleware/security'));
  ({ requestLogger, logger } = require('./middleware/logging'));
} catch (error) {
  console.log('Middleware not found, using fallbacks');
  generalLimiter = (req, res, next) => next();
  sanitizeError = (err, req, res, next) => res.status(500).json({ error: 'Server error' });
  requestLogger = (req, res, next) => next();
  logger = { info: console.log, error: console.error, warn: console.warn };
}

const app = express();
const server = createServer(app);
// Build allowed frontend origins from environment.
// FRONTEND_URLS can be a comma-separated list (e.g. "http://localhost:5173,https://app.example.com").
const frontendOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || process.env.DEFAULT_FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  }
});

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const chatRoutes = require('./routes/chat');
const messageRoutes = require('./routes/messages');
const wellnessRoutes = require('./routes/wellness');
const helpdeskRoutes = require('./routes/helpdesk');
const analyticsRoutes = require('./routes/analytics');
const settingsRoutes = require('./routes/settings');
const aiRoutes = require('./routes/ai');
const chanakyaRoutes = require('./routes/chanakya');
const leaveRoutes = require('./routes/leaves');
const complaintRoutes = require('./routes/complaints');
const payrollRoutes = require('./routes/payroll');
const attendanceRoutes = require('./routes/attendance');
const recruitmentRoutes = require('./routes/recruitment');
const projectRoutes = require('./routes/projects');
const projectChatRoutes = require('./routes/projectChat');
const taskRoutes = require('./routes/tasks');

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(compression());
app.use(requestLogger);

// Rate limiting
app.use('/api/', generalLimiter);

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Enhanced database connection with security options
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
.then(() => {
  logger.info('MongoDB connected successfully');
})
.catch(err => {
  logger.error('MongoDB connection error', { error: err.message });
  process.exit(1);
});

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  logger.error('MongoDB error', { error: err.message });
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

// Socket.IO for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user-specific room for private messages
  socket.on('join-user', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Join project room for project chat
  socket.on('join-project', (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(`User joined project room: project-${projectId}`);
  });

  socket.on('leave-project', (projectId) => {
    socket.leave(`project-${projectId}`);
    console.log(`User left project room: project-${projectId}`);
  });

  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
  });

  socket.on('send-message', (data) => {
    io.to(data.chatId).emit('new-message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// API versioning
const API_VERSION = '/api/v1';

// Routes with versioning
app.use(`${API_VERSION}/auth`, authRoutes);
app.use('/api/auth', authRoutes); // Backward compatibility
// Versioned routes
app.use(`${API_VERSION}/employees`, employeeRoutes);
app.use(`${API_VERSION}/chat`, chatRoutes);
app.use(`${API_VERSION}/messages`, messageRoutes);
app.use(`${API_VERSION}/wellness`, wellnessRoutes);
app.use(`${API_VERSION}/helpdesk`, helpdeskRoutes);
app.use(`${API_VERSION}/analytics`, analyticsRoutes);
app.use(`${API_VERSION}/settings`, settingsRoutes);
app.use(`${API_VERSION}/ai`, aiRoutes);
app.use(`${API_VERSION}/ai`, chanakyaRoutes);
app.use(`${API_VERSION}/leaves`, leaveRoutes);
app.use(`${API_VERSION}/complaints`, complaintRoutes);
app.use(`${API_VERSION}/payroll`, payrollRoutes);
app.use(`${API_VERSION}/attendance`, attendanceRoutes);
app.use(`${API_VERSION}/recruitment`, recruitmentRoutes);
app.use(`${API_VERSION}/projects`, projectRoutes);
app.use(`${API_VERSION}/project-chat`, projectChatRoutes);
app.use(`${API_VERSION}/tasks`, taskRoutes);

// Backward compatibility routes
app.use('/api/employees', employeeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/helpdesk', helpdeskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ai', chanakyaRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/project-chat', projectChatRoutes);
app.use('/api/tasks', taskRoutes);

// Direct routes for production frontend compatibility
app.use('/auth', authRoutes);
app.use('/employees', employeeRoutes);
app.use('/chat', chatRoutes);
app.use('/messages', messageRoutes);
app.use('/wellness', wellnessRoutes);
app.use('/helpdesk', helpdeskRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/settings', settingsRoutes);
app.use('/ai', aiRoutes);
app.use('/leaves', leaveRoutes);
app.use('/complaints', complaintRoutes);
app.use('/payroll', payrollRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/recruitment', recruitmentRoutes);
app.use('/projects', projectRoutes);
app.use('/project-chat', projectChatRoutes);
app.use('/tasks', taskRoutes);

// Health check endpoints
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  
  res.json(healthCheck);
});

app.get('/api/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  
  res.json(healthCheck);
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'HR SARTHI API',
    version: '1.0.0',
    description: 'Intelligent Human Resource Management System API',
    endpoints: {
      auth: '/api/v1/auth',
      employees: '/api/v1/employees',
      projects: '/api/v1/projects',
      analytics: '/api/v1/analytics'
    },
    documentation: '/api/docs'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: ['/api/health', '/api/v1/auth', '/api/v1/employees']
  });
});

// Global error handling
app.use(sanitizeError);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection', { error: err.message });
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Make io available globally for routes
global.io = io;
app.set('io', io);

// Initialize MetricsUpdater
const MetricsUpdater = require('./utils/metricsUpdater');
global.metricsUpdater = new MetricsUpdater(io);

module.exports = { app, io };