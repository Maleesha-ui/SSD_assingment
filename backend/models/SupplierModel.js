const mongoose = require('mongoose');
const { Schema } = mongoose;

const supplierSchema = new mongoose.Schema({
    supplierName: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    suppliedItems: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },

}, { collection: 'Supplier' });

module.exports = mongoose.model('Supplier', supplierSchema);