const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    item: {
        type: String,
        required: [true, 'Item name is required']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required']
    },
    paid_by: {
        type: String,
        required: [true, 'Paid by is required']
    },
    // ADD THIS FIELD:
    created_at: {
        type: Date,
        default: Date.now // Defaults to now if not provided
    }
}, {
    // Keep timestamps for record-keeping, but we will use the field above for logic
    timestamps: { createdAt: false, updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Transaction', transactionSchema);