const User = require("../models/User");
const { serializeUser } = require("../utils/auth");

async function updateMe(req, res) {
  try {
    const fields = ["name", "phone", "address", "avatar_url"];
    const update = {};
    for (const f of fields) {
      if (req.body[f] != null) update[f] = req.body[f];
    }
    if (Object.keys(update).length) {
      await User.findByIdAndUpdate(req.user._id, { $set: update });
    }
    const fresh = await User.findById(req.user._id);
    res.json(serializeUser(fresh));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

module.exports = { updateMe };
