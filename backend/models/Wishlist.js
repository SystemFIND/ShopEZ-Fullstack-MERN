const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  product_ids: [String],
});

module.exports = mongoose.model("Wishlist", wishlistSchema);
