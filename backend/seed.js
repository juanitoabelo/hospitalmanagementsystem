// backend/seed.js
// ─────────────────────────────────────────────
// Run once to populate MongoDB with demo data:
//   cd backend && node seed.js
// ─────────────────────────────────────────────
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const dotenv   = require("dotenv");
dotenv.config();

const { User, Patient, Doctor, Appointment, Invoice } = require("./models/models");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medicore";

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB:", MONGO_URI);

  // ── Wipe existing collections ─────────────────
  await Promise.all([
    User.deleteMany({}),
    Patient.deleteMany({}),
    Doctor.deleteMany({}),
    Appointment.deleteMany({}),
    Invoice.deleteMany({}),
  ]);
  console.log("Cleared existing data.");

  // ── Create Users ──────────────────────────────
  const hash = async (pw) => bcrypt.hash(pw, 12);

  const [adminUser, doctorUser1, doctorUser2, doctorUser3, doctorUser4, receptionUser, patientUser] = await User.insertMany([
    { name: "James Okafor",      email: "admin@medicore.com",       passwordHash: await hash("Admin1234!"),       role: "Admin",        avatar: "JO" },
    { name: "Dr. Sarah Chen",    email: "sarah@medicore.com",       passwordHash: await hash("Doctor1234!"),      role: "Doctor",       avatar: "SC" },
    { name: "Dr. Marcus Reid",   email: "marcus@medicore.com",      passwordHash: await hash("Doctor1234!"),      role: "Doctor",       avatar: "MR" },
    { name: "Dr. Priya Nair",    email: "priya@medicore.com",       passwordHash: await hash("Doctor1234!"),      role: "Doctor",       avatar: "PN" },
    { name: "Dr. James O'Brien", email: "jobrien@medicore.com",     passwordHash: await hash("Doctor1234!"),      role: "Doctor",       avatar: "JB" },
    { name: "Maria Santos",      email: "reception@medicore.com",   passwordHash: await hash("Recept1234!"),      role: "Receptionist", avatar: "MS" },
    { name: "Patient Demo",      email: "patient@medicore.com",     passwordHash: await hash("Patient1234!"),     role: "Patient",      avatar: "PD" },
  ]);
  console.log("Created users.");

  // ── Create Doctor profiles ────────────────────
  const [chen, reid, nair, obrien] = await Doctor.insertMany([
    { user: doctorUser1._id, name: "Dr. Sarah Chen",    specialty: "Cardiology",   phone: "+1-555-9001", email: "sarah@medicore.com",   schedule: "Mon-Fri 08:00–17:00", experience: 12, patients: 48, status: "Available", avatar: "SC" },
    { user: doctorUser2._id, name: "Dr. Marcus Reid",   specialty: "Pulmonology",  phone: "+1-555-9002", email: "marcus@medicore.com",  schedule: "Tue-Sat 09:00–18:00", experience: 8,  patients: 31, status: "Available", avatar: "MR" },
    { user: doctorUser3._id, name: "Dr. Priya Nair",    specialty: "Orthopedics",  phone: "+1-555-9003", email: "priya@medicore.com",   schedule: "Mon-Thu 07:00–16:00", experience: 15, patients: 55, status: "Busy",      avatar: "PN" },
    { user: doctorUser4._id, name: "Dr. James O'Brien", specialty: "Neurology",    phone: "+1-555-9004", email: "jobrien@medicore.com", schedule: "Wed-Sun 10:00–19:00", experience: 20, patients: 22, status: "Off-Duty",  avatar: "JB" },
  ]);
  console.log("Created doctors.");

  // ── Create Patients ───────────────────────────
  const [elena, thomas, aisha, carlos, liu] = await Patient.insertMany([
    { name: "Elena Vasquez",  age: 45, blood: "A+",  address: "12 Oak St, Metro City",   phone: "+1-555-0101", history: "Hypertension, managed with medication",   status: "Active",   doctor: chen._id,   registered: new Date("2024-01-15") },
    { name: "Thomas Brennan", age: 62, blood: "O-",  address: "88 Elm Ave, North Side",  phone: "+1-555-0182", history: "Type 2 Diabetes, annual checkups",         status: "Active",   doctor: chen._id,   registered: new Date("2024-02-10") },
    { name: "Aisha Kamara",   age: 29, blood: "B+",  address: "44 Pine Rd, Eastview",    phone: "+1-555-0234", history: "Asthma, carries inhaler",                 status: "Active",   doctor: reid._id,   registered: new Date("2024-03-05") },
    { name: "Carlos Mendez",  age: 38, blood: "AB+", address: "7 Birch Ln, Westpark",    phone: "+1-555-0319", history: "Fractured wrist (2023), fully recovered", status: "Inactive", doctor: nair._id,   registered: new Date("2023-11-20") },
    { name: "Liu Wei",        age: 54, blood: "A-",  address: "220 Cedar Blvd, Central", phone: "+1-555-0401", history: "High cholesterol, on statins",             status: "Active",   doctor: chen._id,   registered: new Date("2024-04-01") },
  ]);
  console.log("Created patients.");

  // ── Create Appointments ───────────────────────
  const today = new Date();
  const d = (offset) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + offset);
    return dt.toISOString().slice(0, 10);
  };

  await Appointment.insertMany([
    { patientId: elena._id,  doctorId: chen._id, date: d(0),  time: "09:00", type: "Checkup",      status: "Confirmed", notes: "Blood pressure review"       },
    { patientId: thomas._id, doctorId: chen._id, date: d(0),  time: "10:30", type: "Follow-up",    status: "Confirmed", notes: "HbA1c results discussion"     },
    { patientId: aisha._id,  doctorId: reid._id, date: d(1),  time: "11:00", type: "Consultation", status: "Pending",   notes: "Breathing difficulty"         },
    { patientId: carlos._id, doctorId: nair._id, date: d(2),  time: "14:00", type: "Checkup",      status: "Cancelled", notes: "Post-recovery follow-up"      },
    { patientId: liu._id,    doctorId: chen._id, date: d(3),  time: "08:30", type: "Consultation", status: "Pending",   notes: "Lipid panel review"           },
  ]);
  console.log("Created appointments.");

  // ── Create Invoices ───────────────────────────
  await Invoice.insertMany([
    { patientId: elena._id,  doctorId: chen._id, date: new Date("2025-06-14"), status: "Paid",    items: [{ desc: "Consultation", amount: 150 }, { desc: "Blood Panel", amount: 85 }, { desc: "Medication (Lisinopril 30d)", amount: 42 }] },
    { patientId: thomas._id, doctorId: chen._id, date: new Date("2025-06-20"), status: "Pending", items: [{ desc: "Consultation", amount: 150 }, { desc: "HbA1c Test", amount: 65 }] },
    { patientId: aisha._id,  doctorId: reid._id, date: new Date("2025-07-02"), status: "Paid",    items: [{ desc: "Emergency Visit", amount: 280 }, { desc: "Spirometry", amount: 95 }, { desc: "Inhaler Prescription", amount: 60 }] },
    { patientId: liu._id,    doctorId: chen._id, date: new Date("2025-07-08"), status: "Pending", items: [{ desc: "Consultation", amount: 150 }, { desc: "Lipid Panel", amount: 75 }] },
  ]);
  console.log("Created invoices.");

  // ── Summary ───────────────────────────────────
  console.log("\n✅ Seed complete! Login credentials:\n");
  console.log("  Role          | Email                     | Password");
  console.log("  --------------|---------------------------|---------------");
  console.log("  Admin         | admin@medicore.com        | Admin1234!");
  console.log("  Doctor        | sarah@medicore.com        | Doctor1234!");
  console.log("  Doctor        | marcus@medicore.com       | Doctor1234!");
  console.log("  Receptionist  | reception@medicore.com    | Recept1234!");
  console.log("  Patient       | patient@medicore.com      | Patient1234!");
  console.log("\n  Start the backend: npm run dev");
  console.log("  Start the frontend: npm start (from project root)\n");

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
