# MediCore HMS — Hospital Management System

A full-stack Hospital Management System built with React, Node/Express, and MongoDB.

---

## Project Structure

```
hms/
├── src/                          # React frontend
│   ├── App.jsx                   # Root shell, routing, JWT session bar
│   ├── data/
│   │   └── mockDb.js             # Seed data (simulates MongoDB collections)
│   ├── utils/
│   │   ├── auth.js               # JWT sign/verify + RBAC hasPermission()
│   │   └── theme.js              # Color tokens, status maps, constants
│   ├── components/
│   │   ├── UI.jsx                # Badge, Avatar, Card, Input, Select, Btn, Modal
│   │   └── Sidebar.jsx           # Navigation rail
│   └── pages/
│       ├── Login.jsx             # Auth screen with quick-role buttons
│       ├── Dashboard.jsx         # Stat cards, recent appts, doctor duty panel
│       ├── Patients.jsx          # CRUD patient registry
│       ├── Appointments.jsx      # Book/confirm/cancel + double-booking guard
│       ├── Doctors.jsx           # Doctor profiles and schedule cards
│       ├── Billing.jsx           # Invoice generation and payment tracking
│       └── Schema.jsx            # MongoDB schema visualiser
│
├── backend/                      # Express + MongoDB API
│   ├── app.js                    # Server entry point
│   ├── .env.example              # Environment variable template
│   ├── package.json
│   ├── models/
│   │   └── models.js             # Mongoose schemas: User, Patient, Doctor, Appointment, Invoice
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT protect() + requireRole() + RBAC matrix
│   └── routes/
│       ├── auth.js               # POST /login, /register, GET /me
│       ├── patients.js           # Full CRUD — /api/patients
│       ├── doctors.js            # Full CRUD — /api/doctors
│       ├── appointments.js       # Book/update + double-booking — /api/appointments
│       └── invoices.js           # Generate/pay/delete + summary — /api/invoices
│
└── package.json                  # Frontend package config
```

---

## Quick Start

### 1. Frontend (React — works standalone with mock data)

```bash
# From project root
npm install
npm start
# Opens http://localhost:3000
```

Login with any demo email, password: **demo**

| Role         | Email                    |
|--------------|--------------------------|
| Admin        | james@hospital.com       |
| Doctor       | sarah@hospital.com       |
| Receptionist | maria@hospital.com       |
| Patient      | patient@email.com        |

---

### 2. Backend (Express + MongoDB)

```bash
cd backend
npm install

# Copy and fill in environment variables
cp .env.example .env

# Make sure MongoDB is running, then:
npm run dev      # nodemon (auto-reload)
# or
npm start        # plain node
```

API runs at `http://localhost:5000`

---

## API Reference

### Auth
| Method | Endpoint             | Body                          | Auth |
|--------|----------------------|-------------------------------|------|
| POST   | /api/auth/register   | `{name, email, password, role}` | —  |
| POST   | /api/auth/login      | `{email, password}`           | —    |
| GET    | /api/auth/me         | —                             | JWT  |

### Patients
| Method | Endpoint             | Roles allowed         |
|--------|----------------------|-----------------------|
| GET    | /api/patients        | All authenticated     |
| GET    | /api/patients/:id    | All authenticated     |
| POST   | /api/patients        | Admin, Receptionist, Doctor |
| PUT    | /api/patients/:id    | Admin, Receptionist, Doctor |
| DELETE | /api/patients/:id    | Admin only            |

### Appointments
| Method | Endpoint                | Notes                         |
|--------|-------------------------|-------------------------------|
| GET    | /api/appointments       | Filter by doctorId, date, status |
| POST   | /api/appointments       | Double-booking check runs here |
| PUT    | /api/appointments/:id   | Reschedule re-checks conflicts |
| DELETE | /api/appointments/:id   | Admin, Receptionist            |

### Doctors
| Method | Endpoint          | Roles       |
|--------|-------------------|-------------|
| GET    | /api/doctors      | All auth    |
| POST   | /api/doctors      | Admin only  |
| PUT    | /api/doctors/:id  | Admin only  |
| DELETE | /api/doctors/:id  | Admin only  |

### Invoices
| Method | Endpoint              | Notes               |
|--------|-----------------------|---------------------|
| GET    | /api/invoices/summary | Revenue totals      |
| GET    | /api/invoices         | Filter by patient/doctor/status |
| POST   | /api/invoices         | Admin, Receptionist, Doctor |
| PUT    | /api/invoices/:id     | Mark paid, etc.     |
| DELETE | /api/invoices/:id     | Admin only          |

---

## Security Notes

- **JWT** tokens encode `sub` (user ID), `role`, and `exp` (1-hour expiry)
- **bcryptjs** hashes passwords with salt rounds = 12
- **RBAC** is enforced on every route via `requireRole()` middleware
- **Double-booking** is prevented at application level (route) AND database level (compound unique index on `doctorId + date + time`)
- In production: set a strong `JWT_SECRET`, use HTTPS, and add rate limiting

---

## MongoDB Schema

### User
```
_id, name, email (unique), passwordHash, role, avatar, timestamps
```
### Patient
```
_id, name, age, blood, address, phone, history, status, doctor (ref), registered
```
### Doctor
```
_id, user (ref), specialty, phone, email, schedule, experience, patients, status, avatar
```
### Appointment
```
_id, patientId (ref), doctorId (ref), date, time, type, status, notes
Unique index: { doctorId, date, time } where status != Cancelled
```
### Invoice
```
_id, patientId (ref), doctorId (ref), items [{desc, amount}], status, date
Virtual: total (sum of items)
```
# hospitalmanagementsystem
