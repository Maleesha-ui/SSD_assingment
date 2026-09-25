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

module.exports = {
  privilegedRateLimiter,
  authRateLimiter,
  createRateLimiter,
};
