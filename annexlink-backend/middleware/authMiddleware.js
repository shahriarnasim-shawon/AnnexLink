const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes (Requires a valid token)
const protect = async (req, res, next) => {
    let token;

    // Check if the request has an Authorization header that starts with "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token from the header (Format is "Bearer <token_string>")
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using our secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user in the database using the ID inside the token
            // .select('-password') means "fetch the user, but DO NOT fetch their password"
            req.user = await User.findById(decoded.id).select('-password');

            // If user is banned, block the request immediately
            if (req.user.status === 'Banned') {
                return res.status(403).json({ message: 'Account is banned. Access denied.' });
            }

            next(); // The token is valid! Move on to the actual API route.
            
        } catch (error) {
            console.error("Token verification failed:", error.message);
            res.status(401).json({ message: 'Not authorized, token failed or expired' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

// Middleware to check if the user is an Admin
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // User is admin, let them pass
    } else {
        res.status(403).json({ message: 'Access denied. Admins only.' });
    }
};

module.exports = { protect, admin };