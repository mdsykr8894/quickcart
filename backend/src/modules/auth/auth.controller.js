const { successResponse } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const authService = require('./auth.service');
const { setAuthCookie, clearAuthCookie } = require('../../utils/cookie');

/**
 * Controller to register new shopper profiles (creates Role: USER only).
 */
const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body, req);
  return successResponse(res, 'User registered successfully.', user, 201);
});

/**
 * Controller to authenticate users.
 * sets JWT session cookies via HttpOnly headers, completely omitting tokens from the JSON response.
 */
const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.loginUser(req.body, req);

  // Bind session token in HttpOnly response cookies
  setAuthCookie(res, token);

  return successResponse(res, 'Login successful.', { user });
});

/**
 * Controller to terminate sessions.
 * Clears HttpOnly cookies and logs logout events.
 */
const logout = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id : null;
  await authService.logoutUser(userId, req);

  // Clear cookie from response headers
  clearAuthCookie(res);

  return successResponse(res, 'Logout successful.');
});

/**
 * Controller to fetch active session profile details from req.user context.
 */
const me = asyncHandler(async (req, res) => {
  return successResponse(res, 'Current user profile retrieved.', req.user);
});

/**
 * Controller to upload user profile image. (Authenticated user only)
 */
const uploadProfileImage = asyncHandler(async (req, res) => {
  const user = await authService.uploadProfileImage(req.user.id, req.file, req);
  return successResponse(res, 'Profile image uploaded successfully.', user);
});

/**
 * Controller to fetch a fresh CSRF token.
 */
const csrfToken = (req, res) => {
  const { generateCsrfToken, setCsrfCookie } = require('../../middleware/csrf.middleware');
  const token = generateCsrfToken();
  setCsrfCookie(res, token);
  return successResponse(res, 'CSRF token generated successfully.', { csrfToken: token });
};

module.exports = {
  register,
  login,
  logout,
  me,
  uploadProfileImage,
  csrfToken
};

