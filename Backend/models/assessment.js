console.log("🔥 assessment routes active");
const mongoose = require("mongoose");
const Assessment = require("../models/assessment");
const assessmentSchema = new mongoose.Schema({
  user_id: String,
  topic: String,
  questions: [String],
  answers: [String],
  score: Number,
  level: String,
  weak_areas: [String], // 🔥 ADD THIS
}, { timestamps: true });

module.exports = mongoose.model("Assessment", assessmentSchema);

