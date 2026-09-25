const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Route = require('../models/RouteModel');

// All route operations require authentication
router.use(protect);

// Get all routes - accessible by admin, manager, staff, and driver
router.get('/', authorize('admin', 'manager', 'staff', 'driver'), async (req, res) => {
  try {
    const routes = await Route.find();
    res.json({ routes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Save a new route - admin and manager only
router.post('/', authorize('admin', 'manager'), async (req, res) => {
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