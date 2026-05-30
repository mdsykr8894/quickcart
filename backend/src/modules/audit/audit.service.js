const prisma = require('../../config/prisma');

/**
 * Lists audit logs with filters and pagination, sorted newest first.
 * 
 * @param {object} params - Parameters structure
 * @param {number} params.page - Selected page index
 * @param {number} params.limit - Max items per page
 * @param {string|null} params.action - Event action filter
 * @param {string|null} params.status - Event status filter
 * @returns {Promise<object>} Logs and pagination details
 */
const getAuditLogs = async ({ page = 1, limit = 10, action, status }) => {
  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNumber - 1) * limitNumber;

  const where = {};
  if (action) where.action = action;
  if (status) where.status = status;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNumber,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true
          }
        }
      }
    }),
    prisma.auditLog.count({ where })
  ]);

  return {
    logs,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber)
    }
  };
};

/**
 * Calculates summary metrics over the audit log events.
 * @returns {Promise<object>} Cumulative summary counts
 */
const getAuditSummary = async () => {
  const [
    totalLogs,
    loginSuccessCount,
    loginFailedCount,
    unauthorizedAccessCount
  ] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.count({ where: { action: 'LOGIN_SUCCESS' } }),
    prisma.auditLog.count({ where: { action: 'LOGIN_FAILED' } }),
    prisma.auditLog.count({ where: { action: 'UNAUTHORIZED_ACCESS' } })
  ]);

  return {
    totalLogs,
    loginSuccessCount,
    loginFailedCount,
    unauthorizedAccessCount
  };
};

module.exports = {
  getAuditLogs,
  getAuditSummary
};
