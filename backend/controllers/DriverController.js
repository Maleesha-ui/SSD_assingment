const Driver = require("../models/DriverModel");
/*contain the logic for actions like:

Registering a new driver

Getting all drivers

(Later) updating or deleting a driver*/ 

//creating a function to display drivers
const getAllDrivers = async(req,res,next)=> {

    let drivers;
    //checking if there are any drivers
    try{
        drivers= await Driver.find(); // use Driver from here const Driver = require("../Model/DriverModel");
    }catch (err){
        console.log(err);
    }
    //drivers not found
    if(!drivers){
        return res.status(404).json({message:"User not found"});
    }

    //display all drivers
    return res.status(200).json({drivers}); //sends the list of drivers to the client in JSON format, wrapped inside an object
};

//data insert
const addDrivers = async(req,res,next)=>{

    const{firstname,lastname,email,licenseNumber,phoneNumber,yearOfExperience} =req.body;
    let drivers;
    try{
        drivers = new Driver({firstname,lastname,email,licenseNumber,phoneNumber,yearOfExperience});
        await drivers.save();
    }catch(err){
        console.log(err);
    }

    //if the drivers are not getting inserted
    if(!drivers){
        return res.status(404).json({message:"unable to add drivers"});
    }

    return res.status(200).json({drivers});
}

//Get by Id
const getById = async(req,res)=>{
    const id = req.params.id; //req.params.id we should put this "id" in the DriverRoutes.js

    let drivers;

    //checking if the given id is there
    try{
        drivers = await Driver.findById(id);
    }catch (err){
        console.log(err);
    }

    if(!drivers){
        return res.status(404).json({message:"User not found"});
    }

    return res.status(200).json({drivers});
}

//update user details
const updateDriver = async(req,res,next)=>{

    //update is a combined version of getbyid and addDrivers 
    const id = req.params.id;
    const{firstname,lastname,email,licenseNumber,phoneNumber,yearOfExperience} =req.body;

    let drivers;

    try{
        drivers = await Driver.findByIdAndUpdate(id,
             {firstname: firstname, lastname: lastname, email: email, licenseNumber: licenseNumber, phoneNumber: phoneNumber, yearOfExperience: yearOfExperience});
             drivers = await drivers.save();
    }catch(err){
        console.log(err);
    }

    if(!drivers){
        return res.status(404).json({message:"Unable to update driver details"});
    }

    return res.status(200).json({drivers});
}

//Delete user details
const deleteDriver = async (req,res,next)=>{
    const id = req.params.id;

    let drivers;

    try{
        drivers = await Driver.findByIdAndDelete(id)
    }catch(err){
        console.log(err);
    }

    if(!drivers){
        return res.status(404).json({message:"Unable to delete driver details"});
    }

    return res.status(200).json({drivers});
}


exports.getAllDrivers = getAllDrivers;
exports.addDrivers = addDrivers;
exports.getById = getById;
exports.updateDriver = updateDriver;
exports.deleteDriver = deleteDriver;
//makes the function usable in other files.