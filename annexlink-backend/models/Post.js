const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['Service', 'Hiring', 'Request'], required: true },
    tags: [{ type: String }],
    price: { type: String },
    media: { type: String, default: "" },
    status: { type: String, enum: ['Active', 'Paused', 'Closed'], default: 'Active' },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    applicants:[{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);