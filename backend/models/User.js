const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { 
    type: String, 
    required: function() { 
      // Password is required for traditional local registration, but optional for OAuth accounts
      return !this.googleId; 
    } 
  },
  googleId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  avatar: { type: String },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  role: { 
    type: String, 
    enum: ['admin', 'manager', 'staff', 'driver', 'customer'], 
    default: 'customer',
    required: true 
  },
  phone: { type: String },
  address: { type: String },
  staffDetails: {
    type: {
      staffId: { 
        type: String, 
        sparse: true,
        index: { 
          unique: true,
          partialFilterExpression: { 'staffDetails.staffId': { $exists: true, $ne: null } }
        }
      },
      dateOfBirth: { type: Date },
      nicNo: { type: String },
      gender: { type: String, enum: ['male', 'female'] },
      maritalStatus: { type: String, enum: ['single', 'married'] },
      designation: { type: String },
      department: { type: String },
      salary: { type: Number },
      joinedDate: { type: Date, default: Date.now },
    },
    required: function() { return this.role === 'staff' || this.role === 'manager'; }
  },
  driverDetails: {
    type: {
      licenseNumber: { type: String },
      vehicleAssigned: { type: String },
    },
    required: function() { return this.role === 'driver'; }
  },
  adminDetails: {
    type: {
      adminId: { 
        type: String,
        sparse: true,
        index: { 
          unique: true,
          partialFilterExpression: { 'adminDetails.adminId': { $exists: true, $ne: null } }
        }
      },
      accessLevel: { type: String, enum: ['full', 'limited'], default: 'full' },
      lastLogin: { type: Date },
    },
    required: function() { return this.role === 'admin'; }
  },
  managerDetails: {
    type: {
      managerId: { 
        type: String,
        sparse: true,
        index: { 
          unique: true,
          partialFilterExpression: { 'managerDetails.managerId': { $exists: true, $ne: null } }
        }
      },
      department: { type: String },
      reportingTo: { type: String },
    },
    required: function() { return this.role === 'manager'; }
  },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);