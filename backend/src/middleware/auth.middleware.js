const env = require('../config/env');
const prisma = require('../config/prisma');
const { verifyToken } = require('../utils/token');
const { sanitizeUser } = require('../utils/sanitize');
const { logAudit } = require('../utils/auditLogger');
const AppError = require('../utils/AppError');

/**
 * Session verification middleware checking HttpOnly cookies.
 * Resolves verified sessions, extracts corresponding database entries, and binds safe details to req.user.
 */
const authMiddleware = async (req, res, next) => {
  const token = req.cookies[env.COOKIE_NAME];

  if (!token) {
    // Basic unauthenticated request (do not spam audit logs for visitors lacking a session cookie)
    return next(new AppError('Authentication required.', 401));
  }

  try {
    // 1. Verify token signature
    const decoded = verifyToken(token);

    // 2. Fetch active user records
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      await logAudit({
        action: 'AUTH_SESSION_INVALID',
        status: 'FAILED',
        req,
        details: `Session contains non-existent user ID: ${decoded.userId}`
      });
      return next(new AppError('Authentication failed. User profile not found.', 401));
    }

    // 3. Prevent suspended user sessions
    if (!user.isActive) {
      await logAudit({
        userId: user.id,
        action: 'INACTIVE_USER_BLOCKED',
        status: 'FAILED',
        req,
        details: `Suspended user account "${user.username}" attempted access.`
      });
      return next(new AppError('Authentication failed. Account is suspended.', 401));
    }

    // 4. Bind sanitized profile to request context
    req.user = sanitizeUser(user);
    return next();
  } catch (error) {
    // Log anomalous token failures (e.g. tampering attempts)
    await logAudit({
      action: 'MALFORMED_JWT_REJECTED',
      status: 'FAILED',
      req,
      details: `Invalid or expired session cookie signature: ${error.message}`
    });
    return next(new AppError('Authentication failed. Session is invalid or expired.', 401));
  }
};

module.exports = authMiddleware;
