const env = require('../config/env');

/**
 * Generates options for the authentication HttpOnly cookie.
 * @returns {object} Express cookie configurations
 */
const getAuthCookieOptions = () => {
  const isProduction = env.NODE_ENV === 'production';
  
  return {
    httpOnly: env.COOKIE_HTTP_ONLY,
    // Enforces secure flag in production, or respects explicit env parameters
    secure: env.COOKIE_SECURE || isProduction,
    sameSite: env.COOKIE_SAME_SITE,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    path: '/'
  };
};

/**
 * Injects a signed JWT token into the response cookie header.
 * @param {object} res - Express response
 * @param {string} token - Signed JWT token
 */
const setAuthCookie = (res, token) => {
  res.cookie(env.COOKIE_NAME, token, getAuthCookieOptions());
};

/**
 * Clears the authentication session cookie from the client browser.
 * @param {object} res - Express response
 */
const clearAuthCookie = (res) => {
  const options = { ...getAuthCookieOptions() };
  delete options.maxAge;
  options.expires = new Date(0); // Expire cookie instantly
  res.clearCookie(env.COOKIE_NAME, options);
};

module.exports = {
  getAuthCookieOptions,
  setAuthCookie,
  clearAuthCookie
};
