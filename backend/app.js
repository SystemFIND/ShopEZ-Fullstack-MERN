const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

// Security & logging
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan("dev"));

// CORS — must come before routes; credentials required for httpOnly cookies
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000").split(",").map((s) => s.trim());
app.use(
  cors({
    origin(origin, cb) {
      // allow requests with no origin (curl, Postman, SSR)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private"
  );

  res.setHeader("Pragma", "no-cache");

  res.setHeader("Expires", "0");

  next();
});

// Routes
const api = express.Router();

api.get("/", (req, res) => res.json({ name: "ShopEZ API", version: "1.0.0" }));
api.get("/health", (req, res) => res.json({ status: "ok" }));

api.use("/auth", require("./routes/auth"));
api.use("/products", require("./routes/products"));
// Reviews are nested under products: /api/products/:product_id/reviews
api.use("/products/:product_id/reviews", require("./routes/reviews"));
api.use("/categories", require("./routes/categories"));
api.use("/cart", require("./routes/cart"));
api.use("/orders", require("./routes/orders"));
api.use("/users", require("./routes/users"));
api.use("/admin", require("./routes/admin"));
api.use("/uploads", require("./routes/uploads"));
api.use("/files", require("./routes/files"));
api.use("/wishlist", require("./routes/wishlist"));

app.use("/api", api);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({ detail: err.message || "Internal server error" });
});

module.exports = app;
