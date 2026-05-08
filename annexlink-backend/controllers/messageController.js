const Message = require('../models/Message');

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { receiverId, text } = req.body;

        if (!receiverId || !text) {
            return res.status(400).json({ message: "Please provide receiverId and text data" });
        }

        // Create and save the message to MongoDB
        const message = await Message.create({
            sender: req.user._id,
            receiver: receiverId,
            text: text
        });

        // Populate the sender's info (so the frontend can show their avatar/name)
        const populatedMessage = await message.populate('sender', 'name avatar');

        res.status(201).json(populatedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get chat history between logged-in user and another user
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const myUserId = req.user._id;

        // Find all messages where (I am sender AND they are receiver) OR (They are sender AND I am receiver)
        const messages = await Message.find({
            $or:[
                { sender: myUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: myUserId }
            ]
        })
        .populate('sender', 'name avatar')
        .sort({ createdAt: 1 }); // Sort by oldest to newest (standard chat layout)

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { sendMessage, getMessages };