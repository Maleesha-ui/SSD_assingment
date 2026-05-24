const express = require("express");
const router = express.Router();

//Insert Model
const Vehicle = require("../models/VehicleModel")
//insert driver controller
const VehicleController =require("../controllers/VehicleController")

router.get("/",VehicleController.getAllVehicles);
router.post("/",VehicleController.addVehicles);
router.get("/:id",VehicleController.getVehicleByID);
router.put("/:id",VehicleController.updateVehicles);
router.delete("/:id",VehicleController.deleteVehicle);



//export
module.exports= router;