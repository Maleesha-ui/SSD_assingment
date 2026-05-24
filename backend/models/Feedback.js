// models/Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceType: {
    type: String,
    enum: ['Funeral Arrangement', 'Transportation', 'Floral Services', 'Catering', 'General Feedback'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'archived'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);