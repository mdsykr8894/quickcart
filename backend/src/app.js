const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const { helmetMiddleware, corsMiddleware } = require('./middleware/security.middleware');
const { successResponse } = require('./utils/response');
const setupSwagger = require('./config/swagger');
const notFoundMiddleware = require('./middleware/notFound.middleware');
const errorMiddleware = require('./middleware/error.middleware');

// Import Modular Routers
const authRouter = require('./modules/auth/auth.routes');
const userRouter = require('./modules/users/user.routes');
const auditRouter = require('./modules/audit/audit.routes');
const categoryRouter = require('./modules/categories/category.routes');
const productRouter = require('./modules/products/product.routes');
const cartRouter = require('./modules/cart/cart.routes');
const orderRouter = require('./modules/orders/order.routes');
const settingsRouter = require('./modules/settings/settings.routes');

const app = express();

// Apply transport and headers security layers
app.use(helmetMiddleware);
app.use(corsMiddleware);

// Standard JSON request body parsing (guarded with body size limits against payload-based DoS)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Parse HttpOnly cookie headers
app.use(cookieParser());

// Enforce CSRF protection on all state-changing routes
const { csrfMiddleware } = require('./middleware/csrf.middleware');
app.use(csrfMiddleware);

// Serve locally uploaded product images as static resources safely
app.use('/uploads/products', express.static(path.join(__dirname, '../uploads/products')));
app.use('/uploads/profiles', express.static(path.join(__dirname, '../uploads/profiles')));

// Return a clean 404 SVG placeholder for any missing uploads instead of letting them hit the JSON API error handler
// This completely avoids CORB blocking warnings in browsers since it serves a valid image content type
app.use('/uploads', (req, res) => {
  res.status(404)
     .setHeader('Content-Type', 'image/svg+xml')
     .send(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%2394a3b8">Not Found</text></svg>`);
});

// Set up interactive API documentation (mounted strictly under dev environments)
setupSwagger(app);

// Basic Health Check Route (retains JSON output format exactly)
app.get('/api/health', (req, res) => {
  return successResponse(res, 'QuickCart API is running.', {
    service: 'QuickCart Backend',
    status: 'healthy'
  });
});

// Mount modular API routers
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/audit', auditRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api/settings', settingsRouter);

// Intercept requests matching no endpoints and throw a 404 AppError
app.use(notFoundMiddleware);

// Centralized error middleware (Sanitizes stack leaks and parses Zod and AppErrors)
app.use(errorMiddleware);

module.exports = app;
