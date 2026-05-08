const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['Service', 'Hiring', 'Request'], required: true },
    tags: [{ type: String }], // Matches against user skills
    price: { type: String }, // e.g., "৳ 5,000" or "Negotiable"
    media: { type: String, default: "" }, // NEW FIELD FOR IMAGE/VIDEO URL
    status: { type: String, enum: ['Active', 'Paused', 'Closed'], default: 'Active' },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    applicants:[{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }] // Users who applied to Hiring/Request posts
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);