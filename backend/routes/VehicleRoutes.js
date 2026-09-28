const express = require("express");
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

//Insert Model
const Vehicle = require("../models/VehicleModel")
//insert driver controller
const VehicleController =require("../controllers/VehicleController")

// All vehicle routes require authentication
router.use(protect);

// Read operations - accessible by admin, manager, staff, and driver
router.get("/", authorize('admin', 'manager', 'staff', 'driver'), VehicleController.getAllVehicles);
router.get("/:id", authorize('admin', 'manager', 'staff', 'driver'), VehicleController.getVehicleByID);

// Write operations - admin and manager only
router.post("/", authorize('admin', 'manager'), VehicleController.addVehicles);
router.put("/:id", authorize('admin', 'manager'), VehicleController.updateVehicles);
router.delete("/:id", authorize('admin', 'manager'), VehicleController.deleteVehicle);

//export
module.exports= router;