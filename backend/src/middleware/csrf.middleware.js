const crypto = require('crypto');
const AppError = require('../utils/AppError');
const env = require('../config/env');

const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const csrfMiddleware = (req, res, next) => {
  // 1. Allow safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // 2. Extract CSRF token from header and cookie
  const clientToken = req.headers['x-csrf-token'];
  const cookieToken = req.cookies['csrf_token'];

  if (!clientToken || !cookieToken || clientToken !== cookieToken) {
    return next(new AppError('CSRF token validation failed.', 403));
  }

  next();
};

const setCsrfCookie = (res, token) => {
  const isProduction = env.NODE_ENV === 'production';
  res.cookie('csrf_token', token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE || isProduction,
    sameSite: env.COOKIE_SAME_SITE || 'lax',
    path: '/'
  });
};

module.exports = {
  csrfMiddleware,
  generateCsrfToken,
  setCsrfCookie
};
