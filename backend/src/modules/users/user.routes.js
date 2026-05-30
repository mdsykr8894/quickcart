const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');
const validate = require('../../middleware/validate.middleware');
const { profileUpdateSchema } = require('./user.validation');
const userController = require('./user.controller');

const router = express.Router();

// Enforce authentication on all underlying shopper/admin endpoints
router.use(authMiddleware);

// Shopper Profile routes
router.get('/profile', userController.getProfile);
router.patch('/profile', validate(profileUpdateSchema), userController.updateProfile);

// Administrative User Management routes
router.get('/', requireRole('ADMIN'), userController.listUsers);
router.get('/:id', requireRole('ADMIN'), userController.getUserDetail);

module.exports = router;
