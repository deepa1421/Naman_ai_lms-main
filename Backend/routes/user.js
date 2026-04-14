const express = require("express");
const router = express.Router();
const User = require("../models/user");

// Create user
router.post("/create-user", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

module.exports = router;