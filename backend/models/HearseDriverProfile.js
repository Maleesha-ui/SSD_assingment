const mongoose = require('mongoose');

const hearseDriverProfileSchema = new mongoose.Schema(
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
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    licenseClass: {
      type: String,
      required: true,
      trim: true,
    },
    licenseExpiry: {
      type: Date,
      required: true,
    },
    medicalCertificateExpiry: {
      type: Date,
      required: true,
    },
    backgroundCheckDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    assignedVehicleId: {
      type: String,
      default: null,
    },
    availabilitySchedule: {
      type: String,
      default: 'Full-time on-call',
    },
    emergencyContact: {
      name: { type: String, default: '' },
      relation: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HearseDriverProfile', hearseDriverProfileSchema);
