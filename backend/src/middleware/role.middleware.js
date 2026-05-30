const { logAudit } = require('../utils/auditLogger');
const AppError = require('../utils/AppError');

/**
 * Reusable Role-Based Access Control (RBAC) route authorization shield.
 * 
 * @param {...string} roles - Authorized user roles (e.g. 'ADMIN', 'USER')
 * @returns {Function} Express middleware handler
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401));
  }

  // Reject and log unprivileged access
  if (!roles.includes(req.user.role)) {
    logAudit({
      userId: req.user.id,
      action: 'UNAUTHORIZED_ACCESS',
      status: 'FAILED',
      req,
      details: `User "${req.user.username}" (Role: ${req.user.role}) attempted to call route requiring roles: [${roles.join(', ')}]`
    });
    
    return next(new AppError('Access denied. Insufficient permissions.', 403));
  }

  return next();
};

module.exports = {
  requireRole
};
