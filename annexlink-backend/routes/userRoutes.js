const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, addReview, getUsersForChat, getTopUsers, getUserById, getUserDashboard, deleteOwnAccount, reportUser, toggleSavePost } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/').get(protect, getUsersForChat);
router.route('/top').get(protect, getTopUsers);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }]), updateUserProfile)
    .delete(protect, deleteOwnAccount);

router.route('/dashboard').get(protect, getUserDashboard);
router.route('/save-post/:postId').put(protect, toggleSavePost);
router.route('/:id/report').post(protect, reportUser);
router.route('/:id').get(protect, getUserById);
router.route('/:id/reviews').post(protect, addReview);

module.exports = router;