// routes/patient.routes.js
const router = require('express').Router();
const { body, validationResult, query } = require('express-validator');
const { Patient } = require('../models');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
};

// All routes require authentication
router.use(authenticate);

// GET /api/patients — List all patients (paginated, searchable)
router.get('/', authorize('admin','doctor','receptionist'), async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const filter = { isActive: true };
    if (search) {
      filter.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { patientId: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
      ];
    }
    const [patients, total] = await Promise.all([
      Patient.find(filter).sort(sort).skip((page - 1) * limit).limit(Number(limit)),
      Patient.countDocuments(filter),
    ]);
    res.json({ patients, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/patients/:id
router.get('/:id', authorize('admin','doctor','receptionist'), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found.' });
    res.json({ patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/patients — Register new patient
router.post('/', authorize('admin','receptionist'), [
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('dateOfBirth').isISO8601().withMessage('Valid date required'),
  body('gender').isIn(['male','female','other']),
  body('phone').notEmpty(),
], validate, async (req, res) => {
  try {
    const patient = await Patient.create({ ...req.body, registeredBy: req.user._id });
    res.status(201).json({ message: 'Patient registered successfully', patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/patients/:id — Update patient
router.put('/:id', authorize('admin','receptionist','doctor'), async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!patient) return res.status(404).json({ error: 'Patient not found.' });
    res.json({ message: 'Patient updated', patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/patients/:id — Soft delete
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!patient) return res.status(404).json({ error: 'Patient not found.' });
    res.json({ message: 'Patient deactivated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
