const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Who receives it
    type: { type: String, enum:['Message', 'Review', 'Application', 'System'], required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedLink: { type: String } // e.g., ID of the post or chat
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);