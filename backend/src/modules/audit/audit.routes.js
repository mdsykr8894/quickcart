const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');
const auditController = require('./audit.controller');

const router = express.Router();

// Apply administrative restriction shields on all underlying audit endpoints
router.use(authMiddleware);
router.use(requireRole('ADMIN'));

// Route to query paginated operational audit logs
router.get('/logs', auditController.listAuditLogs);

// Route to fetch general cumulative log count statistics
router.get('/summary', auditController.getAuditSummary);

module.exports = router;
