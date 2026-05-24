const mongoose = require('mongoose');
const  Schema = mongoose.Schema;

const inventoryOrderSchema = new Schema({
    inventoryItemName: {
        type: String,//datatype
        required: true,//validate
    },
    inventoryItemCategory: {
        type: String,//datatype
        required: true,//validate
        enum: ['Cascket', 'Flowers', 'Decorations', 'other'],
        default: 'other',
    },
    quantityOrdered: {
        type: Number,//datatype
        required: true,//validate
    },
    supplierName: {
        type: String,
        required: true
    },
    inventoryOrderDate: {
        type: Date,
        default: Date.now,
    },
    inventoryOrderStatus: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending',
    },
    orderReceivedDate: {
        type: Date,
        default: Date.now,
    },
});
module.exports = mongoose.model(
    "InventoryOrderModel",//fileName
    inventoryOrderSchema//function name
)