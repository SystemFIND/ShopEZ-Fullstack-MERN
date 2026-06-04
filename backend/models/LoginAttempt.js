const mongoose = require("mongoose");

const loginAttemptSchema = new mongoose.Schema({
  identifier: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  locked_until: { type: Date, default: null },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LoginAttempt", loginAttemptSchema);
