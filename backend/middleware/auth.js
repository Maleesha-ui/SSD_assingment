const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

// Admin middleware
const admin = async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

// Manager middleware
const manager = async (req, res, next) => {
  if (req.user && req.user.role === 'manager') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as manager' });
  }
};

// Staff middleware
const staff = async (req, res, next) => {
  if (req.user && req.user.role === 'staff') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as staff' });
  }
};

// Driver middleware
const driver = async (req, res, next) => {
  if (req.user && req.user.role === 'driver') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as driver' });
  }
};

// Customer middleware
const customer = async (req, res, next) => {
  if (req.user && req.user.role === 'customer') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as customer' });
  }
}; // Added the missing closing brace here

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    
    next();
  };
};

module.exports = {
  protect,
  admin,
  manager,
  staff,
  driver,
  customer,
  authorize
};