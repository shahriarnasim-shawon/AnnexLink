const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getConversations } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, sendMessage);

// THIS MUST BE ABOVE /:userId
router.route('/conversations').get(protect, getConversations); 

router.route('/:userId').get(protect, getMessages);

module.exports = router;