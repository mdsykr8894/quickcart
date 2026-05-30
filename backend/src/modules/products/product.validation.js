const { z } = require('zod');

// Schema for Creating a new product.
// Enforced as strict to reject arbitrary fields (such as imagePath or id injections).
const createProductSchema = z.object({
  name: z.string({
    required_error: 'Product name is required.'
  })
  .min(2, 'Product name must be at least 2 characters.')
  .max(120, 'Product name cannot exceed 120 characters.'),

  description: z.string()
  .max(2000, 'Description cannot exceed 2000 characters.')
  .optional(),

  price: z.number({
    required_error: 'Price is required.'
  })
  .positive('Price must be a positive number.'),

  stock: z.number({
    required_error: 'Stock is required.'
  })
  .int('Stock must be an integer.')
  .min(0, 'Stock cannot be negative.'),

  categoryId: z.string({
    required_error: 'Category ID is required.'
  })
  .uuid('Category ID must be a valid UUID.'),

  isActive: z.boolean().optional()
}).strict('Unexpected properties detected. Product creations support only name, description, price, stock, categoryId, and isActive.');

// Schema for Updating products.
// Enforced as strict and validates that at least one attribute is passed.
const updateProductSchema = z.object({
  name: z.string()
    .min(2, 'Product name must be at least 2 characters.')
    .max(120, 'Product name cannot exceed 120 characters.')
    .optional(),

  description: z.string()
    .max(2000, 'Description cannot exceed 2000 characters.')
    .optional(),

  price: z.number()
    .positive('Price must be a positive number.')
    .optional(),

  stock: z.number()
    .int('Stock must be an integer.')
    .min(0, 'Stock cannot be negative.')
    .optional(),

  categoryId: z.string()
    .uuid('Category ID must be a valid UUID.')
    .optional(),

  isActive: z.boolean().optional()
})
.strict('Unexpected properties detected in product update payload.')
.refine((data) => Object.keys(data).length > 0, {
  message: 'At least one attribute (name, description, price, stock, categoryId, or isActive) must be provided to update.'
});

module.exports = {
  createProductSchema,
  updateProductSchema
};
