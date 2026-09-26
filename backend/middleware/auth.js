const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.at) {
      token = req.cookies.at;
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Account is suspended.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

// Admin middleware - Invariant 4: server-side RBAC guard
const admin = async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    // Invariant 9: Generic 403 authorization denial
    res.status(403).json({ message: 'Forbidden: Insufficient privileges.' });
  }
};

// Step-Up Authentication Guard - Invariant 2 & 8: Fresh re-auth <= 5 min for admin provisioning
const stepUpAuth = async (req, res, next) => {
  try {
    const stepUpToken = req.headers['x-step-up-token'] || req.body?.stepUpToken;

    if (!stepUpToken) {
      return res.status(403).json({ 
        message: 'Forbidden: High-privilege step-up authentication required.' 
      });
    }

    const secret = process.env.STEP_UP_SECRET || (process.env.JWT_SECRET + '_stepup');
    const decoded = jwt.verify(stepUpToken, secret);

    if (!decoded || decoded.action !== 'step-up') {
      return res.status(403).json({ message: 'Forbidden: Invalid step-up token.' });
    }

    if (decoded.adminId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: Step-up token does not match actor.' });
    }

    // Token freshness check: must be <= 5 minutes old (300 seconds)
    const tokenAgeSeconds = (Date.now() / 1000) - decoded.iat;
    if (tokenAgeSeconds > 300) {
      return res.status(403).json({ message: 'Forbidden: Step-up authentication expired. Fresh verification required.' });
    }

    req.stepUp = decoded;
    next();
  } catch (err) {
    console.error('Step-up verification error:', err.message);
    return res.status(403).json({ message: 'Forbidden: Step-up authentication failed.' });
  }
};

// Manager middleware
const manager = async (req, res, next) => {
  if (req.user && (req.user.role === 'manager' || req.user.role === 'funeral_manager')) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Insufficient privileges.' });
  }
};

// Staff middleware
const staff = async (req, res, next) => {
  if (req.user && (req.user.role === 'staff' || req.user.role === 'funeral_staff')) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Insufficient privileges.' });
  }
};

// Driver middleware
const driver = async (req, res, next) => {
  if (req.user && (req.user.role === 'driver' || req.user.role === 'hearse_driver')) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Insufficient privileges.' });
  }
};

// Customer middleware
const customer = async (req, res, next) => {
  if (req.user && req.user.role === 'customer') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Insufficient privileges.' });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    const roleMatches = roles.includes(req.user.role) ||
      (roles.includes('manager') && req.user.role === 'funeral_manager') ||
      (roles.includes('staff') && req.user.role === 'funeral_staff') ||
      (roles.includes('driver') && req.user.role === 'hearse_driver');

    if (!roleMatches) {
      return res.status(403).json({ 
        message: 'Forbidden: Insufficient privileges.' 
      });
    }
    
    next();
  };
};

/**
 * Self or Role authorization guard (V10 Remediation)
 * Invariants 3 & 4: Caller must be self (req.user._id === targetId) or have specified role
 * Invariant 5: Invalid ObjectId returns 400 Bad Request
 * Invariant 6: Uniform 403 Forbidden prevents existence leakage
 */
const requireSelfOrRole = (...roles) => {
  const mongoose = require('mongoose');
  return (req, res, next) => {
    const targetId = req.params.userId || req.params.id;
    if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: 'Invalid user ID format.' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user context' });
    }

    const isSelf = String(req.user._id) === String(targetId);
    const hasRole = roles.includes(req.user.role) ||
      (roles.includes('manager') && req.user.role === 'funeral_manager') ||
      (roles.includes('staff') && req.user.role === 'funeral_staff') ||
      (roles.includes('driver') && req.user.role === 'hearse_driver');

    if (!isSelf && !hasRole) {
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges.' });
    }

    req.targetUserId = targetId;
    req.isSelf = isSelf;
    next();
  };
};

module.exports = {
  protect,
  admin,
  stepUpAuth,
  manager,
  staff,
  driver,
  customer,
  authorize,
  requireSelfOrRole,
};