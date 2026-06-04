const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

async function buildCart(userId) {
  const cart = await Cart.findOne({ user_id: userId });
  if (!cart) return { items: [], total_items: 0, subtotal: 0 };

  const itemsOut = [];
  let subtotal = 0;
  let total_items = 0;

  for (const it of cart.items) {
    let p = null;
    try { p = await Product.findById(it.product_id); } catch {}
    if (!p) continue;

    const qty = it.quantity;
    const lineSub = p.price * qty;
    subtotal += lineSub;
    total_items += qty;
    itemsOut.push({
      product_id: p._id.toString(),
      name: p.name,
      price: p.price,
      image_url: p.image_url,
      quantity: qty,
      stock: p.stock ?? 0,
      subtotal: Math.round(lineSub * 100) / 100,
    });
  }

  return { items: itemsOut, total_items, subtotal: Math.round(subtotal * 100) / 100 };
}

async function getCart(req, res) {
  try {
    res.json(await buildCart(req.user._id.toString()));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function addItem(req, res) {
  try {
    const { product_id, quantity = 1 } = req.body;
    if (!mongoose.Types.ObjectId.isValid(product_id)) {
      return res.status(400).json({ detail: "Invalid product id" });
    }
    const product = await Product.findById(product_id);
    if (!product) return res.status(404).json({ detail: "Product not found" });

    const userId = req.user._id.toString();
    let cart = await Cart.findOne({ user_id: userId });

    if (!cart) {
      await Cart.create({ user_id: userId, items: [{ product_id, quantity }] });
    } else {
      const idx = cart.items.findIndex((i) => i.product_id === product_id);
      if (idx >= 0) {
        cart.items[idx].quantity += quantity;
      } else {
        cart.items.push({ product_id, quantity });
      }
      cart.markModified("items");
      await cart.save();
    }

    res.json(await buildCart(userId));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function updateItem(req, res) {
  try {
    const { product_id } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id.toString();

    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) return res.status(404).json({ detail: "Cart empty" });

    const idx = cart.items.findIndex((i) => i.product_id === product_id);
    if (idx < 0) return res.status(404).json({ detail: "Item not in cart" });

    cart.items[idx].quantity = Math.max(1, quantity);
    cart.markModified("items");
    await cart.save();

    res.json(await buildCart(userId));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function removeItem(req, res) {
  try {
    const { product_id } = req.params;
    const userId = req.user._id.toString();

    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) return res.json(await buildCart(userId));

    cart.items = cart.items.filter((i) => i.product_id !== product_id);
    await cart.save();

    res.json(await buildCart(userId));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function clearCart(req, res) {
  try {
    const userId = req.user._id.toString();
    await Cart.findOneAndUpdate({ user_id: userId }, { $set: { items: [] } }, { upsert: true });
    res.json(await buildCart(userId));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
