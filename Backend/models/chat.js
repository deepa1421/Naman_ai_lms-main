const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  user_id: String,
  question: String,
  answer: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Chat", ChatSchema);