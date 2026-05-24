const Vehicle = require("../models/VehicleModel");

//function to display database data  
const getAllVehicles = async (req, res, next)=>{

    let vehicles;
    //get all vehicles
    try{
        vehicles = await Vehicle.find();
    }catch(err){
        console.log(err);
    }
    //vehicles not found 
    if(!vehicles){ //if (vehicles.length === 0)
        return res.status(404).json({message:"Vehicle not found"});
    }

    //display all vehicles
    return res.status(200).json({vehicles});


};

//data insert
const addVehicles = async(req,res,next)=>{
    const{vehicleNumber, vehicleType, vehicleModel, vehiclAvailability} =req.body;
    let vehicles;

    try{
        vehicles= new Vehicle({vehicleNumber, vehicleType, vehicleModel, vehiclAvailability});
        await vehicles.save();
    }catch(err){
        console.log(err);
    }

    if(!vehicles){
        return res.status(404).json({message:"Unable to add Vehicles"});
    }

    return res.status(200).json({vehicles});
}

//getByID
const getVehicleByID = async (req, res,next) =>{
    const id = req.params.id;

    let vehicles;
    try{
        vehicles = await Vehicle.findById(id);
    }catch(err){
        console.log(err);
    }

    if(!vehicles){
        return res.status(404).json({message:"Vehicle Not Found"});
    }
    return res.status(200).json({vehicles})
}

//update 
const updateVehicles = async(req,res,next)=>{
    const id = req.params.id;
    const{vehicleNumber, vehicleType, vehicleModel, vehiclAvailability} =req.body;

    let vehicles;

    try{
        vehicles = await Vehicle.findByIdAndUpdate(id,
            {vehicleNumber:vehicleNumber, vehicleType:vehicleType, vehicleModel:vehicleModel, vehiclAvailability:vehiclAvailability});
            vehicles = await vehicles.save();
    }catch(err){
        console.log(err)
    }

    if(!vehicles){
        return res.status(404).json({message:"Unable to update vehicle details"});
    }
    return res.status(200).json({vehicles})

}

//delete

const deleteVehicle = async(req,res,next)=>{
    const id = req.params.id;

    let vehicles;

    try{
        vehicles = await Vehicle.findByIdAndDelete(id)
    }catch(err){
        console.log(err);
    }

    if(!vehicles){
        return res.status(404).json({message:"Unable to delete vehicle details"});
    }
    return res.status(200).json({vehicles})
}

exports.getVehicleByID = getVehicleByID;
exports.getAllVehicles =getAllVehicles;
exports.addVehicles =addVehicles;
exports.updateVehicles = updateVehicles;
exports.deleteVehicle = deleteVehicle;