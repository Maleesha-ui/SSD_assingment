const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: { type: String, default: 'https://npwelch.com/wp-content/uploads/2017/12/funeral-service.png'},
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  services: {
    type: [String],
  },
}, { timestamps: true });

module.exports = mongoose.model('FuneralPackage', packageSchema);
