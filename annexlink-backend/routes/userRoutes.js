const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, addReview, getUsersForChat } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Import multer

router.route('/').get(protect, getUsersForChat);

// ADD upload.single('avatar') to the PUT route!
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, upload.single('avatar'), updateUserProfile);

router.route('/:id/reviews').post(protect, addReview);

module.exports = router;