const express = require('express');
const router = express.Router();

// MAKE SURE getUsersForChat IS INSIDE THESE BRACES!
const { getUserProfile, updateUserProfile, addReview, getUsersForChat } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Route to get all users for chat sidebar
router.route('/').get(protect, getUsersForChat);

// Profile routes
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// Review route
router.route('/:id/reviews').post(protect, addReview);

module.exports = router;