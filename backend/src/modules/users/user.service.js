const prisma = require('../../config/prisma');
const { sanitizeUser } = require('../../utils/sanitize');
const { logAudit } = require('../../utils/auditLogger');
const AppError = require('../../utils/AppError');

/**
 * Service to fetch user profile by ID.
 * @param {string} userId - User identifier
 * @returns {Promise<object>} Sanitized User profile
 */
const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError('User profile not found.', 404);
  }

  return sanitizeUser(user);
};

/**
 * Service to update profile details (only firstName, lastName, and email allowed).
 * Performs duplication checks for modified email addresses and audits the changes.
 * 
 * @param {string} userId - User identifier
 * @param {object} data - Validated update values
 * @param {object} req - Express request context
 * @returns {Promise<object>} Updated sanitized User details
 */
const updateProfile = async (userId, data, req) => {
  const {
    firstName, lastName, email,
    shippingFullName, shippingPhone,
    shippingAddressLine1, shippingAddressLine2,
    shippingCity, shippingState,
    shippingPostalCode, shippingCountry
  } = data;

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError('User profile not found.', 404);
  }

  const updateData = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;

  if (email !== undefined && email !== user.email) {
    // Prevent duplicate emails
    const emailDuplicate = await prisma.user.findUnique({
      where: { email }
    });
    if (emailDuplicate) {
      throw new AppError('Email is already registered to another account.', 400);
    }
    updateData.email = email;
  }

  if (shippingFullName !== undefined) updateData.shippingFullName = shippingFullName;
  if (shippingPhone !== undefined) updateData.shippingPhone = shippingPhone;
  if (shippingAddressLine1 !== undefined) updateData.shippingAddressLine1 = shippingAddressLine1;
  if (shippingAddressLine2 !== undefined) updateData.shippingAddressLine2 = shippingAddressLine2;
  if (shippingCity !== undefined) updateData.shippingCity = shippingCity;
  if (shippingState !== undefined) updateData.shippingState = shippingState;
  if (shippingPostalCode !== undefined) updateData.shippingPostalCode = shippingPostalCode;
  if (shippingCountry !== undefined) updateData.shippingCountry = shippingCountry;

  // If no modifications are requested, return original profile
  if (Object.keys(updateData).length === 0) {
    return sanitizeUser(user);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData
  });

  // Log successful profile update
  await logAudit({
    userId: user.id,
    action: 'PROFILE_UPDATED',
    status: 'SUCCESS',
    req,
    details: `User profile fields modified: [${Object.keys(updateData).join(', ')}]`
  });

  return sanitizeUser(updatedUser);
};

/**
 * Service to retrieve lists of all users (for Admin dashboard routing).
 * @returns {Promise<Array>} Sanitized User list
 */
const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return users.map(sanitizeUser);
};

/**
 * Service to retrieve user profile by ID (for Admin detailed audit logs).
 * @param {string} id - Selected User identifier
 * @returns {Promise<object>} Sanitized User profile
 */
const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return sanitizeUser(user);
};

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById
};
