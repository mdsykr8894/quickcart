const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');
const validate = require('../../middleware/validate.middleware');
const { checkoutSchema, updateOrderStatusSchema } = require('./order.validation');
const orderController = require('./order.controller');

const router = express.Router();

// Enforce authentication on all underlying shopper/admin order endpoints
router.use(authMiddleware);

// -------------------------------------------------------------
// Shopper Order Routes
// -------------------------------------------------------------

// Route to execute checkout from shopping cart (Zod validated, simulated only)
router.post('/checkout', validate(checkoutSchema), orderController.checkout);

// Route to view order history (Must be placed before parameter routes to prevent route shadowing)
router.get('/my', orderController.getMyOrders);

// Route to view specific order details (IDOR protected)
router.get('/my/:id', orderController.getMyOrderDetail);

// -------------------------------------------------------------
// Administrative Order Routes
// -------------------------------------------------------------

// Route to query all orders (Admin only)
router.get('/', requireRole('ADMIN'), orderController.getAllOrders);

// Route to query specific order details (Admin only)
router.get('/:id', requireRole('ADMIN'), orderController.getOrderDetailForAdmin);

// Route to update order status parameters (Admin only, Zod validated)
router.patch('/:id/status', requireRole('ADMIN'), validate(updateOrderStatusSchema), orderController.updateOrderStatus);

module.exports = router;
