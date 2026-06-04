const router = require("express").Router();
const path = require("path");
const fs = require("fs");
const File = require("../models/File");

// GET /api/files/:storagePath
// Mirrors FastAPI's /api/files/{path} — looks up the DB record first, then streams the file.
router.get("/*", async (req, res) => {
  try {
    // req.params[0] captures everything after /api/files/
    const storagePath = req.params[0];
    const record = await File.findOne({ storage_path: storagePath, is_deleted: false });
    if (!record) return res.status(404).json({ detail: "File not found" });

    const filePath = path.join(__dirname, "../uploads", path.basename(storagePath));
    if (!fs.existsSync(filePath)) return res.status(404).json({ detail: "File unavailable" });

    res.set("Cache-Control", "public, max-age=86400");
    res.set("Content-Type", record.content_type || "application/octet-stream");
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

module.exports = router;
