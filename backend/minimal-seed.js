// backend/minimal-seed.js
// ─────────────────────────────────────────────
// Minimal seed script with essential data only
// Run: node minimal-seed.js
// ─────────────────────────────────────────────
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

const { User, Patient, Doctor, Appointment, Invoice } = require("./models/models");

const MONGO_URI = process.env.MONGO_URI;

const connectOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 60000,
  maxPoolSize: 5,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  family: 4,
  tls: true,
  tlsAllowInvalidCertificates: false,
};

async function minimalSeed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, connectOptions);
    console.log("✅ Connected successfully!");

    // Clear existing data
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
    await Invoice.deleteMany({});
    console.log("✅ Cleared existing data");

    // Create just one admin user
    console.log("Creating admin user...");
    const hash = await bcrypt.hash("Admin1234!", 12);
    const adminUser = await User.create({
      name: "James Okafor",
      email: "admin@medicore.com",
      passwordHash: hash,
      role: "Admin",
      avatar: "JO"
    });
    console.log("✅ Created admin user");

    // Create one doctor
    console.log("Creating doctor...");
    const doctorUser = await User.create({
      name: "Dr. Sarah Chen",
      email: "sarah@medicore.com",
      passwordHash: await bcrypt.hash("Doctor1234!", 12),
      role: "Doctor",
      avatar: "SC"
    });
    const doctor = await Doctor.create({
      user: doctorUser._id,
      name: "Dr. Sarah Chen",
      specialty: "Cardiology",
      phone: "+1-555-9001",
      email: "sarah@medicore.com",
      schedule: "Mon-Fri 08:00–17:00",
      experience: 12,
      patients: 0,
      status: "Available",
      avatar: "SC"
    });
    console.log("✅ Created doctor");

    // Create one patient
    console.log("Creating patient...");
    const patient = await Patient.create({
      name: "Elena Vasquez",
      age: 45,
      blood: "A+",
      address: "12 Oak St, Metro City",
      phone: "+1-555-0101",
      history: "Hypertension, managed with medication",
      status: "Active",
      doctor: doctor._id,
      registered: new Date("2024-01-15")
    });
    console.log("✅ Created patient");

    console.log("\n🎉 Minimal seed completed successfully!");
    console.log("\n📋 Login credentials:");
    console.log("   Admin: admin@medicore.com / Admin1234!");
    console.log("   Doctor: sarah@medicore.com / Doctor1234!");

  } catch (err) {
    console.error("❌ Minimal seed failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

minimalSeed();