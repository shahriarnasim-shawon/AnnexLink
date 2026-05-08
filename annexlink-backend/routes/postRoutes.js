const express = require('express');
const router = express.Router();
const { createPost, getFeedPosts } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Import multer

// Add upload.single('media') to intercept the image file
router.route('/')
    .post(protect, upload.single('media'), createPost)
    .get(protect, getFeedPosts);

module.exports = router;