const path = require("path");
const { v4: uuidv4 } = require("uuid");
const File = require("../models/File");

const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 5 * 1024 * 1024;

async function uploadImage(req, res) {
  try {
    if (!req.file) return res.status(400).json({ detail: "No file uploaded" });

    const { mimetype, size, originalname, filename } = req.file;

    if (!ALLOWED_MIMES.has(mimetype)) {
      return res.status(400).json({ detail: "Only JPG, PNG, WEBP, GIF images are allowed" });
    }
    if (size > MAX_BYTES) return res.status(400).json({ detail: "Image too large (max 5MB)" });
    if (size === 0) return res.status(400).json({ detail: "Empty file" });

    const fileId = uuidv4();
    const storagePath = `uploads/${req.user._id}/${filename}`;

    await File.create({
      file_id: fileId,
      storage_path: storagePath,
      original_filename: originalname,
      content_type: mimetype,
      size,
      uploader_id: req.user._id.toString(),
      is_deleted: false,
    });

    res.json({
      url: `/api/files/${storagePath}`,
      path: storagePath,
      content_type: mimetype,
      size,
    });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

module.exports = { uploadImage };
