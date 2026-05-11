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
            
            // Handle skills if they are passed as a string from FormData
            if (req.body.skills) {
                user.skills = typeof req.body.skills === 'string' 
                    ? req.body.skills.split(',').map(s => s.trim()).filter(s => s !== "")
                    : req.body.skills;
            }

            // If a new avatar file was uploaded, save its path
            if (req.file) {
                user.avatar = `/uploads/${req.file.filename}`;
            }

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
// @desc    Get all users for the chat sidebar (excluding the logged-in user)
// @route   GET /api/users
// @access  Private
const getUsersForChat = async (req, res) => {
    try {
        // Find all users EXCEPT the currently logged-in user
        const users = await User.find({ _id: { $ne: req.user._id } }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get top 3 users by rating
// @route   GET /api/users/top
// @access  Private
const getTopUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'student', rating: { $gt: 0 } })
            .sort({ rating: -1 })
            .limit(3)
            .select('name avatar rating department');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a specific user's public profile and reviews
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Fetch all reviews left for this user
        const Review = require('../models/Review');
        const reviews = await Review.find({ reviewee: req.params.id })
            .populate('reviewer', 'name avatar')
            .sort({ createdAt: -1 });

        res.json({ user, reviews });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard
// @access  Private
const getUserDashboard = async (req, res) => {
    try {
        const Post = require('../models/Post');
        
        // Find all posts by this user
        const myPosts = await Post.find({ createdBy: req.user._id }).sort({ createdAt: -1 });

        // Calculate Stats
        const activeServices = myPosts.filter(p => p.type === 'Service' && p.status === 'Active').length;
        const pendingRequests = myPosts.filter(p => (p.type === 'Request' || p.type === 'Hiring') && p.status === 'Active').length;

        // Mock earning calculation (we will replace this with real Payment data later)
        const earned = req.user.rating * 1500; 

        // Send back stats and the 5 most recent activities
        res.json({
            activeServices,
            pendingRequests,
            earned: earned.toFixed(0),
            recentActivity: myPosts.slice(0, 5) // Only top 5
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Delete own user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteOwnAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            await user.deleteOne();
            res.json({ message: 'Account deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Don't forget to export it!
module.exports = { getUserProfile, updateUserProfile, addReview, getUsersForChat, getTopUsers, getUserById, getUserDashboard, deleteOwnAccount };



