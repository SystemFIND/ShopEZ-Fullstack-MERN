const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { secret } = require("../utils/auth");

/**
 * Attaches req.user if a valid access_token cookie (or Bearer header) is present.
 * Does NOT reject unauthenticated requests — use requireAuth for that.
 */
async function authenticate(req, res, next) {
  console.log("===== AUTH =====");

  console.log("cookies:", req.cookies);

  let token = req.cookies?.access_token;

  console.log("token:", token);

  if (!token) return next();

  try {
    const payload = jwt.verify(token, secret());

    console.log("payload:", payload);

    const user = await User.findById(payload.sub);

    console.log("user found:", !!user);

    if (user) req.user = user;

  } catch (err) {
    console.log("JWT ERROR:", err.message);
  }

  next();
}

/**
 * Requires req.user to be set (i.e. authenticate() must run first).
 */
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ detail: "Not authenticated" });
  next();
}

/**
 * Returns middleware that requires one of the given roles.
 */
function requireRoles(...roles) {
  return [
    authenticate,
    requireAuth,
    (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ detail: "Forbidden" });
      }
      next();
    },
  ];
}

module.exports = { authenticate, requireAuth, requireRoles };