const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product_id: { type: String, required: true },
    user_id: { type: String, required: true },
    user_name: { type: String, default: "" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", maxlength: 1000 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// One review per user per product
reviewSchema.index({ product_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
