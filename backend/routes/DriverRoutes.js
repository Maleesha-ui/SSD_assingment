//import express from "express";
const express = require("express");

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
//Insert Model
const Driver = require("../models/DriverModel")
//insert driver controller
const DriverController = require("../controllers/DriverController");

// All driver routes require authentication
router.use(protect);

// Read operations - accessible by admin, manager, and staff
router.get("/", authorize('admin', 'manager', 'staff'), DriverController.getAllDrivers);
router.get("/:id", authorize('admin', 'manager', 'staff'), DriverController.getById);

// Write operations - admin and manager only
router.post("/", authorize('admin', 'manager'), DriverController.addDrivers);
router.put("/:id", authorize('admin', 'manager'), DriverController.updateDriver);
router.delete("/:id", authorize('admin', 'manager'), DriverController.deleteDriver);

//export
module.exports = router;