const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Encrypts and signs a JWT access token containing only safe identifiers.
 * Payload parameters strictly restricted to: userId and role.
 * 
 * @param {object} payload - Identifiers object
 * @returns {string} Encrypted JWT token string
 */
const signToken = (payload) => {
  const minimalPayload = {
    userId: payload.userId,
    role: payload.role
  };
  return jwt.sign(minimalPayload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
};

/**
 * Decrypts and verifies a JWT token.
 * 
 * @param {string} token - Signed JWT token string
 * @returns {object} Decoded payload properties
 */
const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

module.exports = {
  signToken,
  verifyToken
};
