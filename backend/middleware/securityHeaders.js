/**
 * Security Headers Middleware (V15 Hardening)
 * - Referrer-Policy: strict-origin-when-cross-origin (no-referrer on OAuth callbacks)
 * - Cache-Control: no-store on all authentication routes
 * - X-Content-Type-Options, X-Frame-Options
 */
function securityHeaders(req, res, next) {
  // 1. Referrer-Policy: strict-origin-when-cross-origin by default, no-referrer for OAuth callbacks
  if (req.path.includes('/google/callback') || req.path.includes('/oauth')) {
    res.setHeader('Referrer-Policy', 'no-referrer');
  } else {
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  // 2. Cache-Control: no-store on all auth routes
  if (req.originalUrl && req.originalUrl.includes('/auth/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  // 3. MIME sniffing & framing protections
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  next();
}

/**
 * Log Redaction Middleware
 * Redacts tokens, codes, and bearer credentials from query params and request logs.
 */
function logRedactor(req, res, next) {
  if (req.query) {
    req._rawQuery = { ...req.query };
    const sensitiveKeys = ['token', 'access_token', 'refresh_token', 'code', 'id_token', 'credential'];
    sensitiveKeys.forEach(key => {
      if (req.query[key]) {
        // Redact for any downstream logger that inspects req.query
        req.query[key] = '[REDACTED]';
      }
    });
  }

  // Sanitize URLs for access loggers (Morgan) to prevent leaking codes/tokens in server logs
  if (req.url) {
    req.url = req.url.replace(/([?&](?:code|token|access_token|refresh_token|credential)=)[^&]+/gi, '$1[REDACTED]');
  }
  if (req.originalUrl) {
    req.originalUrl = req.originalUrl.replace(/([?&](?:code|token|access_token|refresh_token|credential)=)[^&]+/gi, '$1[REDACTED]');
  }

  next();
}

/**
 * Cookie Parser Middleware
 * Parses incoming Cookie header into req.cookies without adding heavy external dependencies
 */
const cookie = require('cookie');
function parseCookies(req, res, next) {
  if (req.headers.cookie) {
    try {
      req.cookies = cookie.parse(req.headers.cookie);
    } catch {
      req.cookies = {};
    }
  } else {
    req.cookies = {};
  }
  next();
}

module.exports = {
  securityHeaders,
  logRedactor,
  parseCookies,
};
