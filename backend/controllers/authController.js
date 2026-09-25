const crypto = require('crypto');
const User = require('../models/User');
const OAuthExchangeCode = require('../models/OAuthExchangeCode');
const RefreshToken = require('../models/RefreshToken');
const AuditLog = require('../models/AuditLog');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { processInviteForUser } = require('../utils/inviteHandler');

const generateToken = (id, role = 'customer') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

/**
 * Public Self-Registration (Email + Password)
 * Invariant 1: Public registration NEVER reads role from the request body.
 * Server assigns role = 'customer' and status = 'active'.
 * Returns sanitized user object (no password hash, no internal flags).
 */
exports.register = async (req, res) => {
  try {
    const { name, fullName, email, password, phone, address } = req.body;

    const displayName = (name || fullName || '').trim();
    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    if (!displayName || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required fields.' });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Hardened User Object: strictly customer, active
    const userData = {
      name: displayName,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'customer', // Strictly hardcoded server-side
      status: 'active',
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
      authProvider: 'local',
      isProfileComplete: true,
    };

    const user = await User.create(userData);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone,
      address: user.address,
      isProfileComplete: user.isProfileComplete,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Account is suspended. Contact administrator.' });
    }

    if (!user.password && user.googleId) {
      return res.status(400).json({ 
        message: 'This account is linked with Google. Please use "Continue with Google" to sign in.' 
      });
    }

    if (await bcrypt.compare(password, user.password)) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        isProfileComplete: user.isProfileComplete,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get authenticated user profile
// @route GET /api/auth/me
// @access Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('staffProfile')
      .populate('driverProfile')
      .populate('managerProfile')
      .populate('adminProfile');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
      isProfileComplete: user.isProfileComplete,
      staffProfile: user.staffProfile,
      driverProfile: user.driverProfile,
      managerProfile: user.managerProfile,
      adminProfile: user.adminProfile,
      ...(user.staffDetails && { staffDetails: user.staffDetails }),
      ...(user.driverDetails && { driverDetails: user.driverDetails }),
      ...(user.adminDetails && { adminDetails: user.adminDetails }),
      ...(user.managerDetails && { managerDetails: user.managerDetails }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Complete profile after Google OAuth registration
// @route PUT /api/auth/complete-profile
// @access Private
// Hardened: DOES NOT PERMIT ROLE ELEVATION OR MODIFICATION
exports.completeProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, phone, address } = req.body;

    if (name && name.trim()) {
      user.name = name.trim();
    }
    if (phone) {
      user.phone = phone.trim();
    }
    if (address) {
      user.address = address.trim();
    }

    user.isProfileComplete = true;
    await user.save();

    const token = generateToken(user._id, user.role);

    res.json({
      message: 'Profile completed successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        isProfileComplete: user.isProfileComplete,
      }
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ message: error.message || 'Server error completing profile' });
  }
};

// @desc Authenticate with Google ID Token
// @route POST /api/auth/google-token
// @access Public
exports.googleTokenAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential token is required' });
    }

    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Invalid Google token payload' });
    }

    // Reject tokens without a verified email (Section 10)
    if (payload.email_verified === false) {
      return res.status(403).json({ message: 'Google email must be verified.' });
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase().trim();
    const name = payload.name || payload.given_name || email.split('@')[0];
    const avatar = payload.picture || '';

    // 1. Check if user already exists by googleId
    let user = await User.findOne({ googleId });
    let isNewUser = false;

    if (!user) {
      // 2. Check if user exists by email (Account Linking)
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        if (!user.avatar && avatar) user.avatar = avatar;
        user.isProfileComplete = true;
        await user.save();
      } else {
        // 3. Create new user with server-side literal role = 'customer'
        isNewUser = true;
        user = await User.create({
          googleId,
          name,
          email,
          avatar,
          role: 'customer', // Invariant 1: server-side hardcoded literal
          status: 'active',
          authProvider: 'google',
          isProfileComplete: false,
        });
      }
    } else {
      if (!user.avatar && avatar) {
        user.avatar = avatar;
        await user.save();
      }
    }

    // 4. Invite Flow Check (Section 5.2 & 5.7 & Section 10):
    // If the Google email matches an unconsumed PendingInvite, promote role inside atomic operation
    await processInviteForUser(user, email, req);

    const token = generateToken(user._id, user.role);

    res.json({
      token,
      isNewUser,
      isProfileComplete: user.isProfileComplete,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        isProfileComplete: user.isProfileComplete,
      }
    });
  } catch (error) {
    console.error('Google token verification error:', error);
    res.status(401).json({ message: 'Google authentication failed: ' + error.message });
  }
};

// @desc Google OAuth Passport Callback Handler (V15 Remediation)
// Eliminates token delivery via URL query string.
// Supports Pattern B (one-time code exchange) by default, and Pattern A (cookie) via feature flag.
// @route GET /api/auth/google/callback
// @access Public (Passport)
exports.googleCallbackHandler = async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(`${clientUrl}/login?error=auth_failed`);
    }

    const deliveryMode = process.env.AUTH_OAUTH_DELIVERY || 'code';

    // Pattern A: Direct HttpOnly + Secure + SameSite cookie delivery
    if (deliveryMode === 'cookie') {
      const token = generateToken(user._id, user.role);

      // Issue rotating refresh token
      const rawRefreshToken = crypto.randomBytes(32).toString('base64url');
      const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
      const jti = crypto.randomUUID();
      const familyId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await RefreshToken.create({
        userId: user._id,
        jti,
        tokenHash,
        familyId,
        expiresAt,
        ip: req.ip,
        userAgent: req.headers?.['user-agent'] || '',
      });

      // Invariant 6: Secure, HttpOnly, SameSite=Lax cookies
      res.cookie('at', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
        maxAge: 15 * 60 * 1000, // 15 mins
      });

      res.cookie('rt', rawRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      await AuditLog.create({
        actorId: user._id,
        targetUserId: user._id,
        action: 'auth.oauth.cookie_issued',
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: { deliveryMode: 'cookie', jti, familyId },
      });

      // Invariant 1: Zero tokens in URL!
      return res.redirect(`${clientUrl}/oauth/done`);
    }

    // Pattern B (Default): Short-lived (60s), single-use exchange code
    const exchangeCode = crypto.randomBytes(32).toString('base64url'); // 43 chars <= 64 chars
    const codeHash = crypto.createHash('sha256').update(exchangeCode).digest('hex');

    const codeChallenge = req.session?.oauth?.codeChallenge || '';
    const redirectUri = req.session?.oauth?.redirectUri || `${clientUrl}/auth/callback`;
    const state = req.session?.oauth?.state || null;

    // Invariant 3: Raw code is NEVER stored in database, only SHA-256 hash
    await OAuthExchangeCode.create({
      codeHash,
      userId: user._id,
      clientId: process.env.GOOGLE_CLIENT_ID || 'google-client-id',
      redirectUri,
      codeChallenge,
      codeChallengeMethod: 'S256',
      state,
      createdAt: new Date(),
    });

    await AuditLog.create({
      actorId: user._id,
      targetUserId: user._id,
      action: 'auth.oauth.code_issued',
      ip: req.ip,
      userAgent: req.headers?.['user-agent'] || '',
      metadata: { redirectUri, codeLength: exchangeCode.length },
    });

    if (req.session?.oauth) {
      delete req.session.oauth;
    }

    // Redirect with opaque exchange code ONLY (NOT a JWT, no bearer token)
    return res.redirect(`${clientUrl}/auth/callback?code=${exchangeCode}`);
  } catch (error) {
    console.error('Google callback error:', error);
    return res.redirect(`${clientUrl}/login?error=server_error`);
  }
};

// @desc One-Time OAuth Code Exchange
// @route POST /api/auth/oauth/exchange
// @access Public (POST only)
exports.oauthExchange = async (req, res) => {
  try {
    const { code, codeVerifier, redirectUri } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Exchange code is required.' });
    }

    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    // Invariant 3: Single-use delete-on-read atomic operation
    const exchangeDoc = await OAuthExchangeCode.findOneAndDelete({ codeHash });

    if (!exchangeDoc) {
      // Possible reuse attempt, expired, or invalid code
      await AuditLog.create({
        action: 'auth.oauth.code_reuse_detected',
        ip: req.ip,
        userAgent: req.headers?.['user-agent'] || '',
        metadata: { attemptedHash: codeHash },
      });
      return res.status(401).json({ message: 'Invalid, expired, or already consumed exchange code.' });
    }

    // Invariant 3: <= 60 seconds TTL enforcement
    const ageSeconds = (Date.now() - new Date(exchangeDoc.createdAt).getTime()) / 1000;
    if (ageSeconds > 60) {
      return res.status(401).json({ message: 'Exchange code has expired.' });
    }

    // Invariant 4: PKCE S256 validation
    if (exchangeDoc.codeChallenge) {
      if (!codeVerifier) {
        return res.status(401).json({ message: 'PKCE codeVerifier is required.' });
      }

      // RFC 7636 §4.1: codeVerifier format check
      const pkceRegex = /^[A-Za-z0-9\-._~]{43,128}$/;
      if (!pkceRegex.test(codeVerifier)) {
        return res.status(401).json({ message: 'Invalid PKCE codeVerifier format.' });
      }

      const calculatedChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64url');

      if (calculatedChallenge !== exchangeDoc.codeChallenge) {
        return res.status(401).json({ message: 'PKCE verification failed: verifier does not match challenge.' });
      }
    }

    // Validate redirect_uri binding if provided
    if (redirectUri && exchangeDoc.redirectUri && redirectUri !== exchangeDoc.redirectUri) {
      return res.status(401).json({ message: 'redirect_uri mismatch.' });
    }

    const user = await User.findById(exchangeDoc.userId);
    if (!user) {
      return res.status(401).json({ message: 'User associated with code not found.' });
    }

    // Issue JWT access token
    const accessToken = generateToken(user._id, user.role);

    // Issue rotating refresh token
    const rawRefreshToken = crypto.randomBytes(32).toString('base64url');
    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
    const jti = crypto.randomUUID();
    const familyId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Invariant 19: Only tokenHash is stored in MongoDB, never raw token
    await RefreshToken.create({
      userId: user._id,
      jti,
      tokenHash,
      familyId,
      expiresAt,
      ip: req.ip,
      userAgent: req.headers?.['user-agent'] || '',
    });

    // Invariant 6: Refresh token delivered in HttpOnly Secure SameSite cookie
    res.cookie('rt', rawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await AuditLog.create({
      actorId: user._id,
      targetUserId: user._id,
      action: 'auth.oauth.code_exchanged',
      ip: req.ip,
      userAgent: req.headers?.['user-agent'] || '',
      metadata: { jti, familyId },
    });

    // Invariant 2 & Rule 7: Refresh token is NEVER in response body
    return res.status(200).json({
      accessToken,
      isProfileComplete: user.isProfileComplete,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        isProfileComplete: user.isProfileComplete,
      },
    });
  } catch (error) {
    console.error('OAuth exchange error:', error);
    return res.status(500).json({ message: 'Server error during OAuth exchange.' });
  }
};

// @desc Refresh Token Rotation
// @route POST /api/auth/refresh
// @access Public (Cookie or Body)
exports.refreshTokenHandler = async (req, res) => {
  try {
    const rawRefreshToken = req.cookies?.rt || req.body?.refreshToken;
    if (!rawRefreshToken) {
      return res.status(401).json({ message: 'Refresh token required.' });
    }

    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
    const existingToken = await RefreshToken.findOne({ tokenHash });

    if (!existingToken) {
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }

    // Invariant 8 & Acceptance Criteria 14: Refresh Token Reuse Detection
    if (existingToken.revokedAt) {
      // Replay attack detected: Revoke entire token family immediately
      await RefreshToken.updateMany(
        { familyId: existingToken.familyId },
        { revokedAt: new Date() }
      );

      res.clearCookie('rt', { path: '/' });
      res.clearCookie('at', { path: '/' });

      await AuditLog.create({
        actorId: existingToken.userId,
        targetUserId: existingToken.userId,
        action: 'auth.oauth.refresh_reuse_detected',
        ip: req.ip,
        userAgent: req.headers?.['user-agent'] || '',
        metadata: { familyId: existingToken.familyId, reusedJti: existingToken.jti },
      });

      return res.status(401).json({
        message: 'Security warning: Refresh token reuse detected. All sessions revoked.',
      });
    }

    // Expiry check
    if (existingToken.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Refresh token expired.' });
    }

    // Rotate: Revoke current token and generate replacement inside same family
    const newJti = crypto.randomUUID();
    existingToken.revokedAt = new Date();
    existingToken.replacedByJti = newJti;
    await existingToken.save();

    const newRawRefreshToken = crypto.randomBytes(32).toString('base64url');
    const newTokenHash = crypto.createHash('sha256').update(newRawRefreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
      userId: existingToken.userId,
      jti: newJti,
      tokenHash: newTokenHash,
      familyId: existingToken.familyId,
      expiresAt,
      ip: req.ip,
      userAgent: req.headers?.['user-agent'] || '',
    });

    const user = await User.findById(existingToken.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    const newAccessToken = generateToken(user._id, user.role);

    // Set rotated refresh cookie
    res.cookie('rt', newRawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    if (process.env.AUTH_OAUTH_DELIVERY === 'cookie') {
      res.cookie('at', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
        maxAge: 15 * 60 * 1000,
      });
    }

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({ message: 'Server error refreshing token.' });
  }
};

// @desc Logout & Revoke Refresh Family
// @route POST /api/auth/logout
// @access Public / Authenticated
exports.logoutHandler = async (req, res) => {
  try {
    const rawRefreshToken = req.cookies?.rt || req.body?.refreshToken;
    if (rawRefreshToken) {
      const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
      const tokenDoc = await RefreshToken.findOne({ tokenHash });
      if (tokenDoc) {
        await RefreshToken.updateMany(
          { familyId: tokenDoc.familyId },
          { revokedAt: new Date() }
        );
      }
    }

    res.clearCookie('rt', { path: '/' });
    res.clearCookie('at', { path: '/' });

    return res.status(204).send();
  } catch (error) {
    console.error('Logout error:', error);
    res.clearCookie('rt', { path: '/' });
    res.clearCookie('at', { path: '/' });
    return res.status(204).send();
  }
};

exports.generateToken = generateToken;