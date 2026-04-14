const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  user_id: String,
  user_name: String,
  password: String,
  role: String,
  email: String,
  department: String
});

module.exports = mongoose.model("User", UserSchema);