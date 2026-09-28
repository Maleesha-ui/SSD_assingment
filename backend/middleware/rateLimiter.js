/**
 * In-memory sliding-window rate limiter for privileged administrative endpoints.
 * Invariant 10: Rate-limit privileged endpoints (e.g. 10 requests / min / admin).
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

module.exports = { privilegedRateLimiter };
