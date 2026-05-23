const express = require('express');
const router = express.Router();
const { createPost, getFeedPosts, deletePost, getMyPosts,getPostById,reactToPost,repost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .post(protect, upload.single('media'), createPost)
    .get(protect, getFeedPosts);

router.route('/mine').get(protect, getMyPosts);

router.route('/:id')
    .get(protect, getPostById)
    .delete(protect, deletePost);
router.route('/:id/react').put(protect, reactToPost);
router.route('/:id/repost').post(protect, repost);

module.exports = router;