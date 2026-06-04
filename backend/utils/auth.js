const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const LoginAttempt = require("../models/LoginAttempt");

const ACCESS_TTL_SEC = 60 * 60 * 24;      // 1 day
const REFRESH_TTL_SEC = 60 * 60 * 24 * 7; // 7 days
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_MINUTES = 15;

function secret() {
  return process.env.JWT_SECRET || "dev_secret_change_me";
}

async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

async function verifyPassword(plain, hash) {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

function createAccessToken(userId, email, role) {
  return jwt.sign(
    { sub: userId, email, role, type: "access" },
    secret(),
    { expiresIn: ACCESS_TTL_SEC }
  );
}

function createRefreshToken(userId) {
  return jwt.sign(
    { sub: userId, type: "refresh" },
    secret(),
    { expiresIn: REFRESH_TTL_SEC }
  );
}

function setAuthCookies(res, access, refresh) {
  res.cookie("access_token", access, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: ACCESS_TTL_SEC * 1000,
    path: "/",
  });
  res.cookie("refresh_token", refresh, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: REFRESH_TTL_SEC * 1000,
    path: "/",
  });
}

function clearAuthCookies(res) {
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/" });
}

function serializeUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name || "",
    role: user.role || "customer",
    avatar_url: user.avatar_url || null,
    phone: user.phone || null,
    address: user.address || null,
    created_at: user.created_at,
  };
}

async function checkLockout(identifier) {
  const rec = await LoginAttempt.findOne({ identifier });
  if (!rec) return;
  if (rec.count >= LOCKOUT_THRESHOLD && rec.locked_until && rec.locked_until > new Date()) {
    const err = new Error("Too many failed attempts. Try again later.");
    err.statusCode = 429;
    throw err;
  }
}

async function recordFailedAttempt(identifier) {
  const rec = await LoginAttempt.findOne({ identifier });
  const now = new Date();
  if (!rec) {
    await LoginAttempt.create({ identifier, count: 1, locked_until: null, updated_at: now });
    return;
  }
  const newCount = rec.count + 1;
  const update = { count: newCount, updated_at: now };
  if (newCount >= LOCKOUT_THRESHOLD) {
    update.locked_until = new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000);
  }
  await LoginAttempt.findOneAndUpdate({ identifier }, { $set: update });
}

async function clearAttempts(identifier) {
  await LoginAttempt.deleteOne({ identifier });
}

module.exports = {
  hashPassword,
  verifyPassword,
  createAccessToken,
  createRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  serializeUser,
  checkLockout,
  recordFailedAttempt,
  clearAttempts,
  secret,
};
