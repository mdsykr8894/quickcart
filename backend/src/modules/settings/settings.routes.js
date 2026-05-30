const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');
const validate = require('../../middleware/validate.middleware');
const { updateSwaggerSchema } = require('./settings.validation');
const settingsController = require('./settings.controller');

const router = express.Router();

// Enforce auth and ADMIN role constraints on all underlying settings routes
router.use(authMiddleware);
router.use(requireRole('ADMIN'));

// Route to fetch development settings parameters
router.get('/', settingsController.getSettings);

// Route to toggle Swagger mounting parameters (Zod validated)
router.patch('/swagger', validate(updateSwaggerSchema), settingsController.updateSwaggerSetting);

module.exports = router;
