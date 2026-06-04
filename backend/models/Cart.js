const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product_id: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  items: [cartItemSchema],
});

module.exports = mongoose.model("Cart", cartSchema);
