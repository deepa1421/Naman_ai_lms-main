console.log("🔥 assessment routes active");

const express = require("express");
const router = express.Router();
const axios = require("axios");

const Assessment = require("../models/assessment");


// 🧠 Generate assessment
router.post("/generate", async (req, res) => {
  try {
    const { user_id, topic } = req.body;

    const prompt = `
Generate 5 assessment questions on ${topic}.
Make them simple and practical.
Return as a numbered list.
`;

    const aiRes = await axios.post("http://localhost:11434/api/generate", {
      model: "phi",
      prompt,
      stream: false,
    });

    const questions = aiRes.data.response
      .split("\n")
      .filter((q) => q.trim() !== "");

    const assessment = await Assessment.create({
      user_id,
      topic,
      questions,
    });

    res.json(assessment);

  } catch (err) {
    console.error("❌ Generate error:", err);
    res.status(500).json({ error: err.message });
  }
});


// 🧠 Submit answers
router.post("/submit", async (req, res) => {
  try {
    const { assessment_id, answers } = req.body;

    const assessment = await Assessment.findById(assessment_id);

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    const score = answers.filter((a) => a && a.length > 3).length;

    let level = "Beginner";
    if (score >= 4) level = "Advanced";
    else if (score >= 2) level = "Intermediate";

    const weak_areas = answers
      .map((a, i) => (!a || a.length < 3 ? `Question ${i + 1}` : null))
      .filter(Boolean);

    assessment.answers = answers;
    assessment.score = score;
    assessment.level = level;
    assessment.weak_areas = weak_areas;

    await assessment.save();

    res.json({
      user_id: assessment.user_id,
      topic: assessment.topic,
      score,
      level,
      weak_areas,
      createdAt: assessment.createdAt,
    });

  } catch (err) {
    console.error("❌ Submit error:", err);
    res.status(500).json({ error: err.message });
  }
});


// 📊 Progress
router.get("/progress/:user_id", async (req, res) => {
  try {
    const data = await Assessment.find({ user_id: req.params.user_id });
    res.json(data);
  } catch (err) {
    console.error("❌ Progress error:", err);
    res.status(500).json({ error: err.message });
  }
});


// 🎯 Recommendation
router.get("/recommend/:user_id", async (req, res) => {
  try {
    const data = await Assessment.find({ user_id: req.params.user_id });

    if (!data.length) {
      return res.json({
        recommendation: "Start with a beginner module.",
      });
    }

    const latest = data[data.length - 1];

    const prompt = `
User Level: ${latest.level}
Weak Areas: ${latest.weak_areas?.join(", ")}

Suggest next learning steps in 3-4 lines.
`;

    const aiRes = await axios.post("http://localhost:11434/api/generate", {
      model: "phi",
      prompt,
      stream: false,
    });

    res.json({
      recommendation: aiRes.data.response,
    });

  } catch (err) {
    console.error("❌ Recommendation error:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;