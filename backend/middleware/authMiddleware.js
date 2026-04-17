// backend/middleware/authMiddleware.js
// ─────────────────────────────────────────────
// JWT verification + Role-Based Access Control
// Usage: router.get("/", protect, requireRole("Admin"), handler)
// ─────────────────────────────────────────────
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "medicore-dev-secret-change-in-production";

/**
 * protect — verifies Bearer JWT in Authorization header.
 * Attaches decoded payload to req.user on success.
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * requireRole — restricts route to one or more roles.
 * Must be used AFTER protect middleware.
 * @param {...string} roles - allowed roles
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ message: `Access denied. Required role(s): ${roles.join(", ")}` });
  }
  next();
};

/**
 * RBAC permission matrix — mirrors frontend auth.js
 * Checked by route handlers for fine-grained control.
 */
const PERMISSIONS = {
  Admin:        { patients: ["r","w","d"], appointments: ["r","w","d"], doctors: ["r","w","d"], billing: ["r","w","d"] },
  Doctor:       { patients: ["r","w"],     appointments: ["r","w"],     doctors: ["r"],         billing: ["r"]         },
  Receptionist: { patients: ["r","w"],     appointments: ["r","w","d"], doctors: ["r"],         billing: ["r"]         },
  Patient:      { patients: ["r"],         appointments: ["r","w"],     doctors: ["r"],         billing: ["r"]         },
};

const hasPermission = (role, resource, action) =>
  PERMISSIONS[role]?.[resource]?.includes(action) ?? false;

module.exports = { protect, requireRole, hasPermission };
