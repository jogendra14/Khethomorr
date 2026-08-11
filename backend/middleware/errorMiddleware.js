import AppError from '../utils/AppError.js';

/**
 * Global Error Handler Middleware
 * Catches all errors and sends appropriate response
 */

// Handle mongoose validation errors
const handleValidationError = (err) => {
  console.error(err.stack)
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Handle mongoose duplicate key errors
const handleDuplicateKeyError = (err) => {
  console.error(err.stack)
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate value for field '${field}': '${value}'. Please use another value.`;
  return new AppError(message, 400);
};

// Handle mongoose cast errors (invalid IDs)
const handleCastError = (err) => {
  console.error(err.stack)
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// Handle JWT errors
const handleJWTError = () => {
  console.error(err.stack)
  return new AppError('Invalid token. Please log in again.', 401);
};

const handleJWTExpiredError = () => {
  console.error(err.stack)
  return new AppError('Your token has expired. Please log in again.', 401);
};

// Handle multer/file upload errors
const handleMulterError = (err) => {
  console.error(err.stack)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File too large. Maximum size is 5MB.', 400);
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return new AppError('Too many files. Maximum is 5 files.', 400);
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Unexpected file field.', 400);
  }
  return new AppError(err.message, 400);
};

// Send error response in development
const sendErrorDev = (err, req, res) => {
  console.error(err.stack)
  // API response
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      success: false,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // Rendered website response
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

// Send error response in production
const sendErrorProd = (err, req, res) => {
  console.error(err.stack)
  // API response
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    }

    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong!',
    });
  }

  // Rendered website response
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }

  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

// Main error handler
const errorHandler = (err, req, res, next) => {
  console.error(err.stack)
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, message: err.message, name: err.name };

    // Mongoose validation error
    if (error.name === 'ValidationError') error = handleValidationError(error);

    // Mongoose duplicate key error
    if (error.code === 11000) error = handleDuplicateKeyError(error);

    // Mongoose cast error
    if (error.name === 'CastError') error = handleCastError(error);

    // JWT errors
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    // Multer errors
    if (error.name === 'MulterError') error = handleMulterError(error);

    sendErrorProd(error, req, res);
  }
};

export default errorHandler;