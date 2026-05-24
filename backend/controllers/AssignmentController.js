const Assignments = require("../models/AssignmentModel");

//addNew assignment

const createAssignment = async (req,res)=>{
    const{bookingId, vehicleId,driverId, assignedDate} = req.body;
    let assignment;

    try{
        assignment = new Assignments({bookingId,vehicleId,driverId,assignedDate});
        await assignment.save();
    }catch(err){
        console.log(err);
    }

    if(!assignment){
        return res.status(500).json({message:"Unable to create an assigment"});
    }

    return res.status(201).json({assignment})
};



//get all assignments
const getAllAssignments = async(req,res)=>{
    console.log("GET /assignments called");
    let assignments;

    try{
        assignments = await Assignments.find()
        .populate("vehicleId")
        .populate("driverId");
    }catch(err){
        console.log(err);
    }

    if(!assignments){
        return res.status(500).json({message:"Failed to fetch assignments"});
    }

    return res.status(200).json({assignments});
};

//getAssignment by Id
const getAssignmentById = async(req,res,next)=>{
    const id = req.params.id;
    let assignments;

    try{
        assignments= await Assignments.findById(id)
        .populate("vehicleId")
        .populate("driverId")
    }catch(err){
        console.log(err);
    }

    if(!assignments){
        return res.status(404).json({message:"Assignment not found"});
    }

    return res.status(200).json({assignments});

};

//Update assignment

const UpdateAssignment = async(req, res, next)=>{
    const id = req.params.id;
    let assignments;
    
    try{
        assignments = await Assignments.findByIdAndUpdate(id, req.body,{new:true});
    }catch(err){
        console.log(err);
    }

    if(!assignments){
        return res.status(404).json({message:"Assignment not found"});
    }
    return res.status(200).json({assignments});
};

//delete assignments
const deleteAssignment = async(req,res,next)=>{
    const id =req.params.id;
    let assignments;

    try{
        assignments= await Assignments.findByIdAndDelete(id);
    }catch(err){
        console.log(err);
    }

    if(!assignments){
        return res.status(404).json({message:"Assignment not found"});
    }
    return res.status(200).json({message: "Assignment deleted successfully"});

};

exports.createAssignment =createAssignment;
exports.getAllAssignments= getAllAssignments;
exports.getAssignmentById= getAssignmentById;
exports.UpdateAssignment = UpdateAssignment;
exports.deleteAssignment= deleteAssignment;