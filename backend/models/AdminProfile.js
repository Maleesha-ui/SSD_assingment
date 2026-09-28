const mongoose = require('mongoose');

const adminProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    accessTier: {
      type: String,
      enum: ['super_admin', 'ops_admin', 'support_admin'],
      default: 'ops_admin',
      required: true,
    },
    managedBranch: {
      type: String,
      default: 'Headquarters',
    },
    reportingTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    hireDate: {
      type: Date,
      default: Date.now,
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
      min: 0,
    },
    managementCertifications: [
      {
        name: { type: String },
        expiry: { type: Date },
      },
    ],
    emergencyContact: {
      name: { type: String, default: '' },
      relation: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    forcePasswordReset: {
      type: Boolean,
      default: true,
    },
    mfaEnrolled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminProfile', adminProfileSchema);
