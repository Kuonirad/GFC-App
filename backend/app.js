require('dotenv').config();
const express = require('express');
const globalErrorHandler = require('./middlewares/errorHandler');
const AppError = require('./errors/AppError');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Example Route
app.get('/', (req, res) => {
  res.send('Welcome to GFC App!');
});

// Example Route that Throws an Operational Error
app.get('/error', (req, res, next) => {
  return next(new AppError('This is a test operational error.', 'TEST_ERROR', 400));
});

// Handle Undefined Routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 'NOT_FOUND', 404));
});

// Global Error Handling Middleware (should be the last middleware)
app.use(globalErrorHandler);

module.exports = app;
