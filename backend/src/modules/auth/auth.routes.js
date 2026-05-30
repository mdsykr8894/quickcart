const express = require('express');
const validate = require('../../middleware/validate.middleware');
const { registerSchema, loginSchema } = require('./auth.validation');
const authMiddleware = require('../../middleware/auth.middleware');
const { loginLimiter, registerLimiter } = require('../../middleware/rateLimit.middleware');
const { profileImageUpload } = require('../../middleware/upload.middleware');
const authController = require('./auth.controller');

const router = express.Router();

// Route to register new shopper accounts (Rate limited, schema validated)
router.get('/csrf', authController.csrfToken);
router.post('/register', registerLimiter, validate(registerSchema), authController.register);

// Route to authenticate users and set HttpOnly cookies (Rate limited, schema validated)
router.post('/login', loginLimiter, validate(loginSchema), authController.login);

// Route to clear shopper session and cookies (Authenticated)
router.post('/logout', authMiddleware, authController.logout);

// Route to query active session profiles (Authenticated)
router.get('/me', authMiddleware, authController.me);

// Route to upload/change shopper profile image (Authenticated)
router.patch('/profile/image', authMiddleware, profileImageUpload, authController.uploadProfileImage);

module.exports = router;
