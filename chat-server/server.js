const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const axios = require("axios");


const Message = require("./models/Message");
const ChatRoom = require("./models/ChatRoom");

// Express App
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }  // Allow frontend to connect
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/chatDB";
mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// API Routes

app.post("/create-chat-room", async (req, res) => {
    try {
        const { team_id, team_name, competition_id, competition_name, members } = req.body;

        if (!team_id || !team_name || !competition_id || !members) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Save the chat room details in MongoDB
        const chatRoom = new ChatRoom({
            team_id,
            team_name,
            competition_id,
            competition_name,
            members, // List of user IDs
        });
        await chatRoom.save();

        res.status(201).json({ message: "Chat room created successfully" });
    } catch (error) {
        console.error("Error creating chat room:", error);
        res.status(500).json({ error: "Failed to create chat room" });
    }
});

app.post("/update-chat-room", async (req, res) => {
    try {
        const { team_id, members } = req.body;

        if (!team_id || !members) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Update the chat room in MongoDB
        const chatRoom = await ChatRoom.findOne({ team_id });
        if (!chatRoom) {
            return res.status(404).json({ error: "Chat room not found" });
        }

        chatRoom.members = members; // Update the members list
        await chatRoom.save();

        res.status(200).json({ message: "Chat room updated successfully" });
    } catch (error) {
        console.error("Error updating chat room:", error);
        res.status(500).json({ error: "Failed to update chat room" });
    }
});
// Restrict access to chat rooms
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinRoom", async ({ team_id, user_id }) => {
        console.log("User joining room:", { team_id, user_id });
        try {
            const chatRoom = await ChatRoom.findOne({ team_id });

            if (!chatRoom) {
                return socket.emit("error", { message: "Chat room not found" });
            }

            if (!chatRoom.members.includes(user_id)) {
                return socket.emit("error", { message: "Access denied" });
            }

            socket.join(team_id);
            console.log(`User ${user_id} joined room ${team_id}`);
        } catch (error) {
            console.error("Error joining room:", error);
            socket.emit("error", { message: "Failed to join room" });
        }
    });

    socket.on("sendMessage", async ({ team_id, message, sender }) => {
        try {
            // Fetch the userName from Django
            const djangoApiUrl = `${process.env.DJANGO_API_URL}/api/user/${sender}/`;
            const response = await axios.get(djangoApiUrl);
            console.log("Django API response:", response.data);
    
            if (response.status !== 200) {
                console.error("Failed to fetch userName from Django:", response.statusText);
                throw new Error("Failed to fetch userName");
            }
    
            const data = response.data;
            const userName = data.userName || "Unknown User";
    
            console.log("Broadcasting message:", { team_id, message, sender, userName });
    
            // Broadcast the message with userName
            io.to(team_id).emit("receiveMessage", { message, sender, userName });
        } catch (error) {
            console.error("Error in sendMessage event:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

app.get("/", (req, res) => {
    res.send("Server is running!");
  });
  
  // API Routes
  app.get("/messages", async (req, res) => {
    try {
      const messages = await Message.find().sort({ createdAt: -1 }).limit(20);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Error fetching messages" });
    }
  });
  
  app.post("/messages", async (req, res) => {
    try {
        const { sender, content, team_id } = req.body;

        if (!sender || !content || !team_id) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Fetch the userName from Django
        const djangoApiUrl = `${process.env.DJANGO_API_URL}/api/user/${sender}/`;
        const response = await axios.get(djangoApiUrl);

        if (response.status !== 200) {
            console.error("Failed to fetch userName from Django:", response.statusText);
            throw new Error("Failed to fetch userName");
        }

        const data = response.data;
        const userName = data.userName || "Unknown User";

        // Save the message to MongoDB with userName
        const message = new Message({ sender, content, team_id, userName });
        console.log("Saving message to MongoDB:", message);
        await message.save();

        // Emit the message to all clients in the room
        io.to(team_id).emit("receiveMessage", { sender, content, userName });

        res.status(201).json(message);
    } catch (error) {
        console.error("Error saving message:", error);
        res.status(500).json({ error: "Error saving message" });
    }
});
  
  // Debug endpoint
  app.get("/debug", (req, res) => {
    res.json({
      serverRunning: true,
      socketConnections: io.engine.clientsCount,
      timestamp: new Date().toISOString()
    });
  });
  
  // WebRTC Signaling
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
  
    // Send an immediate welcome message to confirm connection
    socket.emit("welcome", { message: "Connected to server!" });
  
    socket.on("joinCall", (roomId) => {
      console.log(`User ${socket.id} joined room: ${roomId}`);
      socket.join(roomId);
      // Notify others in the room
      socket.to(roomId).emit("userJoined", { userId: socket.id });
    });
  
    socket.on("offer", ({ offer, roomId }) => {
      console.log(`Received offer from ${socket.id} for room ${roomId}`);
      socket.to(roomId).emit("offer", { offer, from: socket.id });
    });
  
    socket.on("answer", ({ answer, roomId }) => {
      console.log(`Received answer from ${socket.id} for room ${roomId}`);
      socket.to(roomId).emit("answer", { answer, from: socket.id });
    });
  
    socket.on("ice-candidate", ({ candidate, roomId }) => {
      console.log(`ICE candidate from ${socket.id} for room ${roomId}`);
      socket.to(roomId).emit("ice-candidate", { candidate, from: socket.id });
    });
  
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
  
  // Start Server
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access locally at http://localhost:${PORT}`);
    console.log(`Make sure to update your frontend to use the correct address`);
  });