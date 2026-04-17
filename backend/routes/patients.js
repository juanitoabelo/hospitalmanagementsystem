// backend/routes/patients.js
// ─────────────────────────────────────────────
// GET    /api/patients        — list all
// GET    /api/patients/:id    — single record
// POST   /api/patients        — create
// PUT    /api/patients/:id    — update
// DELETE /api/patients/:id    — delete (Admin only)
// ─────────────────────────────────────────────
const router = require("express").Router();
const { Patient } = require("../models/models");
const { protect, requireRole } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// GET /api/patients
router.get("/", async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: "i" };

    const patients = await Patient.find(filter)
      .populate("doctor", "name specialty")
      .sort({ registered: -1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/patients/:id
router.get("/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate("doctor", "name specialty");
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/patients
router.post("/", requireRole("Admin", "Receptionist", "Doctor"), async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/patients/:id
router.put("/:id", requireRole("Admin", "Receptionist", "Doctor"), async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/patients/:id  — Admin only
router.delete("/:id", requireRole("Admin"), async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json({ message: "Patient deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
