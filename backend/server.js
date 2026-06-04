require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const seed = require("./utils/seed");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

async function start() {
  try {
    await connectDB();
    await seed();
    app.listen(PORT, () => {
      console.log(`ShopEZ API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
}

start();
