const express = require("express");
const ChatRoom = require("../models/ChatRoom");
const router = express.Router();

router.post("/create", async (req, res) => {
    try {
        const { team_id, team_name, competition_id, competition_name, members } = req.body;

        if (!team_id || !team_name || !competition_id || !members) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const chatRoom = new ChatRoom({ team_id, team_name, competition_id, competition_name, members });
        await chatRoom.save();
        res.status(201).json({ message: "Chat room created successfully" });
    } catch (error) {
        console.error("Error creating chat room:", error);
        res.status(500).json({ error: "Failed to create chat room" });
    }
});

router.post("/update", async (req, res) => {
    try {
        const { team_id, members } = req.body;

        if (!team_id || !members) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const chatRoom = await ChatRoom.findOne({ team_id });
        if (!chatRoom) return res.status(404).json({ error: "Chat room not found" });
        chatRoom.members = members;
        await chatRoom.save();
        res.status(200).json({ message: "Chat room updated successfully" });
    } catch (error) {
        console.error("Error updating chat room:", error);
        res.status(500).json({ error: "Failed to update chat room" });
    }
});

module.exports = router;