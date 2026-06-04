const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");

// Build a category lookup map once per request rather than one DB call per product.
// This avoids N+1 queries and silently failing per-product try/catch blocks.
async function buildCategoryMap() {
  const cats = await Category.find({}, "_id name");
  const map = {};
  for (const c of cats) {
    map[c._id.toString()] = c.name;
  }
  return map;
}

function serializeProduct(p, catMap) {
  const catId = p.category_id ? p.category_id.toString() : "";
  const catName = catId && catMap ? (catMap[catId] || null) : null;

  // image_url: use stored value, fall back to first element of images array
  const images = Array.isArray(p.images) ? p.images : [];
  const imageUrl = p.image_url || images[0] || "";

  return {
    id: p._id.toString(),
    name: p.name || "",
    description: p.description || "",
    price: typeof p.price === "number" ? p.price : 0,
    stock: typeof p.stock === "number" ? p.stock : 0,
    category_id: catId,
    category_name: catName,
    image_url: imageUrl,
    images,
    brand: p.brand || "",
    rating: typeof p.rating === "number" ? p.rating : 0,
    sales: typeof p.sales === "number" ? p.sales : 0,
    seller_id: p.seller_id ? p.seller_id.toString() : null,
    created_at: p.created_at || null,
  };
}

// Build a MongoDB filter that matches category_id stored as either a string
// or a native ObjectId — Atlas data from different sources may use either form.
function buildCategoryFilter(category_id) {
  if (!category_id) return null;
  const conditions = [{ category_id: category_id }];
  if (mongoose.Types.ObjectId.isValid(category_id)) {
    conditions.push({ category_id: new mongoose.Types.ObjectId(category_id) });
  }
  return conditions.length === 1 ? conditions[0] : { $or: conditions };
}

function buildProductQuery({ search, category_id, min_price, max_price }) {
  const q = {};
  if (search) q.name = { $regex: search, $options: "i" };

  if (category_id) {
    const catFilter = buildCategoryFilter(category_id);
    Object.assign(q, catFilter);
  }

  if (min_price != null || max_price != null) {
    q.price = {};
    if (min_price != null) q.price.$gte = parseFloat(min_price);
    if (max_price != null) q.price.$lte = parseFloat(max_price);
  }
  return q;
}

async function listProducts(req, res) {
  try {
    const { search, category_id, sort = "newest", min_price, max_price, page = 1, page_size = 12, limit } = req.query;
    const q = buildProductQuery({ search, category_id, min_price, max_price });

    const sortMap = {
      newest: { created_at: -1, _id: -1 },
      price_asc: { price: 1, _id: 1 },
      price_desc: { price: -1, _id: -1 },
      popular: { sales: -1, _id: -1 },
    };
    const sortOpt = sortMap[sort] || sortMap.newest;

    let cursor = Product.find(q).sort(sortOpt);
    if (limit != null) {
      cursor = cursor.limit(parseInt(limit));
    } else {
      const skip = (parseInt(page) - 1) * parseInt(page_size);
      cursor = cursor.skip(skip).limit(parseInt(page_size));
    }

    const [items, catMap] = await Promise.all([cursor, buildCategoryMap()]);
    res.json(items.map((p) => serializeProduct(p, catMap)));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function countProducts(req, res) {
  try {
    const { search, category_id, min_price, max_price } = req.query;
    const q = buildProductQuery({ search, category_id, min_price, max_price });
    const total = await Product.countDocuments(q);
    res.json({ total });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function featuredProducts(req, res) {
  try {
    const [items, catMap] = await Promise.all([
      Product.find().sort({ sales: -1 }).limit(8),
      buildCategoryMap(),
    ]);
    res.json(items.map((p) => serializeProduct(p, catMap)));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function getProduct(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.product_id)) {
      return res.status(400).json({ detail: "Invalid id" });
    }
    const [p, catMap] = await Promise.all([
      Product.findById(req.params.product_id),
      buildCategoryMap(),
    ]);
    if (!p) return res.status(404).json({ detail: "Product not found" });
    res.json(serializeProduct(p, catMap));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function createProduct(req, res) {
  try {
    const { name, description, price, stock = 0, category_id, image_url, images = [], brand = "" } = req.body;
    const p = await Product.create({
      name, description, price, stock, category_id, image_url, images, brand,
      seller_id: req.user._id.toString(),
      rating: 0,
      sales: 0,
    });
    const catMap = await buildCategoryMap();
    res.json(serializeProduct(p, catMap));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function updateProduct(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.product_id)) {
      return res.status(400).json({ detail: "Invalid id" });
    }
    const existing = await Product.findById(req.params.product_id);
    if (!existing) return res.status(404).json({ detail: "Product not found" });
    if (req.user.role === "seller" && existing.seller_id !== req.user._id.toString()) {
      return res.status(403).json({ detail: "Not your product" });
    }

    const fields = ["name", "description", "price", "stock", "category_id", "image_url", "images", "brand"];
    const update = {};
    for (const f of fields) {
      if (req.body[f] != null) update[f] = req.body[f];
    }
    if (!Object.keys(update).length) return res.status(400).json({ detail: "No fields to update" });

    const [p, catMap] = await Promise.all([
      Product.findByIdAndUpdate(req.params.product_id, { $set: update }, { new: true }),
      buildCategoryMap(),
    ]);
    res.json(serializeProduct(p, catMap));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function deleteProduct(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.product_id)) {
      return res.status(400).json({ detail: "Invalid id" });
    }
    const existing = await Product.findById(req.params.product_id);
    if (!existing) return res.status(404).json({ detail: "Product not found" });
    if (req.user.role === "seller" && existing.seller_id !== req.user._id.toString()) {
      return res.status(403).json({ detail: "Not your product" });
    }
    await Product.findByIdAndDelete(req.params.product_id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

module.exports = { listProducts, countProducts, featuredProducts, getProduct, createProduct, updateProduct, deleteProduct };