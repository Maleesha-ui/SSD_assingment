//import express from "express";
const express = require("express");

const router = express.Router();
//Insert Model
const Driver = require("../models/DriverModel")
//insert driver controller
const DriverController = require("../controllers/DriverController");

router.get("/",DriverController.getAllDrivers);
router.post("/",DriverController.addDrivers);
router.get("/:id",DriverController.getById); //"/:id-> catching the driver details using id"
router.put("/:id",DriverController.updateDriver);
router.delete("/:id",DriverController.deleteDriver);

//export
module.exports = router;