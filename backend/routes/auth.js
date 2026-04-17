// backend/routes/auth.js
// ─────────────────────────────────────────────
// POST /api/auth/register  — create account
// POST /api/auth/login     — get JWT token
// GET  /api/auth/me        — current user info
// ─────────────────────────────────────────────
const router  = require("express").Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const { User } = require("../models/models");
const { protect } = require("../middleware/authMiddleware");

const JWT_SECRET  = process.env.JWT_SECRET  || "medicore-dev-secret-change-in-production";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "1h";

const issueToken = (user) =>
  jwt.sign({ sub: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "name, email, and password are required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, role: role || "Patient" });
    res.status(201).json({ token: issueToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    res.json({ token: issueToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me  (protected)
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
