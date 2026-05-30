/**
 * Sends a consistent success JSON response.
 * @param {object} res Express response object
 * @param {string} message Description message
 * @param {object} data Payload data
 * @param {number} statusCode HTTP status code (default: 200)
 */
const successResponse = (res, message = "Operation completed successfully.", data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Sends a consistent error JSON response.
 * @param {object} res Express response object
 * @param {string} message General error message
 * @param {array} errors Detailed error information or validation items
 * @param {number} statusCode HTTP status code (default: 500)
 */
const errorResponse = (res, message = "Something went wrong.", errors = [], statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

module.exports = {
  successResponse,
  errorResponse
};
