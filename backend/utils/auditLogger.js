const AuditLog = require('../models/AuditLog');

/**
 * Log audit events for security and administrative actions.
 * Invariant 6: Audit log every privileged provisioning event.
 */
const logAuditEvent = async ({
  actorId = null,
  targetUserId = null,
  action,
  roleGranted = null,
  req = null,
  metadata = {},
}) => {
  try {
    const ip = req ? req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress : null;
    const userAgent = req ? req.headers['user-agent'] : null;
    const requestId = req ? req.headers['x-request-id'] || null : null;

    const logEntry = await AuditLog.create({
      actorId,
      targetUserId,
      action,
      roleGranted,
      ip,
      userAgent,
      requestId,
      metadata,
    });

    return logEntry;
  } catch (error) {
    console.error('Failed to record audit log event:', error);
    // Do not throw to avoid failing the main transaction if logging hits non-critical error,
    // but in security compliance environments logging is monitored.
    return null;
  }
};

module.exports = { logAuditEvent };
