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

exports.register = async (req, res) => {
  try {
    const { 
      name, email, password, userType, phone, address,
      driverDetails, staffDetails, adminDetails, managerDetails
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
      role: userType, 
      phone,
      address
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
        token: generateToken(user._id),
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
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        
        address: user.address,
        ...(user.role === 'driver' && { driverDetails: user.driverDetails }),

        ...(user.role === 'staff' && { staffDetails: user.staffDetails }),
        ...(user.role === 'admin' && { adminDetails: user.adminDetails }),
        ...(user.role === 'manager' && { managerDetails: user.managerDetails }),

        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
}; 