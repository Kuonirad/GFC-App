const AppError = require('../errors/AppError');
const logger = require('../config/logger');

const sendErrorDev = (err, res) => {
  logger.error('ERROR 💥', err);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    logger.error('Operational ERROR 💥', err);
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    logger.error('UNEXPECTED ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 'CAST_ERROR', 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.keyValue ? JSON.stringify(err.keyValue) : 'Duplicate field';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 'DUPLICATE_FIELD', 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 'VALIDATION_ERROR', 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 'JWT_ERROR', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 'JWT_EXPIRED', 401);

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    switch (error.name) {
      case 'CastError':
        error = handleCastErrorDB(error);
        break;
      case 'MongoServerSelectionError':
        error = new AppError('Database connection failed.', 'DB_CONNECTION_ERROR', 500);
        break;
      case 'ValidationError':
        error = handleValidationErrorDB(error);
        break;
      case 'JsonWebTokenError':
        error = handleJWTError();
        break;
      case 'TokenExpiredError':
        error = handleJWTExpiredError();
        break;
    }

    sendErrorProd(error, res);
  }
};

module.exports = globalErrorHandler;
