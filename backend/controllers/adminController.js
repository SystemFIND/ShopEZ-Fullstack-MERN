const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { serializeUser } = require("../utils/auth");

function serializeOrder(o) {  
  const address = o.address || {};
  return {
    id: o._id.toString(),
    user_id: o.user_id || "",
    user_name: o.user_name || "",
    user_email: o.user_email || "",
    items: Array.isArray(o.items) ? o.items : [],
    address: {
      full_name: address.full_name || "",
      phone: address.phone || "",
      line1: address.line1 || "",
      city: address.city || "",
      state: address.state || "",
      postal_code: address.postal_code || "",
      country: address.country || "",
    },
   
    payment_method: o.payment_method || "",
    status: o.status || "pending",
    subtotal: typeof o.subtotal === "number" ? o.subtotal : 0,
    shipping: typeof o.shipping === "number" ? o.shipping : 0,
    total: typeof o.total === "number" ? o.total : 0,
    notes: o.notes || "",
    created_at: o.created_at || null,
  };
}

async function stats(req, res) {
  try {
    const total_products = await Product.countDocuments();
    const total_orders = await Order.countDocuments();
    const total_customers = await User.countDocuments({ role: "customer" });

    const agg = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, revenue: { $sum: "$total" } } },
    ]);
    const revenue = agg.length ? Math.round(agg[0].revenue * 100) / 100 : 0;

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recent_orders = await Order.countDocuments({ created_at: { $gte: weekAgo } });
    const low_stock = await Product.countDocuments({ stock: { $lte: 5 } });

    res.json({ total_products, total_orders, total_customers, revenue, recent_orders, low_stock });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function listAllOrders(req, res) {
  try {
    const orders = await Order.find().sort({ created_at: -1 }).limit(500);
    res.json(orders.map(serializeOrder));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;
    if (!["pending", "processing", "shipped", "delivered", "cancelled"].includes(status)) {
      return res.status(400).json({ detail: "Invalid status" });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.order_id)) {
      return res.status(400).json({ detail: "Invalid id" });
    }
    const result = await Order.updateOne({ _id: req.params.order_id }, { $set: { status } });
    if (result.matchedCount === 0) return res.status(404).json({ detail: "Order not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function listUsers(req, res) {
  try {
    const users = await User.find().sort({ created_at: -1 }).limit(500);
    res.json(users.map(serializeUser));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function updateUserRole(req, res) {
  try {
    const { role } = req.body;
    if (!["customer", "seller", "admin"].includes(role)) {
      return res.status(400).json({ detail: "Invalid role" });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.user_id)) {
      return res.status(400).json({ detail: "Invalid id" });
    }
    await User.findByIdAndUpdate(req.params.user_id, { $set: { role } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function deleteUser(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.user_id)) {
      return res.status(400).json({ detail: "Invalid id" });
    }
    if (req.params.user_id === req.user._id.toString()) {
      return res.status(400).json({ detail: "Cannot delete yourself" });
    }
    await User.findByIdAndDelete(req.params.user_id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

module.exports = { stats, listAllOrders, updateOrderStatus, listUsers, updateUserRole, deleteUser };