const { errorResponse } = require('../utils/response');
const AppError = require('../utils/AppError');

/**
 * Centralized Express Error Handling Middleware.
 * Catches all errors thrown in routes, sanitizes payload outputs, and formats JSON standard responses.
 */
const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong.';
  let errors = err.errors || [];

  // 1. Handle Zod Validation Errors
  if (err.name === 'ZodError' || err.constructor.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation failed.';
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message
    }));
  }
  // 2. Handle Custom AppError (Expected/Operational exceptions)
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }
  // 3. Handle General Unexpected Errors (e.g. database disconnects, code bugs)
  else {
    // In production, mask internal details completely to avoid intelligence gathering or system footprint leaks
    if (process.env.NODE_ENV === 'production') {
      statusCode = 500;
      message = 'Internal Server Error';
      errors = [];
    } else {
      // In development, preserve original error message and attach the stack trace safely
      statusCode = err.statusCode || 500;
      message = err.message || 'Internal Server Error';
      errors = err.stack ? [err.stack.split('\n')[0], ...err.stack.split('\n').slice(1, 4)] : ['No stack trace available.'];
    }
  }

  // Standard server console logging for server maintainers (excluding raw secrets or cookie dumps)
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Express Error Handler] ${req.method} ${req.originalUrl} - Status: ${statusCode} - Msg: ${message}`);
    if (statusCode === 500 && err.stack) {
      console.error(err.stack);
    }
  }

  return errorResponse(res, message, errors, statusCode);
};

module.exports = errorMiddleware;
