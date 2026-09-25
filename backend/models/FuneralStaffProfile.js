const mongoose = require('mongoose');

const funeralStaffProfileSchema = new mongoose.Schema(
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
    department: {
      type: String,
      required: true,
      trim: true,
    },
    branch: {
      type: String,
      required: true,
      trim: true,
    },
    hireDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dateOfBirth: {
      type: Date,
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract'],
      required: true,
      default: 'full-time',
    },
    certifications: [
      {
        name: { type: String, required: true },
        expiry: { type: Date, required: true },
      },
    ],
    emergencyContact: {
      name: { type: String, default: '' },
      relation: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    shift: {
      type: String,
      enum: ['morning', 'evening', 'night', 'rotating'],
      required: true,
      default: 'morning',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FuneralStaffProfile', funeralStaffProfileSchema);
