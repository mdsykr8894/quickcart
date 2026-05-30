const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/response');

/**
 * Rate limiter for Authentication (Login) endpoint to prevent brute-force attacks.
 * Limit: 5 attempts per 15 minutes per IP address.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true, // Return rate limit info in standard response headers
  legacyHeaders: false, // Disable legacy headers
  handler: (req, res) => {
    return errorResponse(
      res,
      'Too many login attempts. Please try again after 15 minutes.',
      [],
      429
    );
  }
});

/**
 * Rate limiter for Registration endpoint to prevent bot spam.
 * Limit: 5 attempts per hour per IP address.
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(
      res,
      'Too many registration attempts. Please try again after an hour.',
      [],
      429
    );
  }
});

module.exports = {
  loginLimiter,
  registerLimiter
};
