/**
 * Request/Response logging middleware
 * Logs incoming requests and responses for debugging and monitoring
 */

export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    return originalSend.call(this, body);
  };

  next();
};

export default requestLogger;

