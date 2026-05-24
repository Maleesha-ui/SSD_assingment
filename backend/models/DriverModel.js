const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const driverSchema = new Schema({
    firstname:{
        type: String,
        required: true,
    },
    lastname:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique:true,
    },
    licenseNumber:{
        type: String,
        required: true,
        unique:true,
    },
    phoneNumber:{
        type: String,
        required: true,
    },
    yearOfExperience:{
        type: Number,
        required: true,
        min: 0, //Only allow yearOfExperience values that are 0 or higher
    }
});

module.exports=mongoose.model(
    "DriverModel",driverSchema //the name of your model and the schema you defined with all the driver fields
)

/* DriverModel.js
This file will:

Import mongoose

Define a schema (what fields a driver has)

Create and export a model based on that schema  */