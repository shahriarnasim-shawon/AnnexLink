const Post = require('../models/Post');
const Notification = require('../models/Notification');


const createPost = async (req, res) => {
    try {
        const { title, description, type, tags, price } = req.body;

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
            media: mediaPath, 
            createdBy: req.user._id 
        });

        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getFeedPosts = async (req, res) => {
    try {
        // Fetch all active posts, sorted by newest first
        const posts = await Post.find({ status: 'Active' })
            .populate('createdBy', 'name avatar rating')
            .populate({ path: 'originalPost', populate: { path: 'createdBy', select: 'name' } })
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Ensure only the owner (or an admin) can delete the post
        if (post.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to delete this post' });
        }

        await post.deleteOne();
        res.json({ message: 'Post removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getMyPosts = async (req, res) => {
    try {
        // Find posts where the creator is the currently logged-in user
        const posts = await Post.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('createdBy', 'name avatar email');
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const reactToPost = async (req, res) => {
    try {
        const { reactionType } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Check if user already reacted
        const existingIndex = post.reactions.findIndex(r => r.user.toString() === req.user._id.toString());

        if (existingIndex !== -1) {
            if (post.reactions[existingIndex].reactionType === reactionType) {
                // Clicked the exact same reaction -> Remove it
                post.reactions.splice(existingIndex, 1);
            } else {
                // Clicked a different reaction -> Update it
                post.reactions[existingIndex].reactionType = reactionType;
            }
        } else {
            // New reaction!
            post.reactions.push({ user: req.user._id, reactionType });

            // CREATE NOTIFICATION FOR THE POST OWNER
            if (post.createdBy.toString() !== req.user._id.toString()) {
                await Notification.create({
                    user: post.createdBy,
                    type: 'System',
                    content: `${req.user.name} reacted with ${reactionType} to your post.`,
                    relatedLink: `feed.html`
                });
            }
        }
        
        await post.save();
        res.json({ message: 'Reaction updated', reactions: post.reactions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const repost = async (req, res) => {
    try {
        const originalPostId = req.params.id;
        const originalPost = await Post.findById(originalPostId);
        
        if (!originalPost) return res.status(404).json({ message: 'Post not found' });

        const newPost = await Post.create({
            title: originalPost.title,
            description: originalPost.description,
            type: originalPost.type,
            tags: originalPost.tags,
            price: originalPost.price,
            media: originalPost.media,
            createdBy: req.user._id,
            isRepost: true,
            originalPost: originalPostId
        });
         if (originalPost.createdBy.toString() !== req.user._id.toString()) {
            await Notification.create({
                user: originalPost.createdBy,
                type: 'System',
                content: `${req.user.name} reposted your post!`,
                relatedLink: `feed.html`
            });
        }

        res.status(201).json({ message: 'Repost successful', newPost });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = { createPost, getFeedPosts, deletePost, getMyPosts, getPostById, reactToPost, repost };

