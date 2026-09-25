const express = require("express");
const router = express.Router();

const Assignments = require("../models/AssignmentModel");
const AssignmentController = require("../controllers/AssignmentController");
const { protect, authorize } = require("../middleware/auth");

// Dispatch assignments view: Admins, Managers, Drivers, Staff
router.get("/", protect, authorize('admin', 'manager', 'funeral_manager', 'hearse_driver', 'driver', 'funeral_staff', 'staff'), AssignmentController.getAllAssignments);
router.get("/:id", protect, authorize('admin', 'manager', 'funeral_manager', 'hearse_driver', 'driver', 'funeral_staff', 'staff'), AssignmentController.getAssignmentById);

// Manage assignments: Admins and Managers
router.post("/", protect, authorize('admin', 'manager', 'funeral_manager'), AssignmentController.createAssignment);
router.put("/:id", protect, authorize('admin', 'manager', 'funeral_manager'), AssignmentController.UpdateAssignment);
router.delete("/:id", protect, authorize('admin', 'manager', 'funeral_manager'), AssignmentController.deleteAssignment);

module.exports = router;