const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  file_id: { type: String, required: true, unique: true },
  storage_path: { type: String, required: true },
  original_filename: String,
  content_type: String,
  size: Number,
  uploader_id: String,
  is_deleted: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("File", fileSchema);
