const dns = require('dns');

dns.setServers(['1.1.1.1', '8.8.8.8']);

const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/shopez";
  await mongoose.connect(uri);
  console.log("MongoDB connected:", uri);
}

module.exports = connectDB;
