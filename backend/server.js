const http = require('http');
const app = require('./app');
const logger = require('./config/logger');

// Define the port
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Start listening
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}...`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
  logger.error('UNHANDLED REJECTION! Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});
