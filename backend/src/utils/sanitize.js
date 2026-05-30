/**
 * Sanitizes a user model, removing the passwordHash and other sensitive internal properties.
 * 
 * @param {object} user - User record object from database
 * @returns {object} Clean, sanitized user profile object
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    profileImageUrl: user.profileImageName ? `/uploads/profiles/${user.profileImageName}` : null,
    // Saved shipping address properties
    shippingFullName: user.shippingFullName,
    shippingPhone: user.shippingPhone,
    shippingAddressLine1: user.shippingAddressLine1,
    shippingAddressLine2: user.shippingAddressLine2,
    shippingCity: user.shippingCity,
    shippingState: user.shippingState,
    shippingPostalCode: user.shippingPostalCode,
    shippingCountry: user.shippingCountry
  };
};

module.exports = {
  sanitizeUser
};
