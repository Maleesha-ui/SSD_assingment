const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  contact: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  package: { type: String, required: true },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
