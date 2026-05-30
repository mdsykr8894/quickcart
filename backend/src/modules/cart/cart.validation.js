const { z } = require('zod');

// Schema for adding a product to the shopping cart.
// Enforced as strict to prevent attackers from injecting unauthorized properties.
const addCartItemSchema = z.object({
  productId: z.string({
    required_error: 'Product ID is required.'
  })
  .uuid('Product ID must be a valid UUID.'),

  quantity: z.number({
    required_error: 'Quantity is required.'
  })
  .int('Quantity must be an integer.')
  .min(1, 'Quantity must be at least 1.')
  .max(99, 'Quantity cannot exceed 99.')
}).strict('Unexpected properties detected. Only productId and quantity are supported.');

// Schema for modifying a cart item quantity.
const updateCartItemSchema = z.object({
  quantity: z.number({
    required_error: 'Quantity is required.'
  })
  .int('Quantity must be an integer.')
  .min(1, 'Quantity must be at least 1.')
  .max(99, 'Quantity cannot exceed 99.')
}).strict('Unexpected properties detected. Only quantity updates are allowed.');

module.exports = {
  addCartItemSchema,
  updateCartItemSchema
};
