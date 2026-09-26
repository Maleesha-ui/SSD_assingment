const express = require('express');
const router = express.Router();
const passport = require('passport');
const { 
  register, 
  login, 
  getMe, 
  completeProfile, 
  googleTokenAuth, 
  googleCallbackHandler 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateDto, publicRegisterDto } = require('../middleware/validate');
const {
  loginRateLimiter,
  registrationRateLimiter,
  googleAuthRateLimiter,
} = require('../middleware/rateLimiter');

const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

// Invariant 1 & 3: DTO Whitelisting rejects unknown fields (e.g. role, isAdmin, permissions) with 400
router.post('/register', registrationRateLimiter, validateDto(publicRegisterDto), register);
router.post('/login', loginRateLimiter, login);

// Profile and session management routes
router.get('/me', protect, getMe);
router.put('/complete-profile', protect, completeProfile);

// Google token verification route (for modern Google Identity Services / @react-oauth/google)
router.post('/google-token', googleAuthRateLimiter, googleTokenAuth);

// Google OAuth redirect initiation route (Passport Strategy)
router.get(
  '/google',
  googleAuthRateLimiter,
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })
);

// Google OAuth callback route
router.get(
  '/google/callback',
  googleAuthRateLimiter,
  passport.authenticate('google', {
    failureRedirect: `${clientUrl}/login?error=google_auth_failed`,
    session: false,
  }),
  googleCallbackHandler
);

module.exports = router;