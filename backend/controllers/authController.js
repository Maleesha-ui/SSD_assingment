const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { processInviteForUser } = require('../utils/inviteHandler');
const { getJwtSecret } = require('../config/jwtSecrets');

const generateToken = (id, role = 'customer') => {
  return jwt.sign({ id, role }, getJwtSecret(), {
    expiresIn: '1h',
    algorithm: 'HS256',
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

// @desc Google OAuth Passport Callback Handler
// @route GET /api/auth/google/callback
// @access Public (Passport)
exports.googleCallbackHandler = async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(`${clientUrl}/login?error=auth_failed`);
    }

    const token = generateToken(user._id, user.role);

    if (!user.isProfileComplete) {
      return res.redirect(`${clientUrl}/complete-profile?token=${token}&isNew=true`);
    }

    return res.redirect(`${clientUrl}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Google callback error:', error);
    return res.redirect(`${clientUrl}/login?error=server_error`);
  }
};

exports.generateToken = generateToken;