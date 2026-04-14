const express = require("express");
const router = express.Router();
const Chat = require("../models/chat");
const User = require("../models/user");
const Module = require("../models/module");

const axios = require("axios");
const OpenAI = require("openai");

// 🔥 CONFIG: choose provider
const AI_PROVIDER = process.env.AI_PROVIDER || "ollama"; // 👉 set to false when you want OpenAI

// 🔹 OpenAI client (only used if USE_OLLAMA = false)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =========================
// 🤖 AI RESPONSE FUNCTION
// =========================
async function generateAIResponse(prompt) {
  if (AI_PROVIDER === "ollama") {
    try {
      const res = await axios.post(
        `${process.env.OLLAMA_URL || "http://localhost:11434"}/api/generate`,
        {
          model: process.env.OLLAMA_MODEL || "phi", // ✅ CHANGED HERE
          prompt,
          stream: false,
        }
      );

      return res.data.response;

    } catch (err) {
      console.error("❌ Ollama Error:", err.message);

      // ✅ fallback response (VERY IMPORTANT)
      return `Here’s a simple explanation:

${prompt}

(Note: AI model is running in fallback mode. Please ensure Ollama is running properly.)`;
    }

  } else {
    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI tutor." },
        { role: "user", content: prompt },
      ],
    });

    return aiRes.choices[0].message.content;
  }
}

// =========================
// 🎥 YouTube fetch
// =========================
async function getYouTubeLinks(query) {
  try {
    const res = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: query,
          maxResults: 3,
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );

    return res.data.items.map((item) => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
  } catch (err) {
    console.error("YouTube Error:", err.message);
    return [];
  }
}

// =========================
// 🚀 MAIN AI ROUTE
// =========================
router.post("/", async (req, res) => {
  console.log("🔥 AI ROUTE HIT");

  try {
    const { user_id, question } = req.body;

    // =========================
    // 🛑 VALIDATION
    // =========================
    if (!user_id || !question) {
      console.warn("⚠️ Missing fields");
      return res.status(400).json({
        error: "Missing user_id or question",
      });
    }

    console.log("📩 Question:", question);

    // =========================
    // 👤 FETCH USER
    // =========================
    let safeUser = {
      User_name: "User",
      Role: "student",
      Dep: "General",
    };

    try {
      const user = await User.findOne({ User_id: user_id });
      if (user) safeUser = user;
    } catch (err) {
      console.warn("⚠️ User fetch failed, using default");
    }

    // =========================
    // 🧠 BUILD PROMPT
    // =========================
    const prompt = `
You are an AI Personal Tutor.

User Details:
- Name: ${safeUser.User_name}
- Role: ${safeUser.Role}
- Department: ${safeUser.Dep}

Question:
${question}
Tailor the content for a ${safeUser.Role} in ${safeUser.Dep}.

Instructions:
- Tailor the explanation based on the user's role and department
- Use real-world examples relevant to their job
- Suggest practical applications in their daily work
- Keep it structured and actionable
`;

    console.log("⚙️ Generating AI response...");

    // =========================
    // 🤖 AI CALL (OLLAMA / OPENAI)
    // =========================
    let answer = "";

    try {
      answer = await generateAIResponse(prompt);
    } catch (err) {
      console.error("❌ AI generation failed:", err.message);

      return res.status(500).json({
        error: "AI service failed",
      });
    }

    // =========================
    // 🎥 YOUTUBE LINKS (SAFE)
    // =========================
    let videos = [];

    try {
      videos = await getYouTubeLinks(question);
    } catch (err) {
      console.warn("⚠️ YouTube fetch failed");
    }

    // =========================
    // 📦 FINAL RESPONSE
    // =========================
    const finalResponse = {
      answer,
      videos,
    };

    console.log("✅ Response ready");

    // =========================
    // 💾 SAVE CHAT (NON-BLOCKING)
    // =========================
    try {
      await Chat.create({
        user_id,
        question,
        answer: JSON.stringify(finalResponse),
      });
    } catch (err) {
      console.warn("⚠️ Chat save failed (non-critical)");
    }

    // =========================
    // 📤 SEND RESPONSE
    // =========================
    return res.json(finalResponse);

  } catch (err) {
    console.error("🔥 CRITICAL ERROR:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

// =========================
// 📚 GENERATE MODULE
// =========================
router.post("/generate-module", async (req, res) => {
  try {
    const { user_id, topic } = req.body;

    if (!user_id || !topic) {
      return res.status(400).json({ error: "Missing fields" });
    }

   const prompt = `
You are an AI tutor.

Create a structured learning module on: ${topic}

Return ONLY valid JSON in this format:

{
  "title": "Module Title",
  "level": "Beginner/Intermediate/Advanced",
  "topics": [
    {
      "title": "Topic Name",
      "description": "Short explanation",
      "resources": [
        {
          "type": "youtube",
          "title": "Video title",
          "query": "search query"
        },
        {
          "type": "article",
          "title": "Resource title",
          "url": "https://example.com"
        }
      ]
    }
  ]
}
`;

    const content = await generateAIResponse(prompt);

    await Module.create({
      user_id,
      topic,
      content,
    });

    res.json({ content });
  } catch (err) {
    console.error("Module Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// =========================
// 📚 GET MODULES
// =========================
router.get("/modules/:user_id", async (req, res) => {
  try {
    const modules = await Module.find({ user_id: req.params.user_id }).sort({
      createdAt: -1,
    });

    res.json(modules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// 💬 GET CHAT HISTORY
// =========================
router.get("/history/:user_id", async (req, res) => {
  try {
    const chats = await Chat.find({ user_id: req.params.user_id }).sort({
      createdAt: 1,
    });

    const formatted = chats.map((c) => ({
      question: c.question,
      ...JSON.parse(c.answer),
    }));

    res.json(formatted);
  } catch (err) {
    console.error("History Error:", err);
    res.status(500).json({ error: "Error fetching history" });
  }
});

module.exports = router;