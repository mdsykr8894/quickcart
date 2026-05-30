/**
 * Custom Error Class representing standard application-level (operational) exceptions.
 */
class AppError extends Error {
  /**
   * @param {string} message General error message description
   * @param {number} statusCode HTTP status code (e.g. 400, 401, 403, 404)
   * @param {array} errors Detailed error information (e.g. validation field arrays)
   * @param {boolean} isOperational Indicates if this is a known, expected operational error (default: true)
   */
  constructor(message, statusCode = 500, errors = [], isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;

    // Capture the stack trace, keeping the constructor out of it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
