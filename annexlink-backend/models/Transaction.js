const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true }, // e.g., 'Card', 'bKash'
    transactionId: { type: String, required: true, unique: true },
    status: { type: String, default: 'Completed' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);