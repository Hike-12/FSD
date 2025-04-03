const express = require("express");
const Message = require("../models/Message");
const axios = require("axios");
const router = express.Router();

// Export a function that takes the io instance as a parameter
module.exports = function(io) {
    // Setup WebSocket event handler for join room
    io.on("connection", (socket) => {
        socket.on("joinRoom", ({ team_id, user_id }) => {
            if (team_id) {
                // Join the room
                socket.join(team_id);
                console.log(`User ${user_id} joined room ${team_id}`);
            }
        });
    });

    // Message routes
    router.get("/", async (req, res) => {
        try {
            const { team_id } = req.query;
    
            if (!team_id) {
                return res.status(400).json({ error: "Missing team_id parameter" });
            }
    
            const messages = await Message.find({ team_id }).sort({ timestamp: -1 }).limit(20);
            res.json(messages.reverse()); // Reverse to show oldest first
        } catch (error) {
            console.error("Error fetching messages:", error);
            res.status(500).json({ error: "Error fetching messages" });
        }
    });
    
    router.post("/", async (req, res) => {
        try {
            const { team_id, sender, content } = req.body;
            
            if (!team_id || !sender || !content) {
                return res.status(400).json({ error: "Missing required fields" });
            }
            
            let userName = "Unknown User";
            
            try {
                // Fetch the userName from Django
                const djangoApiUrl = `${process.env.DJANGO_API_URL || "http://localhost:8000"}/api/user/${sender}/`;
                const response = await axios.get(djangoApiUrl);
                
                if (response.status === 200) {
                    const data = response.data;
                    userName = data.userName || sender;
                }
            } catch (djangoError) {
                console.error("Error fetching userName from Django:", djangoError);
                // Continue with unknown username if Django API fails
            }
            
            // Save the message to MongoDB
            const newMessage = new Message({ 
                sender, 
                content, 
                team_id, 
                userName 
            });
            
            await newMessage.save();
            
            // Broadcast the message to the team room using Socket.io
            io.to(team_id).emit("receiveMessage", { 
                _id: newMessage._id,
                sender, 
                content, 
                userName,
                team_id,
                timestamp: newMessage.timestamp
            });
            
            res.status(201).json(newMessage);
        } catch (error) {
            console.error("Error posting message:", error);
            res.status(500).json({ message: "Failed to send message" });
        }
    });

    return router;
};