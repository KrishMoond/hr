const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom logger
class Logger {
  constructor() {
    this.logFile = process.env.LOG_FILE || 'logs/app.log';
    this.logLevel = process.env.LOG_LEVEL || 'info';
  }

  log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };

    // Console output
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, meta);

    // File output
    try {
      fs.appendFileSync(
        path.join(__dirname, '..', this.logFile),
        JSON.stringify(logEntry) + '\n'
      );
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  info(message, meta) {
    this.log('info', message, meta);
  }

  warn(message, meta) {
    this.log('warn', message, meta);
  }

  error(message, meta) {
    this.log('error', message, meta);
  }

  debug(message, meta) {
    if (this.logLevel === 'debug') {
      this.log('debug', message, meta);
    }
  }
}

const logger = new Logger();

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger.log(logLevel, 'Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user?.id
    });
  });

  next();
};

// Security event logger
const securityLogger = {
  loginAttempt: (email, success, ip, userAgent) => {
    logger.info('Login attempt', {
      email,
      success,
      ip,
      userAgent,
      type: 'security'
    });
  },

  loginFailure: (email, reason, ip, userAgent) => {
    logger.warn('Login failure', {
      email,
      reason,
      ip,
      userAgent,
      type: 'security'
    });
  },

  rateLimitExceeded: (ip, endpoint, userAgent) => {
    logger.warn('Rate limit exceeded', {
      ip,
      endpoint,
      userAgent,
      type: 'security'
    });
  },

  unauthorizedAccess: (userId, resource, ip) => {
    logger.warn('Unauthorized access attempt', {
      userId,
      resource,
      ip,
      type: 'security'
    });
  }
};

module.exports = {
  logger,
  requestLogger,
  securityLogger
};