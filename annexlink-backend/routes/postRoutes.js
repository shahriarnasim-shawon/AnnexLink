const express = require('express');
const router = express.Router();
const { createPost, getFeedPosts } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// Both creating a post and getting the feed require the user to be logged in (protected)
router.route('/')
    .post(protect, createPost)
    .get(protect, getFeedPosts);

module.exports = router;