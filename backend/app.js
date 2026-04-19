// backend/app.js
// ─────────────────────────────────────────────
// Express server entry point
// Run: node app.js  (requires MongoDB running)
// ─────────────────────────────────────────────
const express    = require("express");
const mongoose   = require("mongoose");
const { MongoClient } = require("mongodb");
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

// Global flag for mock mode
global.isMockMode = false;

function normalizeMongoUri(uri) {
  if (typeof uri !== "string") return uri;
  if (/%[0-9A-Fa-f]{2}/.test(uri)) return uri;

  try {
    const parsed = new URL(uri);
    if (!parsed.username && !parsed.password) return uri;

    const auth = `${encodeURIComponent(parsed.username)}:${encodeURIComponent(parsed.password)}`;
    return `${parsed.protocol}//${auth}@${parsed.host}${parsed.pathname}${parsed.search}`;
  } catch (err) {
    return uri;
  }
}

const MONGO_URI = normalizeMongoUri(process.env.MONGO_URI || "mongodb://localhost:27017/medicore");

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
async function connectToMongoDB() {
  try {
    // First try with raw MongoDB driver (known to work with Atlas)
    console.log("🔄 Connecting to MongoDB Atlas...");
    const client = new MongoClient(MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      maxPoolSize: 5,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      family: 4,
      tls: true,
      tlsAllowInvalidCertificates: true,
    });

    await client.connect();
    console.log("✅ Raw MongoDB driver connected successfully");

    // Extract database name from URI or use default
    const dbName = MONGO_URI.includes('abelocreative') ? 'medicore' : 'medicore';
    const db = client.db(dbName);

    // Configure Mongoose to use the existing connection
    mongoose.connection.readyState = 1; // Set to connected
    mongoose.connection.db = db;
    mongoose.connection.client = client;

    console.log("✅ Mongoose configured to use existing MongoDB connection");
    console.log("📍 Connected to database:", dbName);

    // Start the server
    app.listen(PORT, () => {
      console.log("🚀 Server running on http://localhost:" + PORT);
      console.log("📊 API endpoints available at /api/*");
      console.log("💾 Using MongoDB Atlas database");
    });

  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    console.error("💡 Hint: verify your MONGO_URI and network access to the MongoDB host.");
    console.error("🔧 If using Atlas, ensure MONGO_TLS_ALLOW_INVALID_CERTS=true in .env");
    console.log("⚠️  Falling back to mock data mode for development...");

    // Set mock mode flag
    global.isMockMode = true;

    // Configure Mongoose for mock mode (no actual database)
    mongoose.connection.readyState = 1; // Pretend we're connected

    // Start the server in mock mode
    app.listen(PORT, () => {
      console.log("🚀 Server running on http://localhost:" + PORT + " (MOCK MODE)");
      console.log("📊 API endpoints available at /api/*");
      console.log("🎭 Using mock data - database operations will be simulated");
      console.log("💡 To use real database, fix MongoDB connection and restart");
    });
  }
}

connectToMongoDB();

module.exports = app;
