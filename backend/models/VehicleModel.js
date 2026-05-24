const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vehicleSchema = new Schema ({
    vehicleNumber:{
        type: String,
        required: true,
    },

    vehicleType:{
        type: String,
        required: true,
    },
    vehicleModel:{
        type: String,
        required: true,
    },
    vehiclAvailability:{
        type: Boolean,
        required: true,
    },
});

module.exports = mongoose.model(
    "VehicleModel",vehicleSchema
)