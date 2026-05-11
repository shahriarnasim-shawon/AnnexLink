const User = require('../models/User');
const Post = require('../models/Post');

// @desc    Global search for Users and Posts
// @route   GET /api/search?q=keyword
// @access  Private
const globalSearch = async (req, res) => {
    try {
        const keyword = req.query.q ? req.query.q.trim() : '';
        if (!keyword) return res.json({ users: [], posts:[] });

        // Search ignoring case (regex 'i')
        const regex = new RegExp(keyword, 'i');

        // Search Users by name or skills
        const users = await User.find({
            $or:[{ name: regex }, { skills: regex }]
        }).select('name avatar department rating').limit(5);

        // Search Posts by title or tags
        const posts = await Post.find({
            $or:[{ title: regex }, { tags: regex }]
        }).select('title type price createdBy').limit(5);

        res.json({ users, posts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { globalSearch };