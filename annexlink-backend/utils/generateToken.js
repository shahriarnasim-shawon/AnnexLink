const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    // Creates a token containing the user's ID, signed with our secret key, expiring in 30 days
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = generateToken;