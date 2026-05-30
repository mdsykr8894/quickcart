const AppError = require('../utils/AppError');

/**
 * Fallback middleware for capturing requests to unhandled API endpoints and throwing a 404 AppError.
 */
const notFoundMiddleware = (req, res, next) => {
  next(new AppError('Route not found.', 404));
};

module.exports = notFoundMiddleware;
