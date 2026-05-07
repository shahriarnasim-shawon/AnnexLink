const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    try {
        const { name, email, password, department, batch, skills } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Validate BUP Email manually just in case
        if (!email.endsWith('@student.bup.edu.bd')) {
            return res.status(400).json({ message: 'Must use a valid @student.bup.edu.bd email' });
        }

        // Create the user
        const user = await User.create({
            name,
            email,
            password,
            department,
            batch,
            skills: skills ||[] // Default to empty array if no skills provided
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id) // Send back the digital ID card!
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });

        // Check if user exists AND password matches (using the method we wrote in User.js model)
        if (user && (await user.matchPassword(password))) {
            
            // Check if user is banned
            if (user.status === 'Banned') {
                return res.status(403).json({ message: 'Your account has been banned by the administrator.' });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser };