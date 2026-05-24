const inventoryService = require('../models/inventoryModel');


//getAllInventory
const getAllInventory = async (req, res) => {
    try {
        const inventory = await inventoryService.find();
        res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//GetbyId
const getInventoryById = async (req, res) => {
    try {
        const inventoryid = await inventoryService.findById(req.params.id);
        if (!inventoryid) {
            return res.status(404).json({ message: 'Inventory not found' });
        }
        res.status(200).json(inventoryid);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//createInventory
const createInventory = async (req, res) => {
    const inventorycreate = new inventoryService({
        productName: req.body.productName,
        quantity: req.body.quantity,
        orderDate: req.body.orderDate,
        status: req.body.status,
        category: req.body.category
    });

    try {
        const newInventory = await inventorycreate.save();
        res.status(201).json(newInventory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


//udpateInventory
const updateInventory = async (req, res) => {
    const id = req.params.id;
    const { productName, quantity, orderDate, status, category } = req.body;
    try {
        const inventoryupdate = await inventoryService.findByIdAndUpdate(id, {
            productName,
            quantity,
            orderDate,
            status,
            category
        }, { new: true });

        if (!inventoryupdate) {
            return res.status(404).json({ message: 'Inventory not found' });
        }
        res.status(200).json(inventoryupdate);
    } catch (error) {
        res.status(400).json({ message: error.message });
    };
};


//deleteInventory
const deleteInventory = async (req, res) => {
    try {
        const inventorydelete = await inventoryService.findByIdAndDelete(req.params.id);
        if (!inventorydelete) {
            return res.status(404).json({ message: 'Inventory not found' });
        }
        res.status(200).json({ message: 'Inventory deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//getInventoryByStatus
const getInventoryByStatus = async (req, res) => {
    try {
        const status = req.params.status;
        const inventory = await inventoryService.find({ status });
        res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//getInventoryByDateRange
const getInventoryByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.params;
        const inventory = await inventoryService.find({
            orderDate: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        });
        res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//getInventoryByProductName
const getInventoryByProductName = async (req, res) => {
    try {
        const productName = req.params.productName;
        const inventory = await inventoryService.find({ productName });
        res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getAllInventory = getAllInventory;
exports.getInventoryById = getInventoryById;
exports.createInventory = createInventory;
exports.updateInventory = updateInventory;
exports.deleteInventory = deleteInventory;
exports.getInventoryByStatus = getInventoryByStatus;
exports.getInventoryByDateRange = getInventoryByDateRange;
exports.getInventoryByProductName = getInventoryByProductName;