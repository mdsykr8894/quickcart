const fs = require('fs');
const prisma = require('../../config/prisma');
const { hashPassword, comparePassword } = require('../../utils/password');
const { signToken } = require('../../utils/token');
const { sanitizeUser } = require('../../utils/sanitize');
const { logAudit } = require('../../utils/auditLogger');
const AppError = require('../../utils/AppError');

/**
 * Service to register a new user in the system.
 * Restricts registrations strictly to the 'USER' role to prevent administrative privilege escalation.
 * 
 * @param {object} data - Validated input registration payload
 * @param {object} req - Express request context
 * @returns {Promise<object>} Sanitized User profile
 */
const registerUser = async (data, req) => {
  const { username, email, password, firstName, lastName } = data;

  // 1. Confirm that username and email are unique
  const duplicate = await prisma.user.findFirst({
    where: {
      OR: [
        { username: username },
        { email: email }
      ]
    }
  });

  if (duplicate) {
    if (duplicate.username === username) {
      throw new AppError('Username is already taken.', 400);
    }
    if (duplicate.email === email) {
      throw new AppError('Email is already registered.', 400);
    }
  }

  // 2. Hash raw passwords securely
  const passwordHash = await hashPassword(password);

  // 3. Persist new customer profile
  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      firstName,
      lastName,
      role: 'USER', // Strictly forced default
      isActive: true
    }
  });

  // 4. Record successful audit event
  await logAudit({
    userId: user.id,
    action: 'USER_REGISTERED',
    status: 'SUCCESS',
    req,
    details: `Customer account "${user.username}" registered successfully.`
  });

  return sanitizeUser(user);
};

/**
 * Authenticates user credentials and signs session access tokens.
 * emploies generic feedback strings to block email/username enumeration techniques.
 * 
 * @param {object} data - Validated login credentials payload
 * @param {object} req - Express request context
 * @returns {Promise<object>} Sanitized User details and signed JWT
 */
const loginUser = async (data, req) => {
  const { usernameOrEmail, password } = data;

  // Generic secure warning to reject credential inquiries without providing enumeration vectors
  const genericError = new AppError('Invalid username or password.', 401);

  // 1. Find match by username or email
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: usernameOrEmail },
        { email: usernameOrEmail }
      ]
    }
  });

  if (!user) {
    await logAudit({
      action: 'LOGIN_FAILED',
      status: 'FAILED',
      req,
      details: `Failed authentication attempt for: "${usernameOrEmail}". User profile not found.`
    });
    throw genericError;
  }

  // 2. Verify hashed password
  const isMatch = await comparePassword(password, user.passwordHash);

  if (!isMatch) {
    await logAudit({
      userId: user.id,
      action: 'LOGIN_FAILED',
      status: 'FAILED',
      req,
      details: `Failed authentication attempt: incorrect credentials for user "${user.username}".`
    });
    throw genericError;
  }

  // 3. block access to suspended shoppers
  if (!user.isActive) {
    await logAudit({
      userId: user.id,
      action: 'LOGIN_FAILED',
      status: 'FAILED',
      req,
      details: `Active login attempt blocked: user account "${user.username}" is suspended.`
    });
    throw new AppError('Your account has been suspended. Please contact support.', 403);
  }

  // 4. Sign minimal secure JWT access token
  const token = signToken({ userId: user.id, role: user.role });

  // 5. Log audit success
  await logAudit({
    userId: user.id,
    action: 'LOGIN_SUCCESS',
    status: 'SUCCESS',
    req,
    details: `User account "${user.username}" authenticated successfully.`
  });

  return {
    user: sanitizeUser(user),
    token
  };
};

/**
 * Logs a standard user logout event.
 * @param {string|null} userId - User identifier
 * @param {object} req - Express request context
 */
const logoutUser = async (userId, req) => {
  if (userId) {
    await logAudit({
      userId,
      action: 'LOGOUT',
      status: 'SUCCESS',
      req,
      details: 'User session logged out successfully.'
    });
  }
  return true;
};

/**
 * Uploads and updates the user profile image. Safely unlinks previous profile image from disk.
 * 
 * @param {string} userId - User identifier
 * @param {object} file - Uploaded Multer file structure
 * @param {object} req - Express request context
 * @returns {Promise<object>} Sanitized updated user
 */
const uploadProfileImage = async (userId, file, req) => {
  if (!file) {
    throw new AppError('Image file is required.', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user) {
    throw new AppError('User profile not found.', 404);
  }

  // 1. Safely delete/unlink old profile image file if exists
  if (user.profileImagePath) {
    try {
      if (fs.existsSync(user.profileImagePath)) {
        fs.unlinkSync(user.profileImagePath);
      }
    } catch (err) {
      console.error(`Failed to delete old profile file at ${user.profileImagePath}:`, err);
    }
  }

  // 2. Persist profile image metadata details
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      profileImageName: file.filename,
      profileImagePath: file.path,
      profileImageMime: file.mimetype
    }
  });

  // 3. Log user audit event
  await logAudit({
    userId: user.id,
    action: 'USER_PROFILE_IMAGE_UPLOADED',
    status: 'SUCCESS',
    req,
    details: `User "${user.username}" profile image uploaded: name "${file.filename}".`
  });

  return sanitizeUser(updatedUser);
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  uploadProfileImage
};
