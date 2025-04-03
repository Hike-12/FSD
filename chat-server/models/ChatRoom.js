const mongoose = require("mongoose");

const ChatRoomSchema = new mongoose.Schema({
    team_id: { type: String, required: true, unique: true },
    team_name: { type: String, required: true },
    competition_id: { type: String, required: true },
    competition_name: { type: String, required: true },
    members: [{ type: String, required: true }], // List of user IDs
});

module.exports = mongoose.model("ChatRoom", ChatRoomSchema);