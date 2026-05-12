const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Resolved', 'Dismissed'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);