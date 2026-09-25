//import express from "express";
const express = require("express");

const router = express.Router();
//Insert Model
const Driver = require("../models/DriverModel")
//insert driver controller
const DriverController = require("../controllers/DriverController");
const { protect, authorize } = require("../middleware/auth");

// Read driver details: Admins, Managers, and Drivers
router.get("/", protect, authorize('admin', 'manager', 'funeral_manager', 'hearse_driver', 'driver'), DriverController.getAllDrivers);
router.get("/:id", protect, authorize('admin', 'manager', 'funeral_manager', 'hearse_driver', 'driver'), DriverController.getById);

// Manage drivers: Admins and Managers only
router.post("/", protect, authorize('admin', 'manager', 'funeral_manager'), DriverController.addDrivers);
router.put("/:id", protect, authorize('admin', 'manager', 'funeral_manager'), DriverController.updateDriver);
router.delete("/:id", protect, authorize('admin', 'manager', 'funeral_manager'), DriverController.deleteDriver);

//export
module.exports = router;