const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = createServer(app);
// Build allowed frontend origins from environment.
// FRONTEND_URLS can be a comma-separated list (e.g. "http://localhost:5173,https://app.example.com").
const frontendOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: frontendOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
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

// Security middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS
app.use(cors({
  origin: frontendOrigins,
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

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

// Routes
app.use('/api/auth', authRoutes);
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
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