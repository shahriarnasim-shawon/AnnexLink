const User = require('../models/User');
const Post = require('../models/Post');
const Review = require('../models/Review');

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getPlatformStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activePosts = await Post.countDocuments({ status: 'Active' });
        const totalReviews = await Review.countDocuments();
        
        res.json({ totalUsers, activePosts, totalReviews });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users for the management table
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle Ban/Unban user
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
const toggleBanUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from banning themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot ban yourself' });
        }

        // Toggle status
        user.status = user.status === 'Banned' ? 'Active' : 'Banned';
        await user.save();

        res.json({ message: `User status changed to ${user.status}`, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.deleteOne();
        res.json({ message: 'User removed permanently' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPlatformStats, getAllUsers, toggleBanUser, deleteUser };