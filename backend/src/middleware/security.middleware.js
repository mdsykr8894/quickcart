const helmet = require('helmet');
const cors = require('cors');
const env = require('../config/env');

// CORS configuration limiting access strictly to verified client URLs and supporting secure credentials
const origins = env.CLIENT_ORIGINS
  ? env.CLIENT_ORIGINS.split(',').map((o) => o.trim())
  : [env.CLIENT_URL];

const corsOptions = {
  origin: origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-CSRF-Token'],
};

// Exporting core security middleware components
// NOTE FOR PRODUCTION DEPLOYMENT:
// TLS/HTTPS termination must be configured at the production hosting level (e.g. AWS ALB, Vercel, Heroku)
// or via a dedicated web server/reverse proxy (e.g. Nginx, Apache) to ensure all traffic is encrypted.
// Helmet is configured to only send the Strict-Transport-Security (HSTS) header in production,
// allowing seamless HTTP development on localhost without protocol enforcement issues.
module.exports = {
  helmetMiddleware: helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: env.NODE_ENV === 'production' ? {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true
    } : false
  }),
  corsMiddleware: cors(corsOptions)
};
