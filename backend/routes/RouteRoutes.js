const express = require('express');
const router = express.Router();
const Route = require('../models/RouteModel');
const { protect, authorize } = require('../middleware/auth');

// Get all routes: Admins, Managers, Drivers, Staff
router.get('/', protect, authorize('admin', 'manager', 'funeral_manager', 'hearse_driver', 'driver', 'funeral_staff', 'staff'), async (req, res) => {
  try {
    const routes = await Route.find();
    res.json({ routes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Save a new route: Admins and Managers
router.post('/', protect, authorize('admin', 'manager', 'funeral_manager'), async (req, res) => {
     const route = new Route({
       name: req.body.name,
       startLocation: req.body.startLocation,
       endLocation: req.body.endLocation,
       waypoints: req.body.waypoints || [],
       distance: req.body.distance,
       duration: req.body.duration,
     });
     try {
       const newRoute = await route.save();
       res.status(201).json(newRoute);
     } catch (err) {
       res.status(400).json({ message: err.message });
     }
   });

   module.exports = router;