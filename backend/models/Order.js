const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product_id: String,
    name: String,
    image_url: String,
    price: Number,
    quantity: Number,
    subtotal: Number,
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    full_name: String,
    phone: String,
    line1: String,
    city: String,
    state: String,
    postal_code: String,
    country: { type: String, default: "United States" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    user_name: String,
    user_email: String,
    items: [orderItemSchema],
    address: addressSchema,
    payment_method: { type: String, enum: ["cod", "bank_transfer", "e_wallet"] },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    subtotal: Number,
    shipping: Number,
    total: Number,
    notes: { type: String, default: "" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("Order", orderSchema);
