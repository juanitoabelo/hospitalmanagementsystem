// src/data/mockDb.js
// ─────────────────────────────────────────────
// Simulates MongoDB collections (seed data)
// In production, replace with real API calls
// ─────────────────────────────────────────────

export const MOCK_DB = {
  users: [
    { id: "u1", name: "Dr. Sarah Chen",  email: "sarah@hospital.com",   role: "Doctor",       avatar: "SC", specialty: "Cardiology" },
    { id: "u2", name: "James Okafor",    email: "james@hospital.com",   role: "Admin",        avatar: "JO" },
    { id: "u3", name: "Maria Santos",    email: "maria@hospital.com",   role: "Receptionist", avatar: "MS" },
    { id: "u4", name: "Patient Demo",    email: "patient@email.com",    role: "Patient",      avatar: "PD" },
  ],

  patients: [
    { id: "p1", name: "Elena Vasquez",  age: 45, blood: "A+",  address: "12 Oak St, Metro City",   phone: "+1-555-0101", history: "Hypertension, managed with medication",      status: "Active",   registered: "2024-01-15", doctor: "u1" },
    { id: "p2", name: "Thomas Brennan", age: 62, blood: "O-",  address: "88 Elm Ave, North Side",  phone: "+1-555-0182", history: "Type 2 Diabetes, annual checkups",            status: "Active",   registered: "2024-02-10", doctor: "u1" },
    { id: "p3", name: "Aisha Kamara",   age: 29, blood: "B+",  address: "44 Pine Rd, Eastview",    phone: "+1-555-0234", history: "Asthma, carries inhaler",                    status: "Active",   registered: "2024-03-05", doctor: "u5" },
    { id: "p4", name: "Carlos Mendez",  age: 38, blood: "AB+", address: "7 Birch Ln, Westpark",    phone: "+1-555-0319", history: "Fractured wrist (2023), fully recovered",    status: "Inactive", registered: "2023-11-20", doctor: "u6" },
    { id: "p5", name: "Liu Wei",        age: 54, blood: "A-",  address: "220 Cedar Blvd, Central", phone: "+1-555-0401", history: "High cholesterol, on statins",               status: "Active",   registered: "2024-04-01", doctor: "u1" },
  ],

  doctors: [
    { id: "u1", name: "Dr. Sarah Chen",    specialty: "Cardiology",   phone: "+1-555-9001", email: "sarah@hospital.com",   schedule: "Mon-Fri 08:00–17:00",  patients: 48, status: "Available", avatar: "SC", experience: 12 },
    { id: "u5", name: "Dr. Marcus Reid",   specialty: "Pulmonology",  phone: "+1-555-9002", email: "mreid@hospital.com",   schedule: "Tue-Sat 09:00–18:00",  patients: 31, status: "Available", avatar: "MR", experience: 8  },
    { id: "u6", name: "Dr. Priya Nair",   specialty: "Orthopedics",  phone: "+1-555-9003", email: "pnair@hospital.com",   schedule: "Mon-Thu 07:00–16:00",  patients: 55, status: "Busy",      avatar: "PN", experience: 15 },
    { id: "u7", name: "Dr. James O'Brien",specialty: "Neurology",    phone: "+1-555-9004", email: "jobrien@hospital.com", schedule: "Wed-Sun 10:00–19:00",  patients: 22, status: "Off-Duty",  avatar: "JO", experience: 20 },
  ],

  appointments: [
    { id: "a1", patientId: "p1", doctorId: "u1", date: "2025-07-14", time: "09:00", type: "Checkup",      status: "Confirmed", notes: "Blood pressure review"       },
    { id: "a2", patientId: "p2", doctorId: "u1", date: "2025-07-14", time: "10:30", type: "Follow-up",    status: "Confirmed", notes: "HbA1c results discussion"     },
    { id: "a3", patientId: "p3", doctorId: "u5", date: "2025-07-15", time: "11:00", type: "Consultation", status: "Pending",   notes: "Breathing difficulty"         },
    { id: "a4", patientId: "p4", doctorId: "u6", date: "2025-07-16", time: "14:00", type: "Checkup",      status: "Cancelled", notes: "Post-recovery follow-up"      },
    { id: "a5", patientId: "p5", doctorId: "u1", date: "2025-07-17", time: "08:30", type: "Consultation", status: "Pending",   notes: "Lipid panel review"           },
  ],

  invoices: [
    { id: "inv001", patientId: "p1", doctorId: "u1", date: "2025-06-14", status: "Paid",    items: [{ desc: "Consultation", amount: 150 }, { desc: "Blood Panel", amount: 85 }, { desc: "Medication (Lisinopril 30d)", amount: 42 }] },
    { id: "inv002", patientId: "p2", doctorId: "u1", date: "2025-06-20", status: "Pending", items: [{ desc: "Consultation", amount: 150 }, { desc: "HbA1c Test", amount: 65 }] },
    { id: "inv003", patientId: "p3", doctorId: "u5", date: "2025-07-02", status: "Paid",    items: [{ desc: "Emergency Visit", amount: 280 }, { desc: "Spirometry", amount: 95 }, { desc: "Inhaler Prescription", amount: 60 }] },
    { id: "inv004", patientId: "p5", doctorId: "u1", date: "2025-07-08", status: "Pending", items: [{ desc: "Consultation", amount: 150 }, { desc: "Lipid Panel", amount: 75 }] },
  ],
};
