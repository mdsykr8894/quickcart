const { z } = require('zod');

// Schema for User Registration validation
const registerSchema = z.object({
  username: z.string({
    required_error: 'Username is required.'
  })
  .min(3, 'Username must be at least 3 characters.')
  .max(30, 'Username must be at most 30 characters.')
  // Enforces alphanumeric and underscores only
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores.'),

  email: z.string({
    required_error: 'Email is required.'
  })
  .email('Must be a valid email address.'),

  password: z.string({
    required_error: 'Password is required.'
  })
  .min(8, 'Password must be at least 8 characters.')
  .refine((val) => /[A-Z]/.test(val), { message: 'Password must contain at least one uppercase letter.' })
  .refine((val) => /[a-z]/.test(val), { message: 'Password must contain at least one lowercase letter.' })
  .refine((val) => /[0-9]/.test(val), { message: 'Password must contain at least one number.' })
  .refine((val) => /[^a-zA-Z0-9]/.test(val), { message: 'Password must contain at least one special character.' }),

  firstName: z.string({
    required_error: 'First name is required.'
  })
  .min(1, 'First name is required.')
  .max(50, 'First name cannot exceed 50 characters.'),

  lastName: z.string({
    required_error: 'Last name is required.'
  })
  .min(1, 'Last name is required.')
  .max(50, 'Last name cannot exceed 50 characters.')
});

// Schema for User Login validation
const loginSchema = z.object({
  usernameOrEmail: z.string({
    required_error: 'Username or email is required.'
  })
  .min(1, 'Username or email cannot be empty.'),

  password: z.string({
    required_error: 'Password is required.'
  })
  .min(1, 'Password cannot be empty.')
});

module.exports = {
  registerSchema,
  loginSchema
};
