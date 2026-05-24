const InventoryOrder = require('../models/InventoryOrderModel');

//Get all inventory orders
const getAllInventoryOrders = async (req, res) => {
    try {
        const inventoryOrders = await InventoryOrder.find();
        res.status(200).json(inventoryOrders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Get inventory order by ID
const getInventoryOrderById = async (req, res) => {
    try {
        const inventoryOrder = await InventoryOrder.findById(req.params.id);
        if (!inventoryOrder) {
            return res.status(404).json({ message: 'Inventory order not found' });
        }
        res.status(200).json(inventoryOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//Create a new inventory order
const createInventoryOrder = async (req, res) => {
    const { inventoryItemName, inventoryItemCategory, quantityOrdered, supplierName, inventoryOrderDate, inventoryOrderStatus } = req.body;

    const newInventoryOrder = new InventoryOrder({
        inventoryItemName,
        inventoryItemCategory,
        quantityOrdered,
        supplierName,
        inventoryOrderDate,
        inventoryOrderStatus
    });

    try {
        const savedInventoryOrder = await newInventoryOrder.save();
        res.status(201).json(savedInventoryOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


//Update an inventory order
const updateInventoryOrder = async (req, res) => {
    const { inventoryItemName, inventoryItemCategory, quantityOrdered, supplierName, inventoryOrderDate, inventoryOrderStatus } = req.body;

    try {
        const updatedInventoryOrder = await InventoryOrder.findByIdAndUpdate(
            req.params.id,
            {
                inventoryItemName,
                inventoryItemCategory,
                quantityOrdered,
                supplierName,
                inventoryOrderDate,
                inventoryOrderStatus
            },
            { new: true }
        );

        if (!updatedInventoryOrder) {
            return res.status(404).json({ message: 'Inventory order not found' });
        }

        res.status(200).json(updatedInventoryOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


//Delete an inventory order
const deleteInventoryOrder = async (req, res) => {
    try {
        const deletedInventoryOrder = await InventoryOrder.findByIdAndDelete(req.params.id);
        if (!deletedInventoryOrder) {
            return res.status(404).json({ message: 'Inventory order not found' });
        }
        res.status(200).json({ message: 'Inventory order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



//Exporting the functions
exports.getAllInventoryOrders = getAllInventoryOrders;
exports.getInventoryOrderById = getInventoryOrderById;
exports.createInventoryOrder = createInventoryOrder;
exports.updateInventoryOrder = updateInventoryOrder;
exports.deleteInventoryOrder = deleteInventoryOrder;