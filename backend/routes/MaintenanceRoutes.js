const express = require("express");
const router = express.Router();
const MaintenanceController = require("../controllers/MaintenanceController");



router.get("/report", MaintenanceController.generateMonthlyReport);
router.get("/report/pdf", MaintenanceController.generatePDFReport);
router.get("/report/csv", MaintenanceController.generateCSVReport);

router.get("/all", MaintenanceController.getAllMaintenance);
router.post("/", MaintenanceController.addMaintenance);
router.get("/:id", MaintenanceController.getMaintenanceByID);
router.put("/:id", MaintenanceController.updateMaintenance);
router.delete("/:id", MaintenanceController.deleteMaintenance);

module.exports = router;