import 'dotenv/config'; // Load environment variables from .env file
import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { validateEnv } from './config/env.js';



// Validate environment variables before starting
try {
  validateEnv();
  console.log('✓ Environment variables validated');
} catch (error) {
  console.error('✗ Environment validation failed:', error.message);
  process.exit(1);
}


const PORT = 3001;
let server;

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Stop accepting new requests
  if (server) {
    server.close(() => {
      console.log('✓ HTTP server closed');
    });
  }

  // Close database connection
  try {
    await disconnectDatabase();
    console.log('✓ Database connection closed');
  } catch (error) {
    console.error('✗ Error closing database connection:', error);
  }

  // Exit process
  console.log('✓ Graceful shutdown complete');
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Connect to database and start server
connectDatabase()
  .then(() => {
    // Start server
    server = app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  });

