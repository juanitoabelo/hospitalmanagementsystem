// backend/routes/appointments.js
// ─────────────────────────────────────────────
// GET    /api/appointments          — list (filter by date/doctor/patient/status)
// GET    /api/appointments/:id      — single record
// POST   /api/appointments          — book (double-booking check)
// PUT    /api/appointments/:id      — update status / reschedule
// DELETE /api/appointments/:id      — delete
// ─────────────────────────────────────────────
const router = require("express").Router();
const { Appointment } = require("../models/models");
const { protect, requireRole } = require("../middleware/authMiddleware");

router.use(protect);

// GET /api/appointments
router.get("/", async (req, res) => {
  try {
    const { doctorId, patientId, date, status } = req.query;
    const filter = {};
    if (doctorId)  filter.doctorId  = doctorId;
    if (patientId) filter.patientId = patientId;
    if (date)      filter.date      = date;
    if (status)    filter.status    = status;

    const appointments = await Appointment.find(filter)
      .populate("patientId", "name blood")
      .populate("doctorId",  "name specialty")
      .sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/appointments/:id
router.get("/:id", async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate("patientId", "name phone blood")
      .populate("doctorId",  "name specialty phone");
    if (!appt) return res.status(404).json({ message: "Appointment not found" });
    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/appointments — with double-booking prevention
router.post("/", requireRole("Admin", "Receptionist", "Doctor", "Patient"), async (req, res) => {
  try {
    const { doctorId, date, time, patientId, type, notes } = req.body;

    // Double-booking check: same doctor, date, time, not cancelled
    const conflict = await Appointment.findOne({ doctorId, date, time, status: { $ne: "Cancelled" } });
    if (conflict) {
      return res.status(409).json({
        message: "Double-booking detected: this doctor already has an appointment at that date and time.",
        conflict: { id: conflict._id, time: conflict.time, date: conflict.date },
      });
    }

    const appt = await Appointment.create({ doctorId, date, time, patientId, type, notes, status: "Pending" });
    res.status(201).json(appt);
  } catch (err) {
    // MongoDB unique index violation (code 11000) also catches duplicates
    if (err.code === 11000) {
      return res.status(409).json({ message: "Double-booking detected at database level." });
    }
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/appointments/:id — update status or reschedule
router.put("/:id", requireRole("Admin", "Receptionist", "Doctor"), async (req, res) => {
  try {
    const { doctorId, date, time, status, notes } = req.body;

    // If rescheduling, re-run double-booking check excluding this appointment
    if (date && time && doctorId) {
      const conflict = await Appointment.findOne({
        _id:      { $ne: req.params.id },
        doctorId, date, time,
        status:   { $ne: "Cancelled" },
      });
      if (conflict) {
        return res.status(409).json({ message: "Cannot reschedule: double-booking conflict." });
      }
    }

    const appt = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!appt) return res.status(404).json({ message: "Appointment not found" });
    res.json(appt);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/appointments/:id
router.delete("/:id", requireRole("Admin", "Receptionist"), async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndDelete(req.params.id);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
