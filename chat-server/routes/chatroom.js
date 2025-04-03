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