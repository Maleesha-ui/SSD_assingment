const express = require("express");
const router = express.Router();

//Insert Model
const Vehicle = require("../models/VehicleModel")
//insert driver controller
const VehicleController = require("../controllers/VehicleController");
const { protect, authorize } = require("../middleware/auth");

// Fleet view: Admins, Managers, Staff, and Drivers
router.get("/", protect, authorize('admin', 'manager', 'funeral_manager', 'funeral_staff', 'staff', 'hearse_driver', 'driver'), VehicleController.getAllVehicles);
router.get("/:id", protect, authorize('admin', 'manager', 'funeral_manager', 'funeral_staff', 'staff', 'hearse_driver', 'driver'), VehicleController.getVehicleByID);

// Fleet management: Admins and Managers only
router.post("/", protect, authorize('admin', 'manager', 'funeral_manager'), VehicleController.addVehicles);
router.put("/:id", protect, authorize('admin', 'manager', 'funeral_manager'), VehicleController.updateVehicles);
router.delete("/:id", protect, authorize('admin', 'manager', 'funeral_manager'), VehicleController.deleteVehicle);



//export
module.exports= router;