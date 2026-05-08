const Post = require('../models/Post');

// @desc    Create a new post (Service, Hiring, Request)
// @route   POST /api/posts
// @access  Private (Requires Token)
const createPost = async (req, res) => {
    try {
        const { title, description, type, tags, price } = req.body;

        // Tags might come as a string from FormData, convert back to array
        let parsedTags = tags;
        if (typeof tags === 'string') {
            parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "");
        }

        // Check if an image/file was uploaded
        let mediaPath = "";
        if (req.file) {
            mediaPath = `/uploads/${req.file.filename}`;
        }

        const post = await Post.create({
            title,
            description,
            type,
            tags: parsedTags,
            price,
            media: mediaPath, // Save the image path!
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