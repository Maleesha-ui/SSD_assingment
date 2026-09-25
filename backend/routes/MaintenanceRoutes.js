const express = require("express");
const router = express.Router();
const MaintenanceController = require("../controllers/MaintenanceController");
const { protect, authorize } = require("../middleware/auth");

// All maintenance operations require valid JWT and Admin/Manager role
router.use(protect);
router.use(authorize('admin', 'manager', 'funeral_manager'));



router.get("/report", MaintenanceController.generateMonthlyReport);
router.get("/report/pdf", MaintenanceController.generatePDFReport);
router.get("/report/csv", MaintenanceController.generateCSVReport);

router.get("/all", MaintenanceController.getAllMaintenance);
router.post("/", MaintenanceController.addMaintenance);
router.get("/:id", MaintenanceController.getMaintenanceByID);
router.put("/:id", MaintenanceController.updateMaintenance);
router.delete("/:id", MaintenanceController.deleteMaintenance);

module.exports = router;