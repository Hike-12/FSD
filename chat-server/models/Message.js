const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    userName: { type: String, required: true }, // Add userName field
    content: { type: String, required: true },
    team_id: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", MessageSchema);