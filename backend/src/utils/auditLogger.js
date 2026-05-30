const prisma = require('../config/prisma');

/**
 * Asynchronously writes an audit event entry into the database.
 * Safeguards operations: exceptions inside this logging method will log warnings to stdout
 * but will NEVER interrupt the primary client request transaction.
 * 
 * @param {object} params - Parameters structure
 * @param {string|null} params.userId - Associated user identifier (nullable)
 * @param {string} params.action - Log event type descriptor (e.g. USER_REGISTERED, LOGIN_SUCCESS)
 * @param {string} params.status - Event resolution (e.g. SUCCESS, FAILED)
 * @param {object|null} params.req - Express request object to extract client IP and User-Agent
 * @param {string|object|null} params.details - Safe JSON details or metadata string (sanitized)
 */
const logAudit = async ({ userId = null, action, status, req = null, details = null }) => {
  try {
    let ipAddress = null;
    let userAgent = null;

    if (req) {
      // Safely capture proxy-forwarded or remote connection client IPs
      const forwarded = req.headers['x-forwarded-for'];
      ipAddress = forwarded 
        ? (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : forwarded[0]) 
        : (req.ip || req.socket.remoteAddress || null);
      
      userAgent = req.get('user-agent') || null;
    }

    // Convert structured details to JSON strings, sanitizing secret keys
    let detailsString = null;
    if (details) {
      if (typeof details === 'object') {
        const safeDetails = { ...details };
        const secretKeywords = ['password', 'token', 'secret', 'cookie', 'jwt', 'passwordhash'];
        
        Object.keys(safeDetails).forEach((key) => {
          if (secretKeywords.some((keyword) => key.toLowerCase().includes(keyword))) {
            safeDetails[key] = '[REDACTED]';
          }
        });
        
        detailsString = JSON.stringify(safeDetails);
      } else {
        detailsString = String(details);
      }
    }

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        status,
        ipAddress,
        userAgent,
        details: detailsString
      }
    });
  } catch (error) {
    // Non-blocking catch to prevent logging faults from dropping the client request
    console.warn(`[Audit Logging Failed] Action: ${action} - Warning: ${error.message}`);
  }
};

module.exports = {
  logAudit
};
