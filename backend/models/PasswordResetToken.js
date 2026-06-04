const mongoose = require("mongoose");

const passwordResetTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  email: String,
  expires_at: Date,
  used: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PasswordResetToken", passwordResetTokenSchema);
