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

// Mock data for development when DB is unavailable
const MOCK_PATIENTS = [
  { _id: "p1", name: "Elena Vasquez", age: 45, blood: "A+", address: "12 Oak St, Metro City", phone: "+1-555-0101", history: "Hypertension, managed with medication", status: "Active", registered: new Date("2024-01-15"), doctor: "u1" },
  { _id: "p2", name: "Thomas Brennan", age: 62, blood: "O-", address: "88 Elm Ave, North Side", phone: "+1-555-0182", history: "Type 2 Diabetes, annual checkups", status: "Active", registered: new Date("2024-02-10"), doctor: "u1" },
  { _id: "p3", name: "Aisha Kamara", age: 29, blood: "B+", address: "44 Pine Rd, Eastview", phone: "+1-555-0234", history: "Asthma, carries inhaler", status: "Active", registered: new Date("2024-03-05"), doctor: "u5" },
  { _id: "p4", name: "Carlos Mendez", age: 38, blood: "AB+", address: "7 Birch Ln, Westpark", phone: "+1-555-0319", history: "Fractured wrist (2023), fully recovered", status: "Inactive", registered: new Date("2023-11-20"), doctor: "u6" },
  { _id: "p5", name: "Liu Wei", age: 54, blood: "A-", address: "220 Cedar Blvd, Central", phone: "+1-555-0401", history: "High cholesterol, on statins", status: "Active", registered: new Date("2024-04-01"), doctor: "u1" },
];

// All routes require authentication
router.use(protect);

// GET /api/patients
router.get("/", async (req, res) => {
  try {
    if (global.isMockMode) {
      // Use mock data
      let patients = [...MOCK_PATIENTS];
      
      const { search, status } = req.query;
      if (status) {
        patients = patients.filter(p => p.status === status);
      }
      if (search) {
        patients = patients.filter(p => 
          p.name.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // Sort by registered date (newest first)
      patients.sort((a, b) => new Date(b.registered) - new Date(a.registered));
      
      return res.json(patients);
    }

    // Use real database
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
