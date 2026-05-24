const mongoose = require('mongoose');

   const routeSchema = new mongoose.Schema({
     name: { type: String, required: true },
     startLocation: {
       address: String,
       coordinates: [Number], // [longitude, latitude]
     },
     endLocation: {
       address: String,
       coordinates: [Number], // [longitude, latitude]
     },
     waypoints: [{
       address: String,
       coordinates: [Number], // [longitude, latitude]
     }],
     distance: Number, // in meters
     duration: Number, // in seconds
     createdAt: { type: Date, default: Date.now },
   });

   module.exports = mongoose.model('RouteModel', routeSchema);