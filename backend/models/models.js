// backend/models/models.js
// ─────────────────────────────────────────────
// Mongoose schemas for all HMS collections:
// User, Patient, Doctor, Appointment, Invoice
// ─────────────────────────────────────────────
const mongoose = require("mongoose");
const { Schema } = mongoose;

// ── User ──────────────────────────────────────
const UserSchema = new Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, enum: ["Admin", "Doctor", "Receptionist", "Patient"], default: "Patient" },
  avatar:       { type: String },
}, { timestamps: true });

// ── Patient ───────────────────────────────────
const PatientSchema = new Schema({
  name:       { type: String, required: true, trim: true },
  age:        { type: Number, required: true, min: 0 },
  blood:      { type: String, enum: ["A+","A-","B+","B-","O+","O-","AB+","AB-"] },
  address:    { type: String },
  phone:      { type: String },
  history:    { type: String, default: "" },        // medical history notes
  status:     { type: String, enum: ["Active","Inactive"], default: "Active" },
  doctor:     { type: Schema.Types.ObjectId, ref: "Doctor" },
  registered: { type: Date, default: Date.now },
}, { timestamps: true });

// ── Doctor ────────────────────────────────────
const DoctorSchema = new Schema({
  user:       { type: Schema.Types.ObjectId, ref: "User", required: true },  // links to User
  specialty:  { type: String, required: true },
  phone:      { type: String },
  email:      { type: String },
  schedule:   { type: String },                    // e.g. "Mon-Fri 09:00–17:00"
  experience: { type: Number, default: 0 },        // years
  patients:   { type: Number, default: 0 },        // current patient count
  status:     { type: String, enum: ["Available","Busy","Off-Duty"], default: "Available" },
  avatar:     { type: String },
}, { timestamps: true });

// ── Appointment ───────────────────────────────
const AppointmentSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  doctorId:  { type: Schema.Types.ObjectId, ref: "Doctor",  required: true },
  date:      { type: String, required: true },      // "YYYY-MM-DD"
  time:      { type: String, required: true },      // "HH:MM"
  type:      { type: String, enum: ["Checkup","Consultation","Follow-up","Emergency","Surgery"], default: "Checkup" },
  status:    { type: String, enum: ["Pending","Confirmed","Cancelled"], default: "Pending" },
  notes:     { type: String, default: "" },
}, { timestamps: true });

// Compound index prevents double-booking at DB level
AppointmentSchema.index(
  { doctorId: 1, date: 1, time: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: "Cancelled" } } }
);

// ── Invoice ───────────────────────────────────
const InvoiceLineItem = new Schema({
  desc:   { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
}, { _id: false });

const InvoiceSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  doctorId:  { type: Schema.Types.ObjectId, ref: "Doctor",  required: true },
  items:     { type: [InvoiceLineItem], required: true },
  status:    { type: String, enum: ["Pending","Paid"], default: "Pending" },
  date:      { type: Date, default: Date.now },
}, { timestamps: true });

// Virtual: total amount (sum of all line items)
InvoiceSchema.virtual("total").get(function () {
  return this.items.reduce((sum, item) => sum + item.amount, 0);
});

// ── Exports ───────────────────────────────────
module.exports = {
  User:        mongoose.model("User",        UserSchema),
  Patient:     mongoose.model("Patient",     PatientSchema),
  Doctor:      mongoose.model("Doctor",      DoctorSchema),
  Appointment: mongoose.model("Appointment", AppointmentSchema),
  Invoice:     mongoose.model("Invoice",     InvoiceSchema),
};
