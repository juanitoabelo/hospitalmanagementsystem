// backend/app.js
// ─────────────────────────────────────────────
// Express server entry point
// Run: node app.js  (requires MongoDB running)
// ─────────────────────────────────────────────
const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const dotenv     = require("dotenv");

dotenv.config();

const authRoutes        = require("./routes/auth");
const patientRoutes     = require("./routes/patients");
const doctorRoutes      = require("./routes/doctors");
const appointmentRoutes = require("./routes/appointments");
const invoiceRoutes     = require("./routes/invoices");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

// ── Routes ────────────────────────────────────
app.use("/api/auth",         authRoutes);
app.use("/api/patients",     patientRoutes);
app.use("/api/doctors",      doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/invoices",     invoiceRoutes);

// ── Health check ──────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));

// ── Global error handler ─────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

// ── Connect to MongoDB & start ────────────────
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/medicore")
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log("Server running on http://localhost:" + PORT));
  })
  .catch(err => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

module.exports = app;
