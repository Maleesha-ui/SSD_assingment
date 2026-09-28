const mongoose = require('mongoose');

const funeralManagerProfileSchema = new mongoose.Schema(
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
    managedBranch: {
      type: String,
      required: true,
      trim: true,
    },
    reportingTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hireDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    yearsOfExperience: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    managementCertifications: [
      {
        name: { type: String, required: true },
        expiry: { type: Date },
      },
    ],
    emergencyContact: {
      name: { type: String, default: '' },
      relation: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FuneralManagerProfile', funeralManagerProfileSchema);
