const { successResponse } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const auditService = require('./audit.service');
const { logAudit } = require('../../utils/auditLogger');

/**
 * Controller retrieving Paginated Audit Log lists.
 * Restricts query mappings and registers administrative accesses in the log database.
 */
const listAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, action, status } = req.query;

  const data = await auditService.getAuditLogs({ page, limit, action, status });

  // Log administrative audit review event
  await logAudit({
    userId: req.user.id,
    action: 'VIEW_AUDIT_LOGS',
    status: 'SUCCESS',
    req,
    details: `Admin "${req.user.username}" reviewed paginated audit logs.`
  });

  return successResponse(res, 'Audit logs retrieved successfully.', data);
});

/**
 * Controller retrieving cumulative count metrics over audit logs.
 * Registers administrative review event in the audit trail.
 */
const getAuditSummary = asyncHandler(async (req, res) => {
  const data = await auditService.getAuditSummary();

  // Log administrative audit review event
  await logAudit({
    userId: req.user.id,
    action: 'VIEW_AUDIT_SUMMARY',
    status: 'SUCCESS',
    req,
    details: `Admin "${req.user.username}" reviewed general system audit statistics.`
  });

  return successResponse(res, 'Audit summary retrieved successfully.', data);
});

module.exports = {
  listAuditLogs,
  getAuditSummary
};
