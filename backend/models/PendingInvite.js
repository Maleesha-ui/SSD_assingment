const mongoose = require('mongoose');

const pendingInviteSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      enum: [
        'customer',
        'funeral_staff',
        'hearse_driver',
        'funeral_manager',
        'admin',
        'staff',
        'driver',
        'manager',
      ],
    },
    seedData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    consumedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

pendingInviteSchema.index({ email: 1, consumedAt: 1 });

module.exports = mongoose.model('PendingInvite', pendingInviteSchema);
