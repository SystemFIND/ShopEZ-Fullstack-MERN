const mongoose = require("mongoose");
const Category = require("../models/Category");

function serialize(c) {
  return { id: c._id.toString(), name: c.name, slug: c.slug, description: c.description || "", image_url: c.image_url || "" };
}

async function listCategories(req, res) {
  try {
    const items = await Category.find().sort({ name: 1 });
    res.json(items.map(serialize));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function createCategory(req, res) {
  try {
    const { name, slug, description = "", image_url = "" } = req.body;
    const exists = await Category.findOne({ slug });
    if (exists) return res.status(400).json({ detail: "Slug already exists" });
    const cat = await Category.create({ name, slug, description, image_url });
    res.json(serialize(cat));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function updateCategory(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.category_id)) {
      return res.status(400).json({ detail: "Invalid id" });
    }
    const update = {};
    for (const f of ["name", "slug", "description", "image_url"]) {
      if (req.body[f] != null) update[f] = req.body[f];
    }
    if (!Object.keys(update).length) return res.status(400).json({ detail: "No fields to update" });

    const cat = await Category.findByIdAndUpdate(req.params.category_id, { $set: update }, { new: true });
    if (!cat) return res.status(404).json({ detail: "Category not found" });
    res.json(serialize(cat));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function deleteCategory(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.category_id)) {
      return res.status(400).json({ detail: "Invalid id" });
    }
    await Category.findByIdAndDelete(req.params.category_id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };