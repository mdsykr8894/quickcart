const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { addCartItemSchema, updateCartItemSchema } = require('./cart.validation');
const cartController = require('./cart.controller');

const router = express.Router();

// Enforce active session logins on all underlying cart endpoints
router.use(authMiddleware);

// Route to query current shopper cart items and totals
router.get('/', cartController.getCart);

// Route to append or increment a product inside the shopper cart
router.post('/items', validate(addCartItemSchema), cartController.addCartItem);

// Route to update shopper cart item quantity by UUID
router.patch('/items/:id', validate(updateCartItemSchema), cartController.updateCartItem);

// Route to remove a specific item from the shopper cart by UUID
router.delete('/items/:id', cartController.removeCartItem);

// Route to completely empty the shopper cart
router.delete('/clear', cartController.clearCart);

module.exports = router;
