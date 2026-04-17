// models/index.js — All Database Schemas & Models
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

// ═══════════════════════════════════════════════════════════
// USER MODEL (Auth + RBAC)
// ═══════════════════════════════════════════════════════════
const UserSchema = new Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role:     { type: String, enum: ['admin', 'doctor', 'receptionist', 'patient'], default: 'patient' },
  avatar:   { type: String, default: null },
  isActive: { type: Boolean, default: true },
  lastLogin:{ type: Date, default: null },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// ═══════════════════════════════════════════════════════════
// PATIENT MODEL
// ═══════════════════════════════════════════════════════════
const PatientSchema = new Schema({
  patientId:  { type: String, unique: true }, // Auto-generated e.g. P-20240001
  user:       { type: Schema.Types.ObjectId, ref: 'User', default: null },
  firstName:  { type: String, required: true, trim: true },
  lastName:   { type: String, required: true, trim: true },
  dateOfBirth:{ type: Date, required: true },
  gender:     { type: String, enum: ['male', 'female', 'other'], required: true },
  bloodGroup: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown'], default: 'Unknown' },
  phone:      { type: String, required: true },
  email:      { type: String, lowercase: true, trim: true },
  address: {
    street: String,
    city:   String,
    state:  String,
    zip:    String,
    country:{ type: String, default: 'Philippines' },
  },
  emergencyContact: {
    name:         String,
    relationship: String,
    phone:        String,
  },
  medicalHistory: [{
    condition:   String,
    diagnosedOn: Date,
    notes:       String,
  }],
  allergies:    [String],
  currentMeds:  [String],
  isActive:     { type: Boolean, default: true },
  registeredBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

PatientSchema.pre('save', async function (next) {
  if (this.patientId) return next();
  const count = await mongoose.model('Patient').countDocuments();
  this.patientId = `P-${String(count + 1).padStart(5, '0')}`;
  next();
});

PatientSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

PatientSchema.virtual('age').get(function () {
  const today = new Date();
  const dob = new Date(this.dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
});

PatientSchema.set('toJSON', { virtuals: true });
PatientSchema.set('toObject', { virtuals: true });

// ═══════════════════════════════════════════════════════════
// DOCTOR MODEL
// ═══════════════════════════════════════════════════════════
const DoctorSchema = new Schema({
  doctorId:    { type: String, unique: true },
  user:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
  specialty:   { type: String, required: true },
  qualification:[String],
  licenseNo:   { type: String, required: true, unique: true },
  phone:       { type: String, required: true },
  bio:         { type: String, maxlength: 500 },
  consultationFee: { type: Number, required: true, min: 0 },
  schedule: [{
    day:       { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
    startTime: String, // "09:00"
    endTime:   String, // "17:00"
    slotDuration: { type: Number, default: 30 }, // minutes
  }],
  isAvailable: { type: Boolean, default: true },
  rating:      { type: Number, default: 0, min: 0, max: 5 },
}, { timestamps: true });

DoctorSchema.pre('save', async function (next) {
  if (this.doctorId) return next();
  const count = await mongoose.model('Doctor').countDocuments();
  this.doctorId = `DR-${String(count + 1).padStart(4, '0')}`;
  next();
});

// ═══════════════════════════════════════════════════════════
// APPOINTMENT MODEL
// ═══════════════════════════════════════════════════════════
const AppointmentSchema = new Schema({
  appointmentId: { type: String, unique: true },
  patient:   { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor:    { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date:      { type: Date, required: true },
  startTime: { type: String, required: true }, // "10:00"
  endTime:   { type: String, required: true },
  type:      { type: String, enum: ['consultation','follow-up','emergency','checkup'], default: 'consultation' },
  status:    { type: String, enum: ['scheduled','confirmed','in-progress','completed','cancelled','no-show'], default: 'scheduled' },
  reason:    { type: String, required: true },
  notes:     { type: String },
  diagnosis: { type: String },
  prescription: [{ drug: String, dosage: String, duration: String }],
  bookedBy:  { type: Schema.Types.ObjectId, ref: 'User' },
  cancelledReason: { type: String },
}, { timestamps: true });

AppointmentSchema.pre('save', async function (next) {
  if (this.appointmentId) return next();
  const count = await mongoose.model('Appointment').countDocuments();
  this.appointmentId = `APT-${String(count + 1).padStart(5, '0')}`;
  next();
});

// Compound index to prevent double bookings
AppointmentSchema.index({ doctor: 1, date: 1, startTime: 1, status: 1 });

// ═══════════════════════════════════════════════════════════
// INVOICE MODEL
// ═══════════════════════════════════════════════════════════
const InvoiceSchema = new Schema({
  invoiceId:    { type: String, unique: true },
  patient:      { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  appointment:  { type: Schema.Types.ObjectId, ref: 'Appointment', default: null },
  items: [{
    description: { type: String, required: true },
    category:    { type: String, enum: ['consultation','treatment','medication','lab','procedure','other'] },
    quantity:    { type: Number, default: 1, min: 1 },
    unitPrice:   { type: Number, required: true, min: 0 },
    total:       { type: Number },
  }],
  subtotal:   { type: Number, required: true },
  taxRate:    { type: Number, default: 0 }, // percentage
  taxAmount:  { type: Number, default: 0 },
  discount:   { type: Number, default: 0 },
  totalAmount:{ type: Number, required: true },
  status:     { type: String, enum: ['draft','sent','paid','overdue','cancelled'], default: 'draft' },
  dueDate:    { type: Date, required: true },
  paidAt:     { type: Date, default: null },
  paymentMethod:{ type: String, enum: ['cash','card','insurance','online','other'], default: null },
  notes:      { type: String },
  createdBy:  { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

InvoiceSchema.pre('save', async function (next) {
  // Auto-compute totals
  this.items = this.items.map(item => ({ ...item, total: item.quantity * item.unitPrice }));
  this.subtotal = this.items.reduce((sum, i) => sum + i.total, 0);
  this.taxAmount = (this.subtotal * this.taxRate) / 100;
  this.totalAmount = this.subtotal + this.taxAmount - this.discount;

  if (this.invoiceId) return next();
  const count = await mongoose.model('Invoice').countDocuments();
  this.invoiceId = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  next();
});

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════
const User        = mongoose.model('User', UserSchema);
const Patient     = mongoose.model('Patient', PatientSchema);
const Doctor      = mongoose.model('Doctor', DoctorSchema);
const Appointment = mongoose.model('Appointment', AppointmentSchema);
const Invoice     = mongoose.model('Invoice', InvoiceSchema);

module.exports = { User, Patient, Doctor, Appointment, Invoice };
