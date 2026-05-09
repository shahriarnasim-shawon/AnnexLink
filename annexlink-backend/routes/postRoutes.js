const express = require('express');
const router = express.Router();
const { createPost, getFeedPosts, deletePost, getMyPosts } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .post(protect, upload.single('media'), createPost)
    .get(protect, getFeedPosts);

// ADD THIS NEW ROUTE HERE:
router.route('/mine').get(protect, getMyPosts);

router.route('/:id').delete(protect, deletePost);

module.exports = router;