const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        match:[/.+@student\.bup\.edu\.bd$/, 'Please use a valid @student.bup.edu.bd email'] 
    },
    password: { type: String, required: true },
    department: { type: String, required: true },
    batch: { type: String, required: true },
    skills: [{ type: String }], // Array of tags (e.g.,["Web Design", "Python"])
    bio: { type: String, default: "" },
    avatar: { type: String, default: "default-avatar.png" },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    role: { type: String, enum:['student', 'admin'], default: 'student' },
    status: { type: String, enum:['Active', 'Banned', 'Reported'], default: 'Active' }
}, { timestamps: true });

// Encrypt password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);