// backend/routes/doctors.js
// ─────────────────────────────────────────────
// GET    /api/doctors        — list all
// GET    /api/doctors/:id    — single record
// POST   /api/doctors        — create (Admin only)
// PUT    /api/doctors/:id    — update (Admin only)
// DELETE /api/doctors/:id    — delete (Admin only)
// ─────────────────────────────────────────────
const router = require("express").Router();
const { Doctor } = require("../models/models");
const { protect, requireRole } = require("../middleware/authMiddleware");

router.use(protect);

// GET /api/doctors
router.get("/", async (req, res) => {
  try {
    const { status, specialty } = req.query;
    const filter = {};
    if (status)    filter.status    = status;
    if (specialty) filter.specialty = specialty;

    const doctors = await Doctor.find(filter)
      .populate("user", "name email")
      .sort({ name: 1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/doctors/:id
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate("user", "name email");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/doctors
router.post("/", requireRole("Admin"), async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/doctors/:id
router.put("/:id", requireRole("Admin"), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/doctors/:id
router.delete("/:id", requireRole("Admin"), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: "Doctor removed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
