const supplierService = require('../models/SupplierModel');

//getAllSupplier
const getAllSupplier = async (req, res) => {
    try {
        const supplier = await supplierService.find();
        res.status(200).json(supplier);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//GetbyId
const getSupplierById = async (req, res) => {
    try {
        const supplierid = await supplierService.findById(req.params.id);
        if (!supplierid) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.status(200).json(supplierid);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//createSupplier
const createSupplier = async (req, res) => {
    const {supplierName, contactNumber, email, address, suppliedItems, companyName } = req.body;
    try{
        const supplier = new supplierService({
            supplierName,
            contactNumber,
            email,
            address,
            suppliedItems,
            companyName
        });
        const savedSupplier = await supplier.save();
        res.status(201).json(savedSupplier);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}



//udpateSupplier
const updateSupplier = async (req, res) => {
    const id= req.params.id;
    const { supplierName, contactNumber, email, address, suppliedItems, companyName} = req.body;
    try {
        const supplierupdate = await supplierService.findByIdAndUpdate(id, {
            supplierName,
            contactNumber,
            email,
            address,
            suppliedItems,
            companyName
        }, { new: true });

        if (!supplierupdate) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.status(200).json(supplierupdate);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


//deleteSupplier
const deleteSupplier = async (req, res) => {
    try {
        const supplierdelete = await supplierService.findByIdAndDelete(req.params.id);
        if (!supplierdelete) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getAllSupplier = getAllSupplier;
exports.getSupplierById = getSupplierById;
exports.createSupplier = createSupplier;
exports.updateSupplier = updateSupplier;
exports.deleteSupplier = deleteSupplier;
