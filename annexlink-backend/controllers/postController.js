const Post = require('../models/Post');

// @desc    Create a new post (Service, Hiring, Request)
// @route   POST /api/posts
// @access  Private (Requires Token)
const createPost = async (req, res) => {
    try {
        const { title, description, type, tags, price } = req.body;

        // Create the post. Notice we use `req.user._id` which comes from our authMiddleware!
        const post = await Post.create({
            title,
            description,
            type,
            tags,
            price,
            createdBy: req.user._id 
        });

        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all posts for the AnnexFeed
// @route   GET /api/posts
// @access  Private (Requires Token)
const getFeedPosts = async (req, res) => {
    try {
        // Fetch all active posts, sorted by newest first
        // .populate() replaces the 'createdBy' ID with the actual user's name and avatar!
        const posts = await Post.find({ status: 'Active' })
            .populate('createdBy', 'name avatar rating')
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createPost, getFeedPosts };