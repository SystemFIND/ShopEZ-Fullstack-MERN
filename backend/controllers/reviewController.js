const mongoose = require("mongoose");
const Review = require("../models/Review");
const Product = require("../models/Product");

function serialize(r) {
  return {
    id: r._id.toString(),
    product_id: r.product_id,
    user_id: r.user_id,
    user_name: r.user_name || "",
    rating: r.rating,
    comment: r.comment || "",
    created_at: r.created_at,
  };
}

async function recomputeRating(productId) {
  const agg = await Review.aggregate([
    { $match: { product_id: productId } },
    { $group: { _id: "$product_id", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const avg = agg.length ? Math.round(agg[0].avg * 10) / 10 : 0;
  const count = agg.length ? agg[0].count : 0;
  try {
    await Product.findByIdAndUpdate(productId, { $set: { rating: avg, review_count: count } });
  } catch {}
}

async function listReviews(req, res) {
  try {
    const { product_id } = req.params;
    const items = await Review.find({ product_id }).sort({ created_at: -1 }).limit(200);
    res.json(items.map(serialize));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function createReview(req, res) {
  try {
    const { product_id } = req.params;
    const { rating, comment = "" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(product_id)) {
      return res.status(400).json({ detail: "Invalid product id" });
    }
    const prod = await Product.findById(product_id);
    if (!prod) return res.status(404).json({ detail: "Product not found" });

    const userId = req.user._id.toString();
    const existing = await Review.findOne({ product_id, user_id: userId });

    let doc;
    if (existing) {
      doc = await Review.findByIdAndUpdate(
        existing._id,
        { $set: { rating, comment, created_at: new Date() } },
        { new: true }
      );
    } else {
      doc = await Review.create({
        product_id,
        user_id: userId,
        user_name: req.user.name || "",
        rating,
        comment,
      });
    }

    await recomputeRating(product_id);
    res.json(serialize(doc));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function deleteReview(req, res) {
  try {
    const { product_id, review_id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(review_id)) {
      return res.status(400).json({ detail: "Invalid id" });
    }
    const r = await Review.findById(review_id);
    if (!r) return res.status(404).json({ detail: "Review not found" });
    if (r.user_id !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ detail: "Forbidden" });
    }
    await Review.findByIdAndDelete(review_id);
    await recomputeRating(product_id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

module.exports = { listReviews, createReview, deleteReview };
