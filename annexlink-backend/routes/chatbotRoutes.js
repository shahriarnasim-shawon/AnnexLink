const express = require('express');
const router = express.Router();
const { askChatbot } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, askChatbot);

module.exports = router;