const AppError = require('../utils/AppError');

/**
 * Higher-order middleware executing Zod schema validation against incoming request bodies.
 * 
 * @param {z.ZodSchema} schema - Zod validation schema
 * @returns {Function} Express middleware handler
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  
  if (!result.success) {
    // Map details from Zod issues and forward to the central handler as a Bad Request error
    const validationDetails = result.error.errors.map((error) => ({
      field: error.path.join('.'),
      message: error.message
    }));
    
    return next(new AppError('Validation failed.', 400, validationDetails));
  }
  
  // Replace request body with validated, sanitized values (ignoring unmapped input properties)
  req.body = result.data;
  return next();
};

module.exports = validate;
