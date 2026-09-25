const User = require('../models/User');
const Staff = require('../models/Staff');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate a unique ID for a specific role
const generateUniqueId = (role, prefix) => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp.slice(-6)}-${random}`;
};

const generateToken = (id, role = 'customer') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

exports.register = async (req, res) => {
  try {
    const { 
      name, email, password, userType, phone, address,
      driverDetails, staffDetails, adminDetails, managerDetails
    } = req.body;

    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: userType || 'customer', 
      phone,
      address,
      authProvider: 'local',
      isProfileComplete: true,
    };

    switch(userType) {
      case 'staff':
        const staffId = staffDetails?.employeeId || generateUniqueId('staff', 'STF');
        userData.staffDetails = {
          staffId,
          department: staffDetails?.department || '',
          designation: 'Staff',
          joinedDate: new Date()
        };
        break;
        
      case 'admin':
        userData.adminDetails = {
          adminId: generateUniqueId('admin', 'ADM'),
          accessLevel: adminDetails?.accessLevel || 'full',
          lastLogin: new Date()
        };
        break;
        
      case 'manager':
        userData.managerDetails = {
          managerId: generateUniqueId('manager', 'MGR'),
          department: managerDetails?.department || '',
          reportingTo: managerDetails?.reportingTo || ''
        };
        break;
        
      case 'driver':
        userData.driverDetails = driverDetails || {
          licenseNumber: driverDetails?.licenseNumber || '',
          vehicleAssigned: driverDetails?.vehicleAssigned || ''
        };
        break;
    }

    const user = await User.create(userData);

    if (userType === 'staff' || userType === 'manager') {
      await Staff.create({ userId: user._id });
    }

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
        token: generateToken(user._id, user.role),
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
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
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        isProfileComplete: user.isProfileComplete,
        ...(user.role === 'driver' && { driverDetails: user.driverDetails }),
        ...(user.role === 'staff' && { staffDetails: user.staffDetails }),
        ...(user.role === 'admin' && { adminDetails: user.adminDetails }),
        ...(user.role === 'manager' && { managerDetails: user.managerDetails }),
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
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
      isProfileComplete: user.isProfileComplete,
      ...(user.role === 'driver' && { driverDetails: user.driverDetails }),
      ...(user.role === 'staff' && { staffDetails: user.staffDetails }),
      ...(user.role === 'admin' && { adminDetails: user.adminDetails }),
      ...(user.role === 'manager' && { managerDetails: user.managerDetails }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Complete profile after Google OAuth registration
// @route PUT /api/auth/complete-profile
// @access Private
exports.completeProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, role, phone, address, driverDetails, staffDetails } = req.body;

    // Strict validation to prevent Privilege Escalation (OWASP A01: Broken Access Control)
    const allowedSelfRoles = ['customer', 'staff', 'driver'];
    const targetRole = role || user.role || 'customer';

    if (!allowedSelfRoles.includes(targetRole)) {
      return res.status(403).json({ 
        message: 'Unauthorized role assignment. Administrative roles cannot be self-selected.' 
      });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }
    if (phone) {
      user.phone = phone.trim();
    }
    if (address) {
      user.address = address.trim();
    }

    user.role = targetRole;

    if (targetRole === 'staff') {
      const staffId = staffDetails?.employeeId || generateUniqueId('staff', 'STF');
      user.staffDetails = {
        staffId,
        department: staffDetails?.department || 'Operations',
        designation: 'Staff',
        joinedDate: new Date()
      };
      await Staff.findOneAndUpdate(
        { userId: user._id },
        { userId: user._id },
        { upsert: true, new: true }
      );
    } else if (targetRole === 'driver') {
      user.driverDetails = {
        licenseNumber: driverDetails?.licenseNumber || '',
        vehicleAssigned: driverDetails?.vehicleAssigned || ''
      };
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
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        isProfileComplete: user.isProfileComplete,
        ...(user.role === 'driver' && { driverDetails: user.driverDetails }),
        ...(user.role === 'staff' && { staffDetails: user.staffDetails }),
      }
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ message: error.message || 'Server error completing profile' });
  }
};

// @desc Authenticate with Google ID Token (from @react-oauth/google component)
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
        // 3. Create new user
        isNewUser = true;
        user = await User.create({
          googleId,
          name,
          email,
          avatar,
          role: 'customer',
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
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        isProfileComplete: user.isProfileComplete,
        ...(user.role === 'driver' && { driverDetails: user.driverDetails }),
        ...(user.role === 'staff' && { staffDetails: user.staffDetails }),
        ...(user.role === 'admin' && { adminDetails: user.adminDetails }),
        ...(user.role === 'manager' && { managerDetails: user.managerDetails }),
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