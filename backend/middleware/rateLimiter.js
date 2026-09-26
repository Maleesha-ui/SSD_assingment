/**
 * In-memory sliding-window rate limiter for privileged administrative endpoints.
 * Invariant 10: Rate-limit privileged endpoints (e.g. 10 requests / min / admin).
 */

const rateLimits = new Map();
const { rateLimit } = require('express-rate-limit');

const createIpRateLimiter = (windowMs, limit, message) => rateLimit({
  windowMs,
  limit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message },
});

const loginRateLimiter = createIpRateLimiter(
  15 * 60 * 1000,
  10,
  'Too many login attempts. Please try again later.'
);
const registrationRateLimiter = createIpRateLimiter(
  60 * 60 * 1000,
  5,
  'Too many registration attempts. Please try again later.'
);
const googleAuthRateLimiter = createIpRateLimiter(
  15 * 60 * 1000,
  20,
  'Too many Google authentication requests. Please try again later.'
);
const orderCreationRateLimiter = createIpRateLimiter(
  15 * 60 * 1000,
  20,
  'Too many order creation requests. Please try again later.'
);
const paymentRateLimiter = createIpRateLimiter(
  15 * 60 * 1000,
  10,
  'Too many payment requests. Please try again later.'
);
const emailReceiptRateLimiter = createIpRateLimiter(
  15 * 60 * 1000,
  5,
  'Too many receipt requests. Please try again later.'
);
const adminActionRateLimiter = createIpRateLimiter(
  60 * 1000,
  30,
  'Too many administrative requests. Please try again later.'
);

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

module.exports = {
  privilegedRateLimiter,
  loginRateLimiter,
  registrationRateLimiter,
  googleAuthRateLimiter,
  orderCreationRateLimiter,
  paymentRateLimiter,
  emailReceiptRateLimiter,
  adminActionRateLimiter,
};
