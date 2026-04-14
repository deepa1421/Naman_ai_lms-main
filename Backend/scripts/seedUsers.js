const mongoose = require("mongoose");
const User = require("../models/user");
const users = require("../data/users_hashed.json");

require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const formattedUsers = users.map(u => ({
    user_id: u.User_id,
    user_name: u.User_name,
    password: u.Password,
    role: u.Role,
    email: u.Email,
    department: u.Dep
  }));

  await User.insertMany(formattedUsers);

  console.log("✅ Users inserted into MongoDB");
  process.exit();
}

run();