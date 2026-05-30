const env = require('./config/env');
const app = require('./app');

// Retrieve validated port and mode values from config
const PORT = env.PORT;
const NODE_ENV = env.NODE_ENV;

const server = app.listen(PORT, () => {
  console.log(`[QuickCart Server] Running in ${NODE_ENV} mode on port ${PORT}`);
});

// Simplified graceful shutdown helper
const handleShutdown = (signal) => {
  console.info(`[QuickCart Server] Received ${signal}. Terminating connection pool gracefully.`);
  server.close(() => {
    console.log('[QuickCart Server] Active TCP sockets closed. Process terminated.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
