const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const SHIPPING_FLAT = 5.0;

function serialize(o) {
  return {
    id: o._id.toString(),
    user_id: o.user_id,
    user_name: o.user_name || null,
    user_email: o.user_email || null,
    items: o.items,
    address: o.address,
    payment_method: o.payment_method,
    status: o.status,
    subtotal: o.subtotal,
    shipping: o.shipping,
    total: o.total,
    notes: o.notes || "",
    created_at: o.created_at,
  };
}

async function checkout(req, res) {
  try {
    const { address, payment_method, notes = "" } = req.body;
    if (!["cod", "bank_transfer", "e_wallet"].includes(payment_method)) {
      return res.status(400).json({ detail: "Invalid payment method" });
    }

    const userId = req.user._id.toString();
    const cart = await Cart.findOne({ user_id: userId });
    if (!cart || !cart.items.length) return res.status(400).json({ detail: "Cart is empty" });

    const itemsOut = [];
    let subtotal = 0;

    for (const it of cart.items) {
      let p = null;
      try { p = await Product.findById(it.product_id); } catch {}
      if (!p) continue;
      if ((p.stock ?? 0) < it.quantity) {
        return res.status(400).json({ detail: `Insufficient stock for ${p.name}` });
      }
      const line = p.price * it.quantity;
      subtotal += line;
      itemsOut.push({
        product_id: p._id.toString(),
        name: p.name,
        image_url: p.image_url,
        price: p.price,
        quantity: it.quantity,
        subtotal: Math.round(line * 100) / 100,
      });
    }

    if (!itemsOut.length) return res.status(400).json({ detail: "No valid items in cart" });

    const total = Math.round((subtotal + SHIPPING_FLAT) * 100) / 100;
    const order = await Order.create({
      user_id: userId,
      user_name: req.user.name || "",
      user_email: req.user.email || "",
      items: itemsOut,
      address,
      payment_method,
      status: "pending",
      subtotal: Math.round(subtotal * 100) / 100,
      shipping: SHIPPING_FLAT,
      total,
      notes,
    });

    // Decrement stock + increment sales
    for (const it of itemsOut) {
      await Product.findByIdAndUpdate(it.product_id, {
        $inc: { stock: -it.quantity, sales: it.quantity },
      });
    }
    // Clear cart
    await Cart.findOneAndUpdate({ user_id: userId }, { $set: { items: [] } });

    res.json(serialize(order));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function listMyOrders(req, res) {
  try {
    const orders = await Order.find({ user_id: req.user._id.toString() }).sort({ created_at: -1 }).limit(200);
    res.json(orders.map(serialize));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function getOrder(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.order_id)) {
      return res.status(400).json({ detail: "Invalid id" });
    }
    const o = await Order.findById(req.params.order_id);
    if (!o) return res.status(404).json({ detail: "Order not found" });
    if (o.user_id !== req.user._id.toString() && !["admin", "seller"].includes(req.user.role)) {
      return res.status(403).json({ detail: "Forbidden" });
    }
    res.json(serialize(o));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function cancelOrder(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.order_id)) {
      return res.status(400).json({ detail: "Invalid id" });
    }
    const o = await Order.findById(req.params.order_id);
    if (!o) return res.status(404).json({ detail: "Order not found" });
    if (o.user_id !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ detail: "Forbidden" });
    }
    if (!["pending", "processing"].includes(o.status)) {
      return res.status(400).json({ detail: `Cannot cancel an order in '${o.status}' status` });
    }

    // Restock items
    for (const it of o.items) {
      try {
        await Product.findByIdAndUpdate(it.product_id, {
          $inc: { stock: it.quantity, sales: -it.quantity },
        });
      } catch {}
    }

    await Order.findByIdAndUpdate(o._id, { $set: { status: "cancelled" } });
    const fresh = await Order.findById(o._id);
    res.json(serialize(fresh));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

module.exports = { checkout, listMyOrders, getOrder, cancelOrder };
