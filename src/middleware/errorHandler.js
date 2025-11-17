import { AppError, formatErrorResponse } from '../utils/errors.js';

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err);

  // If error is an AppError, use its status code and format
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(formatErrorResponse(err));
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const details = {};
    Object.keys(err.errors).forEach((key) => {
      details[key] = err.errors[key].message;
    });
    return res.status(400).json(
      formatErrorResponse({
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        details,
      })
    );
  }

  // Handle Mongoose cast errors (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    return res.status(400).json(
      formatErrorResponse({
        message: 'Invalid ID format',
        code: 'INVALID_ID',
      })
    );
  }

  // Handle payload too large errors
  if (err.type === 'entity.too.large') {
    return res.status(413).json(
      formatErrorResponse({
        message: 'Request payload too large',
        code: 'PAYLOAD_TOO_LARGE',
      })
    );
  }

  // Handle rate limit errors (from express-rate-limit)
  if (err.statusCode === 429) {
    return res.status(429).json(
      formatErrorResponse({
        message: err.message || 'Too many requests, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
      })
    );
  }

  // Default to 500 server error
  return res.status(500).json(
    formatErrorResponse({
      message: 'An unexpected error occurred',
      code: 'INTERNAL_SERVER_ERROR',
    })
  );
};

export default errorHandler;

