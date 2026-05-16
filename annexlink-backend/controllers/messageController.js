const Message = require('../models/Message');
const Notification = require('../models/Notification'); // IMPORT NOTIFICATION MODEL

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { receiverId, text } = req.body;

        if (!receiverId || !text) {
            return res.status(400).json({ message: "Please provide receiverId and text data" });
        }

        const message = await Message.create({
            sender: req.user._id,
            receiver: receiverId,
            text: text
        });

        // --- NEW: CREATE A NOTIFICATION FOR THE RECEIVER ---
        await Notification.create({
            user: receiverId,
            type: 'Message',
            content: `You have a new message from ${req.user.name}`,
            relatedLink: `chat.html?userId=${req.user._id}` // Clicking it will open chat with this user!
        });

        const populatedMessage = await message.populate('sender', 'name avatar');
        res.status(201).json(populatedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get chat history
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const myUserId = req.user._id;

        const messages = await Message.find({
            $or:[
                { sender: myUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: myUserId }
            ]
        })
        .populate('sender', 'name avatar')
        .sort({ createdAt: 1 }); 

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get all conversations for the sidebar (Ordered by newest)
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
    try {
        const myId = req.user._id;

        // Find all messages where I am the sender or receiver, sorted newest to oldest
        const messages = await Message.find({
            $or: [{ sender: myId }, { receiver: myId }]
        })
        .populate('sender', 'name avatar department batch')
        .populate('receiver', 'name avatar department batch')
        .sort({ createdAt: -1 });

        const conversations = [];
        const addedUsers = new Set(); // Keep track of users we've already added

        messages.forEach(msg => {
            // Determine who the OTHER person in the chat is
            const otherUser = msg.sender._id.toString() === myId.toString() ? msg.receiver : msg.sender;

            // If we haven't added this user to the sidebar yet, add them!
            // Because we sorted by newest first, this guarantees we save their latest message
            if (otherUser && !addedUsers.has(otherUser._id.toString())) {
                addedUsers.add(otherUser._id.toString());
                conversations.push({
                    user: otherUser,
                    lastMessage: msg.text,
                    lastMessageTime: msg.createdAt
                });
            }
        });

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { sendMessage, getMessages, getConversations };
