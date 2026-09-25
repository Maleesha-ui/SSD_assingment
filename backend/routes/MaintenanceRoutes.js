const express = require("express");
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const MaintenanceController = require("../controllers/MaintenanceController");

// All maintenance routes require authentication
router.use(protect);

// Report operations - accessible by admin and manager
router.get("/report", authorize('admin', 'manager'), MaintenanceController.generateMonthlyReport);
router.get("/report/pdf", authorize('admin', 'manager'), MaintenanceController.generatePDFReport);
router.get("/report/csv", authorize('admin', 'manager'), MaintenanceController.generateCSVReport);

// Read operations - accessible by admin, manager, staff, and driver
router.get("/all", authorize('admin', 'manager', 'staff', 'driver'), MaintenanceController.getAllMaintenance);
router.get("/:id", authorize('admin', 'manager', 'staff', 'driver'), MaintenanceController.getMaintenanceByID);

// Write operations - admin and manager only
router.post("/", authorize('admin', 'manager'), MaintenanceController.addMaintenance);
router.put("/:id", authorize('admin', 'manager'), MaintenanceController.updateMaintenance);
router.delete("/:id", authorize('admin', 'manager'), MaintenanceController.deleteMaintenance);

module.exports = router;