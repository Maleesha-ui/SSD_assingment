const express = require('express');
const router = express.Router();
const passport = require('passport');
const { 
  register, 
  login, 
  getMe, 
  completeProfile, 
  googleTokenAuth, 
  googleCallbackHandler,
  oauthExchange,
  refreshTokenHandler,
  logoutHandler,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateDto, publicRegisterDto } = require('../middleware/validate');
const { authRateLimiter } = require('../middleware/rateLimiter');

const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

// Invariant 1 & 3: DTO Whitelisting rejects unknown fields (e.g. role, isAdmin, permissions) with 400
router.post('/register', validateDto(publicRegisterDto), register);
router.post('/login', login);

// Profile and session management routes
router.get('/me', protect, getMe);
router.put('/complete-profile', protect, completeProfile);

// Google token verification route (for modern Google Identity Services / @react-oauth/google)
router.post('/google-token', googleTokenAuth);

// Google OAuth redirect initiation route (Passport Strategy) with PKCE capture
router.get(
  '/google',
  (req, res, next) => {
    // Preserve PKCE challenge, state, and client redirectUri in session
    if (!req.session) req.session = {};
    req.session.oauth = {
      codeChallenge: req.query.code_challenge || '',
      codeChallengeMethod: req.query.code_challenge_method || 'S256',
      redirectUri: req.query.redirect_uri || `${clientUrl}/auth/callback`,
      state: req.query.state || null,
    };

    const authenticateGoogle = passport.authenticate('google', {
      scope: ['profile', 'email'],
      prompt: 'select_account',
    });

    if (typeof req.session.save === 'function') {
      req.session.save((err) => {
        if (err) console.error('OAuth session save error:', err);
        authenticateGoogle(req, res, next);
      });
    } else {
      authenticateGoogle(req, res, next);
    }
  }
);

// Google OAuth callback route (Hardened with custom wrapper to redirect cleanly on token error)
router.get('/google/callback', (req, res, next) => {
  // Restore authentic authorization code if redacted by logging middleware
  if (req._rawQuery && req._rawQuery.code) {
    req.query.code = req._rawQuery.code;
  }

  passport.authenticate('google', { session: false }, (err, user, info) => {
    // Re-mask query code to prevent memory leakage
    if (req.query && req.query.code) {
      req.query.code = '[REDACTED]';
    }

    if (err) {
      console.error('Google OAuth callback error:', err.message || err);
      return res.redirect(`${clientUrl}/login?error=google_auth_failed`);
    }
    if (!user) {
      console.warn('Google OAuth callback failed: No user returned', info);
      return res.redirect(`${clientUrl}/login?error=google_auth_failed`);
    }
    req.user = user;
    return googleCallbackHandler(req, res, next);
  })(req, res, next);
});

// One-Time PKCE Authorization Code Exchange (POST only, 405 on GET)
router.post('/oauth/exchange', authRateLimiter, oauthExchange);
router.all('/oauth/exchange', (req, res) => {
  res.setHeader('Allow', 'POST');
  return res.status(405).json({ message: 'Method Not Allowed. Use POST.' });
});

// Refresh Token Rotation (Cookie or JSON body)
router.post('/refresh', authRateLimiter, refreshTokenHandler);

// Logout & Refresh Family Revocation
router.post('/logout', logoutHandler);

module.exports = router;