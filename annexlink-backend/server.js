const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env variables
dotenv.config();

// Connect to Database
connectDB();

// Initialize Express
const app = express();

// Middleware
app.use(express.json()); // Allows us to accept JSON data in the body
app.use(cors());         // Allows our frontend to communicate with this backend

// Basic Route to test server
app.get('/', (req, res) => {
    res.send('AnnexLink API is running...');
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});