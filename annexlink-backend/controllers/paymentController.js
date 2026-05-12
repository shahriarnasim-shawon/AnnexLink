const Transaction = require('../models/Transaction');
const Post = require('../models/Post');

// @desc    Process a Payment
// @route   POST /api/payments
// @access  Private
const processPayment = async (req, res) => {
    try {
        const { postId, amount, paymentMethod } = req.body;
        const post = await Post.findById(postId);
        
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Generate a random mock Transaction ID (e.g., TXN-12345678)
        const transactionId = 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);

        const transaction = await Transaction.create({
            buyer: req.user._id,
            seller: post.createdBy,
            post: postId,
            amount: Number(amount),
            paymentMethod,
            transactionId
        });

        res.status(201).json({ message: 'Payment Successful', transaction });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Transaction Receipt
// @route   GET /api/payments/:id
// @access  Private
const getTransactionReceipt = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate('buyer', 'name email')
            .populate('seller', 'name email')
            .populate('post', 'title type');

        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { processPayment, getTransactionReceipt };