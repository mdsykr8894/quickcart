const path = require('path');
const dotenv = require('dotenv');
const { z } = require('zod');

// Load environment variables from the parent backend/ folder
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Helper to safely parse strings into booleans
const coerceBoolean = z.preprocess((val) => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    if (val.toLowerCase() === 'true') return true;
    if (val.toLowerCase() === 'false') return false;
  }
  return undefined;
}, z.boolean());

// Zod validation schema for environment configurations
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5001),
  DATABASE_URL: z.string({
    required_error: 'DATABASE_URL is required inside environment variables.'
  }).min(1, 'DATABASE_URL cannot be empty'),
  JWT_SECRET: z.string({
    required_error: 'JWT_SECRET is required inside environment variables.'
  }).min(1, 'JWT_SECRET cannot be empty'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  CLIENT_ORIGINS: z.string().default('http://localhost:5173,http://127.0.0.1:5173,http://192.168.1.117:5173'),
  COOKIE_NAME: z.string().default('quickcart_token'),
  COOKIE_HTTP_ONLY: coerceBoolean.default(true),
  COOKIE_SECURE: coerceBoolean.default(false),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  UPLOAD_MAX_SIZE_MB: z.coerce.number().positive().default(2),
  SWAGGER_ENABLED: coerceBoolean.default(true),
});

// Perform validation on process.env
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Environment configuration validation failed:');
  
  // Print path and validation error message, NEVER the raw secret values
  parsed.error.errors.forEach((error) => {
    console.error('\x1b[31m%s\x1b[0m', `  - [${error.path.join('.')}]: ${error.message}`);
  });
  
  console.error('\x1b[31m%s\x1b[0m', 'Process exited due to validation error.');
  process.exit(1);
}

// Export the validated environment object
module.exports = parsed.data;
