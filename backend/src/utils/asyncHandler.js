/**
 * A reusable wrapper to handle promise rejections in asynchronous Express route handlers
 * and automatically forward them to the next error-handling middleware.
 * 
 * @param {Function} fn - Asynchronous Express route handler or middleware
 * @returns {Function} Express middleware handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
