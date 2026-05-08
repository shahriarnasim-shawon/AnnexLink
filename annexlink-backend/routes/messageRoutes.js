const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// Route to send a message
router.route('/').post(protect, sendMessage);

// Route to get history with a specific user
router.route('/:userId').get(protect, getMessages);

module.exports = router;