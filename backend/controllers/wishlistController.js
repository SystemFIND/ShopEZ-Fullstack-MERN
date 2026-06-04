const mongoose = require("mongoose");
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const Category = require("../models/Category");

async function serializeProduct(p) {
  let cat_name = null;
  if (p.category_id) {
    try {
      const cat = await Category.findById(p.category_id);
      if (cat) cat_name = cat.name;
    } catch {}
  }
  return {
    id: p._id.toString(),
    name: p.name,
    description: p.description || "",
    price: p.price,
    stock: p.stock ?? 0,
    category_id: p.category_id || "",
    category_name: cat_name,
    image_url: p.image_url,
    images: p.images || [],
    brand: p.brand || "",
    rating: p.rating ?? 0,
    sales: p.sales ?? 0,
    seller_id: p.seller_id || null,
    created_at: p.created_at,
  };
}

async function getWishlist(req, res) {
  try {
    const userId = req.user._id.toString();
    const wl = await Wishlist.findOne({ user_id: userId });
    const pids = wl ? wl.product_ids : [];
    const products = [];
    for (const pid of pids) {
      try {
        const p = await Product.findById(pid);
        if (p) products.push(await serializeProduct(p));
      } catch {}
    }
    res.json({ product_ids: pids, items: products });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function addToWishlist(req, res) {
  try {
    const { product_id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(product_id)) {
      return res.status(400).json({ detail: "Invalid id" });
    }
    const userId = req.user._id.toString();
    await Wishlist.findOneAndUpdate(
      { user_id: userId },
      { $addToSet: { product_ids: product_id } },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function removeFromWishlist(req, res) {
  try {
    const { product_id } = req.params;
    const userId = req.user._id.toString();
    await Wishlist.findOneAndUpdate(
      { user_id: userId },
      { $pull: { product_ids: product_id } }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
