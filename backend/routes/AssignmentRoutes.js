const express = require("express");
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const Assignments = require("../models/AssignmentModel");
const AssignmentController = require("../controllers/AssignmentController");

// All assignment routes require authentication
router.use(protect);

// Read operations - accessible by admin, manager, staff, and driver
router.get("/", authorize('admin', 'manager', 'staff', 'driver'), AssignmentController.getAllAssignments);
router.get("/:id", authorize('admin', 'manager', 'staff', 'driver'), AssignmentController.getAssignmentById);

// Write operations - admin and manager only
router.post("/", authorize('admin', 'manager'), AssignmentController.createAssignment);
router.put("/:id", authorize('admin', 'manager'), AssignmentController.UpdateAssignment);
router.delete("/:id", authorize('admin', 'manager'), AssignmentController.deleteAssignment);

module.exports = router;