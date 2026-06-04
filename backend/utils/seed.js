require("dotenv").config();
const mongoose = require("mongoose");
const { hashPassword, verifyPassword } = require("./auth");
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");

const CATEGORIES = [
  {
    name: "Apparel", slug: "apparel", description: "Everyday wear and basics",
    image_url: "https://images.pexels.com/photos/8408556/pexels-photo-8408556.jpeg",
  },
  {
    name: "Outerwear", slug: "outerwear", description: "Jackets and coats",
    image_url: "https://images.pexels.com/photos/33847264/pexels-photo-33847264.jpeg",
  },
  {
    name: "Accessories", slug: "accessories", description: "Finishing touches",
    image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363",
  },
  {
    name: "Footwear", slug: "footwear", description: "Shoes and boots",
    image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
  },
  {
    name: "Home", slug: "home", description: "For your space",
    image_url: "https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea",
  },
];

const PRODUCTS = [
  {
    name: "Weekend Denim Set",
    description: "A relaxed denim set that pairs effortlessly with anything in your closet. Crafted from 100% organic cotton with a soft, broken-in feel.",
    price: 89.0, stock: 24,
    image_url: "https://images.pexels.com/photos/8408556/pexels-photo-8408556.jpeg",
    images: ["https://images.pexels.com/photos/8408556/pexels-photo-8408556.jpeg", "https://images.pexels.com/photos/8408539/pexels-photo-8408539.jpeg"],
    category_slug: "apparel", brand: "ShopEZ",
  },
  {
    name: "Essential Cotton Tees (3-Pack)",
    description: "Our most-loved tees in a curated three-pack. Pre-washed for a perfect, lived-in fit.",
    price: 45.0, stock: 80,
    image_url: "https://images.pexels.com/photos/8408539/pexels-photo-8408539.jpeg",
    images: ["https://images.pexels.com/photos/8408539/pexels-photo-8408539.jpeg"],
    category_slug: "apparel", brand: "ShopEZ",
  },
  {
    name: "Signature Silk Slip Dress",
    description: "Bias-cut silk slip in midnight black. Designed to drape beautifully and dressed up or down with equal ease.",
    price: 168.0, stock: 12,
    image_url: "https://images.unsplash.com/photo-1547587091-d639c1c338b3",
    images: ["https://images.unsplash.com/photo-1547587091-d639c1c338b3"],
    category_slug: "apparel", brand: "ShopEZ",
  },
  {
    name: "Classic Leather Moto Jacket",
    description: "Hand-finished leather moto with an updated, slim silhouette. Polished hardware and a smooth satin lining.",
    price: 320.0, stock: 8,
    image_url: "https://images.pexels.com/photos/33847264/pexels-photo-33847264.jpeg",
    images: ["https://images.pexels.com/photos/33847264/pexels-photo-33847264.jpeg"],
    category_slug: "outerwear", brand: "ShopEZ",
  },
  {
    name: "Everyday Basic Tee",
    description: "The white tee, perfected. Mid-weight cotton jersey with a clean, universal fit.",
    price: 28.0, stock: 120,
    image_url: "https://images.unsplash.com/photo-1612242879330-cd06b2696e56",
    images: ["https://images.unsplash.com/photo-1612242879330-cd06b2696e56"],
    category_slug: "apparel", brand: "ShopEZ",
  },
  {
    name: "Textured Winter Stole",
    description: "An oversized, hand-woven stole in a tonal natural palette.",
    price: 75.0, stock: 30,
    image_url: "https://images.unsplash.com/photo-1771012266273-56a79f89adee",
    images: ["https://images.unsplash.com/photo-1771012266273-56a79f89adee"],
    category_slug: "accessories", brand: "ShopEZ",
  },
  {
    name: "Modern Leather Sofa",
    description: "A timeless leather sofa with a contemporary low profile. Hand-stitched and built to age beautifully.",
    price: 1899.0, stock: 4,
    image_url: "https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea",
    images: ["https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea"],
    category_slug: "home", brand: "ShopEZ Home",
  },
  {
    name: "Minimal Sneakers",
    description: "Clean, low-profile sneakers in soft leather. Cushioned insole and rubber sole.",
    price: 145.0, stock: 36,
    image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff"],
    category_slug: "footwear", brand: "ShopEZ",
  },
  {
    name: "Canvas Tote Bag",
    description: "A roomy, heavy-weight canvas tote with reinforced straps. The perfect everyday carryall.",
    price: 32.0, stock: 90,
    image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363",
    images: ["https://images.unsplash.com/photo-1544816155-12df9643f363"],
    category_slug: "accessories", brand: "ShopEZ",
  },
  {
    name: "Cashmere Crewneck",
    description: "A featherweight 100% cashmere crewneck in a versatile oatmeal tone.",
    price: 195.0, stock: 20,
    image_url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633",
    images: ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633"],
    category_slug: "apparel", brand: "ShopEZ",
  },
  {
    name: "Wool Overcoat",
    description: "An impeccably tailored wool overcoat in a long, modern silhouette. Italian fabric, made to last.",
    price: 425.0, stock: 6,
    image_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea",
    images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea"],
    category_slug: "outerwear", brand: "ShopEZ",
  },
  {
    name: "Ceramic Vase Set",
    description: "A pair of hand-thrown ceramic vases in matte off-white. Sculptural shapes for everyday styling.",
    price: 58.0, stock: 25,
    image_url: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d",
    images: ["https://images.unsplash.com/photo-1578500494198-246f612d3b3d"],
    category_slug: "home", brand: "ShopEZ Home",
  },
];

async function seedUser(emailEnv, passwordEnv, name, role, defaultEmail, defaultPassword) {
  const email = (process.env[emailEnv] || defaultEmail).toLowerCase();
  const password = process.env[passwordEnv] || defaultPassword;

  const existing = await User.findOne({ email });
  if (!existing) {
    await User.create({ email, password_hash: await hashPassword(password), name, role });
    console.log(`  Seeded ${role}: ${email}`);
  } else {
    // Keep password in sync with .env
    const match = await verifyPassword(password, existing.password_hash);
    if (!match) {
      await User.findOneAndUpdate({ email }, { $set: { password_hash: await hashPassword(password), role } });
      console.log(`  Updated password for ${email}`);
    }
  }
}

async function seed() {
  console.log("Running seed...");

  await seedUser("ADMIN_EMAIL", "ADMIN_PASSWORD", "Admin", "admin", "admin@shopez.com", "admin123");
  await seedUser("SELLER_EMAIL", "SELLER_PASSWORD", "Demo Seller", "seller", "seller@shopez.com", "seller123");
  await seedUser("CUSTOMER_EMAIL", "CUSTOMER_PASSWORD", "Demo Customer", "customer", "customer@shopez.com", "customer123");

  // Categories — upsert by slug, always write image_url so existing Atlas docs get it
  const slugToId = {};
  for (const cat of CATEGORIES) {
    const doc = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { $set: { name: cat.name, description: cat.description, image_url: cat.image_url } },
      { upsert: true, new: true }
    );
    slugToId[cat.slug] = doc._id.toString();
    console.log(`  Upserted category: ${cat.name}`);
  }

  // Products — only if collection is empty
  const count = await Product.countDocuments();
  if (count === 0) {
    const seller = await User.findOne({ role: "seller" });
    const sellerId = seller ? seller._id.toString() : null;

    const docs = PRODUCTS.map((p) => {
      const { category_slug, ...rest } = p;
      return {
        ...rest,
        category_id: slugToId[category_slug] || "",
        seller_id: sellerId,
        rating: 4.5,
        sales: 0,
      };
    });

    await Product.insertMany(docs);
    console.log(`  Seeded ${docs.length} products`);
  }

  console.log("Seed complete.");
}

// Allow running directly: node utils/seed.js
if (require.main === module) {
  const connectDB = require("../config/db");
  connectDB()
    .then(seed)
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1); });
}

module.exports = seed;