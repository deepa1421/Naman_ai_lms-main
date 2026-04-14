const mongoose = require("mongoose");

const ModuleSchema = new mongoose.Schema({
  user_id: String,
  topic: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Module", ModuleSchema);