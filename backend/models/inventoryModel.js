const mongoose = require('mongoose');
const { Schema } = mongoose;

const inventorySchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['In Stock', 'Low Stock', 'Out of Stock'],
        default: 'In Stock',
    },
    category: {
        type: String,//datatype
        required: true,//validate
        enum: ['Cascket', 'Flowers', 'Decorations', 'other'],
        default: 'other',
    },
},{collection:'Inventory'});


module.exports = mongoose.model('Inventory', inventorySchema);
