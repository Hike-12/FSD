const express = require("express");
const Message = require("../models/Message");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { team_id } = req.query;

        if (!team_id) {
            return res.status(400).json({ error: "Missing team_id parameter" });
        }

        const messages = await Message.find({ team_id }).sort({ timestamp: -1 }).limit(20);
        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Error fetching messages" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { sender, content, team_id } = req.body;

        if (!sender || !content || !team_id) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const djangoApiUrl = `${process.env.DJANGO_API_URL}/api/user/${sender}/`;
        const response = await axios.get(djangoApiUrl);

        if (response.status !== 200) {
            console.error("Failed to fetch userName from Django:", response.statusText);
            throw new Error("Failed to fetch userName");
        }

        const userName = response.data.userName || "Unknown User";
        const message = new Message({ sender, content, team_id, userName });
        await message.save();
        res.status(201).json(message);
    } catch (error) {
        console.error("Error saving message:", error);
        res.status(500).json({ error: "Error saving message" });
    }
});

module.exports = router;