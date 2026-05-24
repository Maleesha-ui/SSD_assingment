const express = require('express');
   const router = express.Router();
   const Route = require('../models/RouteModel');

   // Get all routes
   router.get('/', async (req, res) => {
     try {
       const routes = await Route.find();
       res.json({ routes });
     } catch (err) {
       res.status(500).json({ message: err.message });
     }
   });

   // Save a new route
   router.post('/', async (req, res) => {
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