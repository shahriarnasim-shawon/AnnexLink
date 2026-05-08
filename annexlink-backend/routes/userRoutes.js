const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, addReview } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Profile routes (Both GET and PUT on the exact same URL)
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// Review route (Needs the ID of the user being reviewed in the URL)
router.route('/:id/reviews').post(protect, addReview);

module.exports = router;