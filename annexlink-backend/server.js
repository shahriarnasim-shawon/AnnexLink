const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const http = require('http'); // Required for Socket.io
const { Server } = require('socket.io'); // Required for Socket.io

// Import Routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes'); // New Messages Route

// Load env variables
dotenv.config();

// Connect to Database
connectDB();

// Initialize Express
const app = express();

// Middleware
app.use(express.json()); 
app.use(cors());         

// ----- API Routes -----
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes); // Added Messages API

app.get('/', (req, res) => {
    res.send('AnnexLink API is running...');
});

// Port configuration
const PORT = process.env.PORT || 5000;

// ----- SOCKET.IO INTEGRATION -----

// 1. Create an HTTP server from the Express app
const server = http.createServer(app);

// 2. Initialize Socket.io on that server
const io = new Server(server, {
    cors: {
        origin: "*", // Allows frontend to connect
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

        // Send the message INSTANTLY to the receiver's personal room
        socket.in(receiverId).emit("message received", newMessage);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected from Socket.io");
    });
});

// IMPORTANT: We now start 'server.listen' instead of 'app.listen'
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});