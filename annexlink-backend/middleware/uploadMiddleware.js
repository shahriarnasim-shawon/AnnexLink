const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create an ABSOLUTE path to the uploads folder (One folder up from 'middleware')
const uploadDir = path.join(__dirname, '../uploads');

// Ensure the 'uploads' directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set Storage Engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Save explicitly to the absolute path
    },
    filename: function (req, file, cb) {
        // Remove spaces and special characters
        const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '-');
        cb(null, `${Date.now()}-${cleanFileName}`); 
    }
});

// Initialize upload variable
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
});

module.exports = upload;