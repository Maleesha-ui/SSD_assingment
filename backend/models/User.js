const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { 
    type: String, 
    select: false,
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
  // Security Invariant: Role defaults to customer. Public registration can never elevate role.
  role: { 
    type: String, 
    enum: [
      'customer',
      'funeral_staff',
      'hearse_driver',
      'funeral_manager',
      'admin',
      'staff',
      'driver',
      'manager'
    ], 
    default: 'customer',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'pending_invite', 'suspended'],
    default: 'active',
    index: true
  },
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  passwordResetRequired: {
    type: Boolean,
    default: false,
    select: false
  },
  phone: { type: String, trim: true, select: false },
  address: { type: String, trim: true },
  
  // Normalized Role Profile References (Section 6)
  staffProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'FuneralStaffProfile' },
  driverProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'HearseDriverProfile' },
  managerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'FuneralManagerProfile' },
  adminProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminProfile' },
  
  // Auditing: who created/provisioned this user
  provisionedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // Backward compatibility embedded details (preserved for existing dashboard modules)
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
    required: false
  },
  driverDetails: {
    type: {
      licenseNumber: { type: String },
      vehicleAssigned: { type: String },
    },
    required: false
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
    required: false
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
    required: false
  },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
}, { timestamps: true });

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.passwordResetRequired;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);