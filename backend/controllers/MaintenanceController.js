const Maintenance = require("../models/MaintenanceModel");
const Vehicle = require("../models/VehicleModel");

// Get all maintenance records
const getAllMaintenance = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.find().populate("vehicle_id");
    if (!maintenance || maintenance.length === 0) {
      return res.status(404).json({ message: "No maintenance records found" });
    }
    return res.status(200).json({ maintenance });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Add a maintenance record
const addMaintenance = async (req, res, next) => {
  const { vehicle_id, service_type, service_date, cost, next_service_date } = req.body;
  try {
    const maintenance = new Maintenance({
      vehicle_id,
      service_type,
      service_date: new Date(service_date),
      cost,
      next_service_date: new Date(next_service_date),
    });
    await maintenance.save();
    return res.status(200).json({ maintenance });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Unable to add maintenance record" });
  }
};

// Get maintenance by ID
const getMaintenanceByID = async (req, res, next) => {
  const id = req.params.id;
  try {
    const maintenance = await Maintenance.findById(id).populate("vehicle_id");
    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance record not found" });
    }
    return res.status(200).json({ maintenance });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update maintenance record
const updateMaintenance = async (req, res, next) => {
  const id = req.params.id;
  const { vehicle_id, service_type, service_date, cost, next_service_date } = req.body;
  try {
    const maintenance = await Maintenance.findByIdAndUpdate(
      id,
      {
        vehicle_id,
        service_type,
        service_date: new Date(service_date),
        cost,
        next_service_date: new Date(next_service_date),
      },
      { new: true }
    );
    if (!maintenance) {
      return res.status(404).json({ message: "Unable to update maintenance record" });
    }
    return res.status(200).json({ maintenance });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Unable to update maintenance record" });
  }
};

// Delete maintenance record
const deleteMaintenance = async (req, res, next) => {
  const id = req.params.id;
  try {
    const maintenance = await Maintenance.findByIdAndDelete(id);
    if (!maintenance) {
      return res.status(404).json({ message: "Unable to delete maintenance record" });
    }
    return res.status(200).json({ maintenance });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Generate monthly maintenance report
const generateMonthlyReport = async (req, res, next) => {
  const { year } = req.query;
  try {
    const matchStage = year
      ? {
          $match: {
            service_date: {
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31T23:59:59.999Z`),
            },
          },
        }
      : { $match: {} };

    // Chart Data: Aggregate by year and month only
    const chartData = await Maintenance.aggregate([
      matchStage,
      {
        $group: {
          _id: {
            year: { $year: "$service_date" },
            month: { $month: "$service_date" },
          },
          total_cost: { $sum: "$cost" },
        },
      },
      {
        $project: {
          year: "$_id.year",
          month: "$_id.month",
          total_cost: 1,
          _id: 0,
        },
      },
      {
        $sort: { year: -1, month: -1 },
      },
    ]);

    // Table Data: Detailed aggregation by year, month, and vehicle
    const report = await Maintenance.aggregate([
      matchStage,
      {
        $group: {
          _id: {
            year: { $year: "$service_date" },
            month: { $month: "$service_date" },
            vehicle_id: "$vehicle_id",
          },
          total_cost: { $sum: "$cost" },
          last_service_date: { $max: "$service_date" },
          next_service_date: { $max: "$next_service_date" },
          service_types: { $push: "$service_type" },
        },
      },
      {
        $lookup: {
          from: "vehiclemodels",
          localField: "_id.vehicle_id",
          foreignField: "_id",
          as: "vehicle",
        },
      },
      {
        $unwind: {
          path: "$vehicle",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          month: "$_id.month",
          year: "$_id.year",
          vehicle_id: "$_id.vehicle_id",
          vehicle_model: { $ifNull: ["$vehicle.vehicleModel", "Unknown"] },
          total_cost: 1,
          last_service_date: 1,
          next_service_date: 1,
          service_types: {
            $reduce: {
              input: "$service_types",
              initialValue: "",
              in: { $concat: ["$$value", { $cond: [{ $eq: ["$$value", ""] }, "", ", "]}, "$$this"] },
            },
          },
        },
      },
      {
        $sort: { year: -1, month: -1 },
      },
    ]);

    return res.status(200).json({ chartData, report });
  } catch (err) {
    console.error("Monthly Report Error:", err);
    return res.status(500).json({ message: "Error generating monthly report", error: err.message });
  }
};

// Generate PDF report
const generatePDFReport = async (req, res, next) => {
  const PDFDocument = require("pdfkit");
  const { year } = req.query;
  try {
    const matchStage = year
      ? {
          $match: {
            service_date: {
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31T23:59:59.999Z`),
            },
          },
        }
      : { $match: {} };

    const report = await Maintenance.aggregate([
      matchStage,
      {
        $group: {
          _id: {
            year: { $year: "$service_date" },
            month: { $month: "$service_date" },
            vehicle_id: "$vehicle_id",
          },
          total_cost: { $sum: "$cost" },
          last_service_date: { $max: "$service_date" },
          next_service_date: { $max: "$next_service_date" },
          service_types: { $push: "$service_type" },
        },
      },
      {
        $lookup: {
          from: "vehiclemodels",
          localField: "_id.vehicle_id",
          foreignField: "_id",
          as: "vehicle",
        },
      },
      {
        $unwind: {
          path: "$vehicle",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          month: "$_id.month",
          year: "$_id.year",
          vehicle_id: "$_id.vehicle_id",
          vehicle_model: { $ifNull: ["$vehicle.vehicleModel", "Unknown"] },
          total_cost: 1,
          last_service_date: 1,
          next_service_date: 1,
          service_types: {
            $reduce: {
              input: "$service_types",
              initialValue: "",
              in: { $concat: ["$$value", { $cond: [{ $eq: ["$$value", ""] }, "", ", "]}, "$$this"] },
            },
          },
        },
      },
      {
        $sort: { year: -1, month: -1 },
      },
    ]);

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=monthly_maintenance_report.pdf");
    doc.pipe(res);

    doc.fontSize(16).text("Monthly Vehicle Maintenance Report", { align: "center" });
    doc.moveDown();
    report.forEach((item) => {
      doc.fontSize(12).text(`Year: ${item.year}, Month: ${item.month}`);
      doc.text(`Vehicle ID: ${item.vehicle_id}`);
      doc.text(`Model: ${item.vehicle_model}`);
      doc.text(`Last Service: ${new Date(item.last_service_date).toLocaleDateString()}`);
      doc.text(`Next Service: ${new Date(item.next_service_date).toLocaleDateString()}`);
      doc.text(`Service Types: ${item.service_types || "None"}`);
      doc.text(`Total Cost: $${item.total_cost}`);
      doc.moveDown();
    });
    doc.end();
  } catch (err) {
    console.error("PDF Report Error:", err);
    return res.status(500).json({ message: "Error generating PDF", error: err.message });
  }
};

// Generate CSV report
const generateCSVReport = async (req, res, next) => {
  const { Parser } = require("json2csv");
  const { year } = req.query;
  try {
    const matchStage = year
      ? {
          $match: {
            service_date: {
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31T23:59:59.999Z`),
            },
          },
        }
      : { $match: {} };

    const report = await Maintenance.aggregate([
      matchStage,
      {
        $group: {
          _id: {
            year: { $year: "$service_date" },
            month: { $month: "$service_date" },
            vehicle_id: "$vehicle_id",
          },
          total_cost: { $sum: "$cost" },
          last_service_date: { $max: "$service_date" },
          next_service_date: { $max: "$next_service_date" },
          service_types: { $push: "$service_type" },
        },
      },
      {
        $lookup: {
          from: "vehiclemodels",
          localField: "_id.vehicle_id",
          foreignField: "_id",
          as: "vehicle",
        },
      },
      {
        $unwind: {
          path: "$vehicle",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          month: "$_id.month",
          year: "$_id.year",
          vehicle_id: "$_id.vehicle_id",
          vehicle_model: { $ifNull: ["$vehicle.vehicleModel", "Unknown"] },
          total_cost: 1,
          last_service_date: 1,
          next_service_date: 1,
          service_types: {
            $reduce: {
              input: "$service_types",
              initialValue: "",
              in: { $concat: ["$$value", { $cond: [{ $eq: ["$$value", ""] }, "", ", "]}, "$$this"] },
            },
          },
        },
      },
      {
        $sort: { year: -1, month: -1 },
      },
    ]);

    const fields = [
      "year",
      "month",
      "vehicle_id",
      "vehicle_model",
      { label: "Last Service Date", value: (row) => new Date(row.last_service_date).toLocaleDateString() },
      { label: "Next Service Date", value: (row) => new Date(row.next_service_date).toLocaleDateString() },
      "service_types",
      "total_cost",
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(report);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=monthly_maintenance_report.csv");
    res.send(csv);
  } catch (err) {
    console.error("CSV Report Error:", err);
    return res.status(500).json({ message: "Error generating CSV", error: err.message });
  }
};

exports.getAllMaintenance = getAllMaintenance;
exports.addMaintenance = addMaintenance;
exports.getMaintenanceByID = getMaintenanceByID;
exports.updateMaintenance = updateMaintenance;
exports.deleteMaintenance = deleteMaintenance;
exports.generateMonthlyReport = generateMonthlyReport;
exports.generatePDFReport = generatePDFReport;
exports.generateCSVReport = generateCSVReport;