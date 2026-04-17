// backend/routes/invoices.js
// ─────────────────────────────────────────────
// GET    /api/invoices          — list all invoices
// GET    /api/invoices/:id      — single invoice
// POST   /api/invoices          — generate invoice
// PUT    /api/invoices/:id      — update (e.g. mark paid)
// DELETE /api/invoices/:id      — delete (Admin only)
// GET    /api/invoices/summary  — revenue totals
// ─────────────────────────────────────────────
const router = require("express").Router();
const { Invoice } = require("../models/models");
const { protect, requireRole } = require("../middleware/authMiddleware");

router.use(protect);

// GET /api/invoices/summary — revenue dashboard data
router.get("/summary", async (req, res) => {
  try {
    const invoices = await Invoice.find();
    const total   = invoices.reduce((s, inv) => s + inv.items.reduce((a, i) => a + i.amount, 0), 0);
    const pending = invoices.filter(i => i.status === "Pending").reduce((s, inv) => s + inv.items.reduce((a, i) => a + i.amount, 0), 0);
    const paid    = total - pending;
    res.json({ total, pending, paid, count: invoices.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/invoices
router.get("/", async (req, res) => {
  try {
    const { patientId, doctorId, status } = req.query;
    const filter = {};
    if (patientId) filter.patientId = patientId;
    if (doctorId)  filter.doctorId  = doctorId;
    if (status)    filter.status    = status;

    const invoices = await Invoice.find(filter)
      .populate("patientId", "name")
      .populate("doctorId",  "name specialty")
      .sort({ date: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/invoices/:id
router.get("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("patientId", "name address phone")
      .populate("doctorId",  "name specialty");
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/invoices — generate new invoice
router.post("/", requireRole("Admin", "Receptionist", "Doctor"), async (req, res) => {
  try {
    const { patientId, doctorId, items } = req.body;
    if (!items?.length) return res.status(400).json({ message: "At least one line item is required" });

    const invoice = await Invoice.create({ patientId, doctorId, items, status: "Pending" });
    res.status(201).json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/invoices/:id — update status (mark paid, etc.)
router.put("/:id", requireRole("Admin", "Receptionist"), async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/invoices/:id — Admin only
router.delete("/:id", requireRole("Admin"), async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json({ message: "Invoice deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
