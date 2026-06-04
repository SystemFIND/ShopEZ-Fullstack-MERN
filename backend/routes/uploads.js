const router = require("express").Router();
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { requireRoles } = require("../middleware/authenticate");
const ctrl = require("../controllers/uploadController");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads");
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, WEBP, GIF images are allowed"));
    }
  },
});

router.post(
  "/image",
  ...requireRoles("admin", "seller"),
  upload.single("file"),
  ctrl.uploadImage
);

module.exports = router;
