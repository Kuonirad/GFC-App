const winston = require('winston');
const { format } = winston;

// Define log directory based on environment
const logDirectory = process.env.NODE_ENV === 'production' ? 'logs' : 'logs-dev';

// Create Winston logger instance
const logger = winston.createLogger({
  level: 'info', // Minimum log level
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }), // Include stack traces
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'gfc-app' },
  transports: [
    // Error logs
    new winston.transports.File({ filename: `${logDirectory}/error.log`, level: 'error' }),

    // Combined logs
    new winston.transports.File({ filename: `${logDirectory}/combined.log` }),
  ],
});

// If not in production, log to the console with colorized output
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    ),
  }));
}

module.exports = logger;
