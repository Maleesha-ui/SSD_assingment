const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const assignmentSchema = new Schema ({

    bookingId:{
        type:String,
        required:true,
    },

    vehicleId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "VehicleModel",
        required: true,
    },

    driverId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "DriverModel",
        required: true,
    },

    assignedDate:{
        type: Date,
        default: Date.now,
    },
},
{ timestamps: true});

module.exports = mongoose.model(
    "AssignmentModel",assignmentSchema
);