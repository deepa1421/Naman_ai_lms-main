const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  user_id: String,
  topic: String,
  level: String,
  weak_areas: [String],
  completed_modules: Number,
}, { timestamps: true });

module.exports = mongoose.model("Progress", progressSchema);