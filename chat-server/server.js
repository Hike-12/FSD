const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Or your frontend URL
        methods: ["GET", "POST"]
    }
});

app.use(cors({
    origin: '*', // During development, you can use this. Restrict in production!
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }));
app.use(express.json());

// Connect to MongoDB
console.log("MOngo URL", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/chat_app")
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Import routes with io instance
const messageRoutes = require("./routes/messageRoutes")(io);
const chatRoomRoutes = require("./routes/chatRoomRoutes");

// Use routes
app.use("/messages", messageRoutes);
app.use("/chat-rooms", chatRoomRoutes);

// WebRTC signaling
const rooms = {}; // Track participants in each room
const userSocketMap = {}; // Map socket IDs to user IDs

io.on("connection", (socket) => {
    // Store user ID when they connect
    socket.on("joinRoom", ({ team_id, user_id }) => {
        userSocketMap[socket.id] = user_id;
        socket.join(team_id);
    });

    // Handle user joining a call
    socket.on("joinCall", (roomId) => {
        if (!rooms[roomId]) rooms[roomId] = [];
        rooms[roomId].push(socket.id);
        
        // Notify the new user about all existing participants
        const existingParticipants = rooms[roomId].filter(id => id !== socket.id);
        socket.emit("existingParticipants", { participants: existingParticipants });
        
        // Notify all participants about the new user
        rooms[roomId].forEach(participantId => {
            if (participantId !== socket.id) {
                io.to(participantId).emit("userJoined", { userId: socket.id });
            }
        });
        
        socket.join(roomId + "-call");
    });
    
    // Handle user leaving a call
    socket.on("leaveCall", (roomId) => {
        if (rooms[roomId]) {
            rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
            socket.to(roomId + "-call").emit("userLeft", { userId: socket.id });
            socket.leave(roomId + "-call");
        }
    });

    // Handle WebRTC signaling
    socket.on("offer", ({ offer, to }) => {
        io.to(to).emit("offer", { offer, from: socket.id });
    });

    socket.on("answer", ({ answer, to }) => {
        io.to(to).emit("answer", { answer, from: socket.id });
    });

    socket.on("ice-candidate", ({ candidate, to }) => {
        io.to(to).emit("ice-candidate", { candidate, from: socket.id });
    });

    // Handle disconnections
    socket.on("disconnect", () => {
        // Find all rooms this socket was in and notify others
        Object.keys(rooms).forEach(roomId => {
            if (rooms[roomId].includes(socket.id)) {
                rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
                socket.to(roomId + "-call").emit("userLeft", { userId: socket.id });
            }
        });
        delete userSocketMap[socket.id];
    });
});
app.get("/", (req, res) => {
        res.send("Server is running!");
      });
// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});