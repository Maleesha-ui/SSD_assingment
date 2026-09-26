/**
 * In-memory sliding-window rate limiter for privileged administrative endpoints & sensitive auth.
 * - privilegedRateLimiter: 10 requests / min / admin (V01)
 * - authRateLimiter: 20 requests / min / IP for OAuth exchange and refresh (V15)
 */

const rateLimits = new Map();

const privilegedRateLimiter = (options = { windowMs: 60 * 1000, max: 10 }) => {
  return (req, res, next) => {
    // Identify by admin user ID or IP if not authenticated yet
    const key = req.user ? `admin_${req.user._id}` : `ip_${req.ip}`;
    const now = Date.now();

    let record = rateLimits.get(key);
    if (!record) {
      record = { timestamps: [] };
      rateLimits.set(key, record);
    }

    // Filter out timestamps outside window
    record.timestamps = record.timestamps.filter((ts) => now - ts < options.windowMs);

    if (record.timestamps.length >= options.max) {
      return res.status(429).json({
        message: 'Too many provisioning requests. Please wait a minute before retrying.',
        retryAfterSeconds: Math.ceil((options.windowMs - (now - record.timestamps[0])) / 1000),
      });
    }

    record.timestamps.push(now);
    next();
  };
};

function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 60 * 1000; // 1 minute default
  const max = options.max || 20; // 20 requests per window default
  const hits = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    const timestamps = hits.get(ip) || [];
    const validTimestamps = timestamps.filter(ts => now - ts < windowMs);

    if (validTimestamps.length >= max) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json({
        message: 'Too many requests. Please try again later.',
      });
    }

    validTimestamps.push(now);
    hits.set(ip, validTimestamps);
    next();
  };
}

const authRateLimiter = createRateLimiter({ max: 20, windowMs: 60 * 1000 });

/**
 * User endpoints rate limiter (V10 Remediation)
 * Invariant 10: 60 req/min for authenticated user, 10 req/min for unauthenticated IP
 */
const userEndpointRateLimiter = (options = { windowMs: 60 * 1000, authMax: 60, unauthMax: 10 }) => {
  const hits = new Map();
  const jwt = require('jsonwebtoken');

  return (req, res, next) => {
    let userId = req.user ? req.user._id?.toString() : null;

    if (!userId && req.headers.authorization?.startsWith('Bearer ')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.decode(token);
        if (decoded && (decoded.id || decoded._id)) {
          userId = (decoded.id || decoded._id).toString();
        }
      } catch {
        // Fallback to IP if decoding fails
      }
    }

    const isAuth = Boolean(userId);
    const key = isAuth ? `user_${userId}` : `ip_${req.ip || req.connection?.remoteAddress || 'unknown'}`;
    const max = isAuth ? options.authMax : options.unauthMax;
    const now = Date.now();

    let record = hits.get(key);
    if (!record) {
      record = { timestamps: [] };
      hits.set(key, record);
    }

    record.timestamps = record.timestamps.filter((ts) => now - ts < options.windowMs);

    if (record.timestamps.length >= max) {
      const retryAfter = Math.ceil((options.windowMs - (now - record.timestamps[0])) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        message: 'Too many requests on user endpoints. Please try again later.',
        retryAfterSeconds: retryAfter,
      });
    }

    record.timestamps.push(now);
    next();
  };
};

module.exports = {
  privilegedRateLimiter,
  authRateLimiter,
  createRateLimiter,
  userEndpointRateLimiter,
};
