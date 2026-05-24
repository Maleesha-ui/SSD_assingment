const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const maintenanceSchema = new Schema({
  vehicle_id: {
    type: Schema.Types.ObjectId,
    ref: "VehicleModel",
    required: true,
  },
  service_type: {
    type: String,
    required: true,
  },
  service_date: {
    type: Date,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  next_service_date: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("MaintenanceModel", maintenanceSchema);