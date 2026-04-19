// backend/seed.js
// ─────────────────────────────────────────────
// Run once to populate MongoDB with demo data:
//   cd backend && node seed.js
// ─────────────────────────────────────────────
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

const { User, Patient, Doctor, Appointment, Invoice } = require("./models/models");

const MONGO_URI = process.env.MONGO_URI;

const connectOptions = {
  serverSelectionTimeoutMS: 60000,
  socketTimeoutMS: 60000,
  connectTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
  family: 4,
  tls: true,
  tlsAllowInvalidCertificates: true,
  retryWrites: false,
  retryReads: false,
};

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, connectOptions);
    console.log("✅ Connected successfully!");

    // Clear existing data
    console.log("\nClearing existing data...");
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
    await Invoice.deleteMany({});
    console.log("✅ Cleared existing data");

    // ── Create Users ──────────────────────────────
    console.log("\nCreating users...");
    const hash_admin = await bcrypt.hash("Admin1234!", 12);
    const adminUser = await User.create({
      name: "James Okafor",
      email: "admin@medicore.com",
      passwordHash: hash_admin,
      role: "Admin",
      avatar: "JO"
    });
    console.log("  ✓ Admin user created");
    await new Promise(resolve => setTimeout(resolve, 200));

    const hash_dr1 = await bcrypt.hash("Doctor1234!", 12);
    const doctorUser1 = await User.create({
      name: "Dr. Sarah Chen",
      email: "sarah@medicore.com",
      passwordHash: hash_dr1,
      role: "Doctor",
      avatar: "SC"
    });
    console.log("  ✓ Dr. Sarah Chen created");
    await new Promise(resolve => setTimeout(resolve, 200));

    const hash_dr2 = await bcrypt.hash("Doctor1234!", 12);
    const doctorUser2 = await User.create({
      name: "Dr. Marcus Reid",
      email: "marcus@medicore.com",
      passwordHash: hash_dr2,
      role: "Doctor",
      avatar: "MR"
    });
    console.log("  ✓ Dr. Marcus Reid created");
    await new Promise(resolve => setTimeout(resolve, 200));

    const hash_dr3 = await bcrypt.hash("Doctor1234!", 12);
    const doctorUser3 = await User.create({
      name: "Dr. Priya Nair",
      email: "priya@medicore.com",
      passwordHash: hash_dr3,
      role: "Doctor",
      avatar: "PN"
    });
    console.log("  ✓ Dr. Priya Nair created");
    await new Promise(resolve => setTimeout(resolve, 200));

    const hash_dr4 = await bcrypt.hash("Doctor1234!", 12);
    const doctorUser4 = await User.create({
      name: "Dr. James O'Brien",
      email: "jobrien@medicore.com",
      passwordHash: hash_dr4,
      role: "Doctor",
      avatar: "JB"
    });
    console.log("  ✓ Dr. James O'Brien created");
    await new Promise(resolve => setTimeout(resolve, 200));

    const hash_recep = await bcrypt.hash("Recept1234!", 12);
    const receptionUser = await User.create({
      name: "Maria Santos",
      email: "reception@medicore.com",
      passwordHash: hash_recep,
      role: "Receptionist",
      avatar: "MS"
    });
    console.log("  ✓ Maria Santos (Receptionist) created");
    await new Promise(resolve => setTimeout(resolve, 200));

    const hash_pat = await bcrypt.hash("Patient1234!", 12);
    const patientUser = await User.create({
      name: "Patient Demo",
      email: "patient@medicore.com",
      passwordHash: hash_pat,
      role: "Patient",
      avatar: "PD"
    });
    console.log("  ✓ Patient Demo user created");
    console.log("✅ All users created");

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // ── Create Doctor profiles ────────────────────
    console.log("\nCreating doctor profiles...");
    const chen = await Doctor.create({
      user: doctorUser1._id,
      name: "Dr. Sarah Chen",
      specialty: "Cardiology",
      phone: "+1-555-9001",
      email: "sarah@medicore.com",
      schedule: "Mon-Fri 08:00–17:00",
      experience: 12,
      patients: 48,
      status: "Available",
      avatar: "SC"
    });
    console.log("  ✓ Dr. Sarah Chen (Cardiology)");
    await new Promise(resolve => setTimeout(resolve, 200));

    const reid = await Doctor.create({
      user: doctorUser2._id,
      name: "Dr. Marcus Reid",
      specialty: "Pulmonology",
      phone: "+1-555-9002",
      email: "marcus@medicore.com",
      schedule: "Tue-Sat 09:00–18:00",
      experience: 8,
      patients: 31,
      status: "Available",
      avatar: "MR"
    });
    console.log("  ✓ Dr. Marcus Reid (Pulmonology)");
    await new Promise(resolve => setTimeout(resolve, 200));

    const nair = await Doctor.create({
      user: doctorUser3._id,
      name: "Dr. Priya Nair",
      specialty: "Orthopedics",
      phone: "+1-555-9003",
      email: "priya@medicore.com",
      schedule: "Mon-Thu 07:00–16:00",
      experience: 15,
      patients: 55,
      status: "Busy",
      avatar: "PN"
    });
    console.log("  ✓ Dr. Priya Nair (Orthopedics)");
    await new Promise(resolve => setTimeout(resolve, 200));

    const obrien = await Doctor.create({
      user: doctorUser4._id,
      name: "Dr. James O'Brien",
      specialty: "Neurology",
      phone: "+1-555-9004",
      email: "jobrien@medicore.com",
      schedule: "Wed-Sun 10:00–19:00",
      experience: 20,
      patients: 22,
      status: "Off-Duty",
      avatar: "JB"
    });
    console.log("  ✓ Dr. James O'Brien (Neurology)");
    console.log("✅ All doctors created");

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // ── Create Patients ───────────────────────────
    console.log("\nCreating patients...");
    const elena = await Patient.create({
      name: "Elena Vasquez",
      age: 45,
      blood: "A+",
      address: "12 Oak St, Metro City",
      phone: "+1-555-0101",
      history: "Hypertension, managed with medication",
      status: "Active",
      doctor: chen._id,
      registered: new Date("2024-01-15")
    });
    console.log("  ✓ Elena Vasquez");
    await new Promise(resolve => setTimeout(resolve, 200));

    const thomas = await Patient.create({
      name: "Thomas Brennan",
      age: 62,
      blood: "O-",
      address: "88 Elm Ave, North Side",
      phone: "+1-555-0182",
      history: "Type 2 Diabetes, annual checkups",
      status: "Active",
      doctor: chen._id,
      registered: new Date("2024-02-10")
    });
    console.log("  ✓ Thomas Brennan");
    await new Promise(resolve => setTimeout(resolve, 200));

    const aisha = await Patient.create({
      name: "Aisha Kamara",
      age: 29,
      blood: "B+",
      address: "44 Pine Rd, Eastview",
      phone: "+1-555-0234",
      history: "Asthma, carries inhaler",
      status: "Active",
      doctor: reid._id,
      registered: new Date("2024-03-05")
    });
    console.log("  ✓ Aisha Kamara");
    await new Promise(resolve => setTimeout(resolve, 200));

    const carlos = await Patient.create({
      name: "Carlos Mendez",
      age: 38,
      blood: "AB+",
      address: "7 Birch Ln, Westpark",
      phone: "+1-555-0319",
      history: "Fractured wrist (2023), fully recovered",
      status: "Inactive",
      doctor: nair._id,
      registered: new Date("2023-11-20")
    });
    console.log("  ✓ Carlos Mendez");
    await new Promise(resolve => setTimeout(resolve, 200));

    const liu = await Patient.create({
      name: "Liu Wei",
      age: 54,
      blood: "A-",
      address: "220 Cedar Blvd, Central",
      phone: "+1-555-0401",
      history: "High cholesterol, on statins",
      status: "Active",
      doctor: chen._id,
      registered: new Date("2024-04-01")
    });
    console.log("  ✓ Liu Wei");
    console.log("✅ All patients created");

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // ── Create Appointments ───────────────────────
    console.log("\nCreating appointments...");
    const today = new Date();
    const d = (offset) => {
      const dt = new Date(today);
      dt.setDate(dt.getDate() + offset);
      return dt.toISOString().slice(0, 10);
    };

    const apt1 = await Appointment.create({
      patientId: elena._id,
      doctorId: chen._id,
      date: d(0),
      time: "09:00",
      type: "Checkup",
      status: "Confirmed",
      notes: "Blood pressure review"
    });
    console.log("  ✓ Elena - Checkup with Dr. Chen (Today 09:00)");
    await new Promise(resolve => setTimeout(resolve, 200));

    const apt2 = await Appointment.create({
      patientId: thomas._id,
      doctorId: chen._id,
      date: d(0),
      time: "10:30",
      type: "Follow-up",
      status: "Confirmed",
      notes: "HbA1c results discussion"
    });
    console.log("  ✓ Thomas - Follow-up with Dr. Chen (Today 10:30)");
    await new Promise(resolve => setTimeout(resolve, 200));

    const apt3 = await Appointment.create({
      patientId: aisha._id,
      doctorId: reid._id,
      date: d(1),
      time: "11:00",
      type: "Consultation",
      status: "Pending",
      notes: "Breathing difficulty"
    });
    console.log("  ✓ Aisha - Consultation with Dr. Reid (Tomorrow 11:00)");
    await new Promise(resolve => setTimeout(resolve, 200));

    const apt4 = await Appointment.create({
      patientId: carlos._id,
      doctorId: nair._id,
      date: d(2),
      time: "14:00",
      type: "Checkup",
      status: "Cancelled",
      notes: "Post-recovery follow-up"
    });
    console.log("  ✓ Carlos - Checkup with Dr. Nair (Day 2, 14:00) - Cancelled");
    await new Promise(resolve => setTimeout(resolve, 200));

    const apt5 = await Appointment.create({
      patientId: liu._id,
      doctorId: chen._id,
      date: d(3),
      time: "08:30",
      type: "Consultation",
      status: "Pending",
      notes: "Lipid panel review"
    });
    console.log("  ✓ Liu - Consultation with Dr. Chen (Day 3, 08:30)");
    console.log("✅ All appointments created");

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // ── Create Invoices ───────────────────────────
    console.log("\nCreating invoices...");
    const inv1 = await Invoice.create({
      patientId: elena._id,
      doctorId: chen._id,
      date: new Date("2025-06-14"),
      status: "Paid",
      items: [
        { desc: "Consultation", amount: 150 },
        { desc: "Blood Panel", amount: 85 },
        { desc: "Medication (Lisinopril 30d)", amount: 42 }
      ]
    });
    console.log("  ✓ Elena - Invoice $277.00 (Paid)");
    await new Promise(resolve => setTimeout(resolve, 200));

    const inv2 = await Invoice.create({
      patientId: thomas._id,
      doctorId: chen._id,
      date: new Date("2025-06-20"),
      status: "Pending",
      items: [
        { desc: "Consultation", amount: 150 },
        { desc: "HbA1c Test", amount: 65 }
      ]
    });
    console.log("  ✓ Thomas - Invoice $215.00 (Pending)");
    await new Promise(resolve => setTimeout(resolve, 200));

    const inv3 = await Invoice.create({
      patientId: aisha._id,
      doctorId: reid._id,
      date: new Date("2025-07-02"),
      status: "Paid",
      items: [
        { desc: "Emergency Visit", amount: 280 },
        { desc: "Spirometry", amount: 95 },
        { desc: "Inhaler Prescription", amount: 60 }
      ]
    });
    console.log("  ✓ Aisha - Invoice $435.00 (Paid)");
    await new Promise(resolve => setTimeout(resolve, 200));

    const inv4 = await Invoice.create({
      patientId: liu._id,
      doctorId: chen._id,
      date: new Date("2025-07-08"),
      status: "Pending",
      items: [
        { desc: "Consultation", amount: 150 },
        { desc: "Lipid Panel", amount: 75 }
      ]
    });
    console.log("  ✓ Liu - Invoice $225.00 (Pending)");
    console.log("✅ All invoices created");

    // ── Summary ───────────────────────────────────
    console.log("\n" + "=".repeat(60));
    console.log("✅ SEED COMPLETE!");
    console.log("=".repeat(60));
    console.log("\n📋 LOGIN CREDENTIALS:\n");
    console.log("Role          | Email                      | Password");
    console.log("-".repeat(60));
    console.log("Admin         | admin@medicore.com         | Admin1234!");
    console.log("Doctor        | sarah@medicore.com         | Doctor1234!");
    console.log("Doctor        | marcus@medicore.com        | Doctor1234!");
    console.log("Receptionist  | reception@medicore.com     | Recept1234!");
    console.log("Patient       | patient@medicore.com       | Patient1234!");
    console.log("\n🚀 NEXT STEPS:\n");
    console.log("1. Backend:  cd backend && npm run dev");
    console.log("2. Frontend: npm start (from project root)\n");

  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
