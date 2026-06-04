const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const PasswordResetToken = require("../models/PasswordResetToken");
const {
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
} = require("../utils/auth");

async function register(req, res) {
  try {
    const { email, password, name, role = "customer" } = req.body;
    if (!["customer", "seller"].includes(role)) {
      return res.status(400).json({ detail: "Invalid role" });
    }
    const normalEmail = email.toLowerCase().trim();
    const exists = await User.findOne({ email: normalEmail });
    if (exists) return res.status(400).json({ detail: "Email already registered" });

    const user = await User.create({
      email: normalEmail,
      password_hash: await hashPassword(password),
      name: name.trim(),
      role,
    });

    const access = createAccessToken(user._id.toString(), normalEmail, role);
    const refresh = createRefreshToken(user._id.toString());
    setAuthCookies(res, access, refresh);
    res.status(200).json(serializeUser(user));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const normalEmail = email.toLowerCase().trim();
    const ip = req.ip || "unknown";
    const identifier = `${ip}:${normalEmail}`;

    await checkLockout(identifier);

    const user = await User.findOne({ email: normalEmail });
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      await recordFailedAttempt(identifier);
      return res.status(401).json({ detail: "Invalid email or password" });
    }

    await clearAttempts(identifier);
    const access = createAccessToken(user._id.toString(), normalEmail, user.role);
    const refresh = createRefreshToken(user._id.toString());
    setAuthCookies(res, access, refresh);
    res.json(serializeUser(user));
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ detail: err.message });
    res.status(500).json({ detail: err.message });
  }
}

async function logout(req, res) {
  clearAuthCookies(res);
  res.json({ ok: true });
}

async function me(req, res) {
  res.json(serializeUser(req.user));
}

async function refresh(req, res) {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ detail: "No refresh token" });

    const payload = jwt.verify(token, secret());
    if (payload.type !== "refresh") return res.status(401).json({ detail: "Invalid token type" });

    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ detail: "User not found" });

    const access = createAccessToken(user._id.toString(), user.email, user.role);
    res.cookie("access_token", access, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });
    res.json({ ok: true });
  } catch (err) {
    if (err.name === "TokenExpiredError") return res.status(401).json({ detail: "Refresh token expired" });
    res.status(401).json({ detail: "Invalid refresh token" });
  }
}

async function forgotPassword(req, res) {
  try {
    const email = req.body.email.toLowerCase().trim();
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ ok: true, token: null, message: "If the email exists, a reset link will be issued." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 30 * 60 * 1000);
    await PasswordResetToken.create({
      token,
      user_id: user._id.toString(),
      email,
      expires_at: expires,
      used: false,
    });

    res.json({
      ok: true,
      token,
      expires_at: expires.toISOString(),
      message: "Demo mode: copy this token to reset your password.",
    });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, new_password } = req.body;
    const rec = await PasswordResetToken.findOne({ token, used: false });
    if (!rec) return res.status(400).json({ detail: "Invalid or already-used token" });
    if (rec.expires_at < new Date()) return res.status(400).json({ detail: "Token expired" });

    await User.findByIdAndUpdate(rec.user_id, { password_hash: await hashPassword(new_password) });
    await PasswordResetToken.findByIdAndUpdate(rec._id, { used: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}

module.exports = { register, login, logout, me, refresh, forgotPassword, resetPassword };
