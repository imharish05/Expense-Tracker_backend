const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    item: {
        type: String,
        required: [true, 'Item name is required']
    },
    amount: {
        type: Number, // Mongoose uses Number for decimals
        required: [true, 'Amount is required']
    },
    paid_by: {
        type: String,
        required: [true, 'Paid by is required']
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Transaction', transactionSchema);