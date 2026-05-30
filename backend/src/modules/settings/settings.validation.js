const { z } = require('zod');

// Schema for updating development Swagger configurations (Admin only)
const updateSwaggerSchema = z.object({
  swaggerEnabled: z.boolean({
    required_error: 'swaggerEnabled parameter is required.',
    invalid_type_error: 'swaggerEnabled must be a boolean value.'
  })
}).strict('Unexpected properties detected in settings payload.');

module.exports = {
  updateSwaggerSchema
};
