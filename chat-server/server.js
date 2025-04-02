const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");
const connectDB = require("./config/db");
const Message = require("./models/Message");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:5173", // Change this if needed
        methods: ["GET", "POST"]
    }
});

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// API Route to get old messages
app.get("/messages", async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

// WebSocket connection
io.on("connection", (socket) => {
    console.log("🟢 A user connected");

    // Receive message from client
    socket.on("sendMessage", async (message) => {
        const newMessage = new Message(message);
        await newMessage.save();

        io.emit("receiveMessage", newMessage);
    });

    socket.on("disconnect", () => {
        console.log("🔴 User disconnected");
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
