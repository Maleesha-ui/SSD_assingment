const express = require("express");
const router = express.Router();

const Assignments = require("../models/AssignmentModel");
const AssignmentController = require("../controllers/AssignmentController");

router.get("/",AssignmentController.getAllAssignments);
router.post("/",AssignmentController.createAssignment);
router.get("/:id",AssignmentController.getAssignmentById);
router.put("/:id",AssignmentController.UpdateAssignment);
router.delete("/:id",AssignmentController.deleteAssignment);

module.exports = router;