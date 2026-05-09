const express = require('express');
const router = express.Router();

// MAKE SURE deletePost IS IN THIS LIST:
const { createPost, getFeedPosts, deletePost } = require('../controllers/postController');

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .post(protect, upload.single('media'), createPost)
    .get(protect, getFeedPosts);

// Delete post route
router.route('/:id').delete(protect, deletePost);

module.exports = router;