// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const { createServer } = require("http");
// const { Server } = require("socket.io");
// require("dotenv").config();
// const axios = require("axios");

// const chatRoomRoutes = require("./routes/chatRoomRoutes");
// const messageRoutes = require("./routes/messageRoutes");

// const Message = require("./models/Message");
// const ChatRoom = require("./models/ChatRoom");

// // Express App
// const app = express();
// const server = createServer(app);
// const io = new Server(server, {
//     cors: { origin: "*" }  // Allow frontend to connect
// });

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes
// app.use("/chat-room", chatRoomRoutes);
// app.use("/messages", messageRoutes);

// // MongoDB Connection
// const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/chatDB";
// mongoose.connect(MONGO_URI)
//     .then(() => console.log("MongoDB Connected"))
//     .catch(err => console.error("MongoDB Connection Error:", err));

// // Restrict access to chat rooms
// io.on("connection", (socket) => {
//     console.log("User connected:", socket.id);

//     socket.on("joinRoom", async ({ team_id, user_id }) => {
//         console.log("User joining room:", { team_id, user_id });
//         try {
//             const chatRoom = await ChatRoom.findOne({ team_id });
    
//             if (!chatRoom) {
//                 return socket.emit("error", { message: "Chat room not found" });
//             }
    
//             if (!chatRoom.members.includes(user_id)) {
//                 return socket.emit("error", { message: "Access denied" });
//             }
    
//             socket.join(team_id);
//             console.log(`User ${user_id} joined room ${team_id}`);
//         } catch (error) {
//             console.error("Error joining room:", error);
//             socket.emit("error", { message: "Failed to join room" });
//         }
//     });

//     socket.on("sendMessage", async ({ team_id, message, sender }) => {
//         try {
//             // Fetch the userName from Django
//             const djangoApiUrl = `${process.env.DJANGO_API_URL}/api/user/${sender}/`;
//             const response = await axios.get(djangoApiUrl);
    
//             if (response.status !== 200) {
//                 console.error("Failed to fetch userName from Django:", response.statusText);
//                 throw new Error("Failed to fetch userName");
//             }
    
//             const data = response.data;
//             const userName = data.userName || "Unknown User";
    
//             console.log("Broadcasting message:", { team_id, message, sender, userName });
    
//             // Save the message to MongoDB
//             const newMessage = new Message({ sender, content: message, team_id, userName });
//             await newMessage.save();
    
//             // Broadcast the message to the specific team
//             io.to(team_id).emit("receiveMessage", { sender, content: message, userName });
//         } catch (error) {
//             console.error("Error in sendMessage event:", error);
//         }
//     });

//     socket.on("disconnect", () => {
//         console.log("User disconnected:", socket.id);
//     });
// });

// app.get("/", (req, res) => {
//     res.send("Server is running!");
//   });
  
//   // Debug endpoint
//   app.get("/debug", (req, res) => {
//     res.json({
//       serverRunning: true,
//       socketConnections: io.engine.clientsCount,
//       timestamp: new Date().toISOString()
//     });
//   });
  
//   // WebRTC Signaling
//   io.on("connection", (socket) => {
//     console.log("User connected:", socket.id);
  
//     // Send an immediate welcome message to confirm connection
//     socket.emit("welcome", { message: "Connected to server!" });
  
//     socket.on("joinCall", (roomId) => {
//       console.log(`User ${socket.id} joined room: ${roomId}`);
//       socket.join(roomId);
//       // Notify others in the room
//       socket.to(roomId).emit("userJoined", { userId: socket.id });
//     });
  
//     socket.on("offer", ({ offer, roomId }) => {
//       console.log(`Received offer from ${socket.id} for room ${roomId}`);
//       socket.to(roomId).emit("offer", { offer, from: socket.id });
//     });
  
//     socket.on("answer", ({ answer, roomId }) => {
//       console.log(`Received answer from ${socket.id} for room ${roomId}`);
//       socket.to(roomId).emit("answer", { answer, from: socket.id });
//     });
  
//     socket.on("ice-candidate", ({ candidate, roomId }) => {
//       console.log(`ICE candidate from ${socket.id} for room ${roomId}`);
//       socket.to(roomId).emit("ice-candidate", { candidate, from: socket.id });
//     });
  
//     socket.on("disconnect", () => {
//       console.log("User disconnected:", socket.id);
//     });
//   });
  
//   // Start Server
//   const PORT = process.env.PORT || 5000;
//   server.listen(PORT, "0.0.0.0", () => {
//     console.log(`Server running on port ${PORT}`);
//     console.log(`Access locally at http://localhost:${PORT}`);
//     console.log(`Make sure to update your frontend to use the correct address`);
//   });

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

// Middleware
// app.use(cors());
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