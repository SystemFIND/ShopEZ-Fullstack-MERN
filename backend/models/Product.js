const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    category_id: { type: String, default: "" },
    image_url: { type: String, default: "" },
    images: [String],
    brand: { type: String, default: "" },
    rating: { type: Number, default: 0.0 },
    review_count: { type: Number, default: 0 },
    sales: { type: Number, default: 0 },
    seller_id: { type: String, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("Product", productSchema);