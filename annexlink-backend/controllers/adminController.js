const User = require('../models/User');
const Post = require('../models/Post');
const Review = require('../models/Review');
const Report = require('../models/Report');
const Setting = require('../models/Setting');

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getPlatformStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activePosts = await Post.countDocuments({ status: 'Active' });
        const totalReviews = await Review.countDocuments();
        const pendingReports = await Report.countDocuments({ status: 'Pending' }); // NEW
        
        res.json({ totalUsers, activePosts, totalReviews, pendingReports });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getReports = async (req, res) => {
    try {
        const reports = await Report.find({ status: 'Pending' })
            .populate('reporter', 'email')
            .populate('reportedUser', 'name email status')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const dismissReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (report) {
            report.status = 'Dismissed';
            await report.save();

            // Revert user status to Active if no other pending reports exist
            const otherReports = await Report.countDocuments({ reportedUser: report.reportedUser, status: 'Pending' });
            if (otherReports === 0) {
                const user = await User.findById(report.reportedUser);
                if (user && user.status === 'Reported') {
                    user.status = 'Active';
                    await user.save();
                }
            }
            res.json({ message: 'Report dismissed' });
        } else {
            res.status(404).json({ message: 'Report not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) settings = await Setting.create({}); // Generate defaults if empty
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (settings) {
            settings.platformName = req.body.platformName || settings.platformName;
            settings.supportEmail = req.body.supportEmail || settings.supportEmail;
            settings.maintenanceMode = req.body.maintenanceMode !== undefined ? req.body.maintenanceMode : settings.maintenanceMode;
            settings.requireEmailVerification = req.body.requireEmailVerification !== undefined ? req.body.requireEmailVerification : settings.requireEmailVerification;
            
            await settings.save();
            res.json(settings);
        }
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

module.exports = { getPlatformStats, getAllUsers, toggleBanUser, deleteUser, getReports, dismissReport, getSettings, updateSettings };