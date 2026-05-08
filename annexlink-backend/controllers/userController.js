const User = require('../models/User');
const Review = require('../models/Review');

// @desc    Get logged in user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        // req.user comes from our protect middleware
        const user = await User.findById(req.user._id);

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile (bio, skills, avatar)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.bio = req.body.bio || user.bio;
            user.skills = req.body.skills || user.skills;
            user.avatar = req.body.avatar || user.avatar;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                bio: updatedUser.bio,
                skills: updatedUser.skills,
                avatar: updatedUser.avatar
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a review & rating to a user
// @route   POST /api/users/:id/reviews
// @access  Private
const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const revieweeId = req.params.id; // The user getting the review
        const reviewerId = req.user._id;  // The user giving the review

        // Prevent users from reviewing themselves
        if (revieweeId === reviewerId.toString()) {
            return res.status(400).json({ message: "You cannot review yourself" });
        }

        // Check if already reviewed (so they can't spam reviews)
        const alreadyReviewed = await Review.findOne({ reviewer: reviewerId, reviewee: revieweeId });
        if (alreadyReviewed) {
            return res.status(400).json({ message: "You have already reviewed this user" });
        }

        // Create the review
        const review = await Review.create({
            reviewer: reviewerId,
            reviewee: revieweeId,
            rating: Number(rating),
            comment
        });

        // ----------------------------------------------------
        // Update the Target User's Overall Average Rating
        // ----------------------------------------------------
        const reviewee = await User.findById(revieweeId);
        const allReviews = await Review.find({ reviewee: revieweeId });
        
        // Calculate new average rating
        reviewee.numReviews = allReviews.length;
        const totalRating = allReviews.reduce((acc, item) => item.rating + acc, 0);
        reviewee.rating = totalRating / allReviews.length; // Average

        await reviewee.save();

        res.status(201).json({ message: 'Review added successfully', review });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUserProfile, updateUserProfile, addReview };