const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Required to connect frontend and backend
const connectDB = require('./config/db');
const http = require('http'); 
const { Server } = require('socket.io'); 
const path = require('path');
const searchRoutes = require('./routes/searchRoutes'); // Add at the top


// Import Routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes'); 
const adminRoutes = require('./routes/adminRoutes'); // From Step 8
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); // From Step 8

// Load env variables
dotenv.config();

// Connect to Database
connectDB();

// Initialize Express
const app = express();

// --- MIDDLEWARE ---
app.use(express.json()); 
app.use(cors()); // <-- THIS WAS MISSING! It allows the frontend to fetch data.

// Make the uploads folder publicly accessible
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));        

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/payments', paymentRoutes);
// Base route test
app.get('/', (req, res) => {
    res.send('AnnexLink API is running...');
});

// Port configuration
const PORT = process.env.PORT || 8000;

// --- SOCKET.IO INTEGRATION ---

// 1. Create an HTTP server from the Express app
const server = http.createServer(app);

// 2. Initialize Socket.io on that server
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// 3. Socket.io Event Listeners
io.on("connection", (socket) => {
    console.log(`User connected to Socket.io: ${socket.id}`);

    // When a user logs in, they "join" a personal room named after their Database ID
    socket.on("setup", (userId) => {
        socket.join(userId);
        console.log(`User ID: ${userId} is online and joined their personal room`);
        socket.emit("connected");
    });

    // When a user sends a message
    socket.on("new message", (newMessage) => {
        const receiverId = newMessage.receiver;
        if (!receiverId) return console.log("Message has no receiver ID");
        socket.in(receiverId).emit("message received", newMessage);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected from Socket.io");
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});