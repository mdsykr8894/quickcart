const bcrypt = require('bcrypt');

/**
 * Hashes a plaintext password using bcrypt with 10 salt rounds.
 * @param {string} password - Raw password
 * @returns {Promise<string>} Encrypted password hash
 */
const hashPassword = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Safe comparison of a plaintext password against an encrypted hash.
 * @param {string} password - Raw password
 * @param {string} passwordHash - Encrypted password hash
 * @returns {Promise<boolean>} Match result indication
 */
const comparePassword = async (password, passwordHash) => {
  return bcrypt.compare(password, passwordHash);
};

module.exports = {
  hashPassword,
  comparePassword
};
