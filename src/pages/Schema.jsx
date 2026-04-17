// src/pages/Schema.jsx
// ─────────────────────────────────────────────
// Visual MongoDB schema — entity fields and
// relationship map. Displayed below all pages.
// ─────────────────────────────────────────────
import { colors } from "../utils/theme";
import { Card } from "../components/UI";

const ENTITIES = [
  {
    name: "User",
    color: "#3B82F6",
    fields: [
      "_id: ObjectId",
      "name: String",
      "email: String (unique)",
      "role: Enum[Admin, Doctor, Patient, Receptionist]",
      "passwordHash: String",
      "avatar: String",
      "createdAt: Date",
    ],
  },
  {
    name: "Patient",
    color: "#0D7D6B",
    fields: [
      "_id: ObjectId",
      "name: String",
      "age: Number",
      "blood: String",
      "address: String",
      "phone: String",
      "history: String",
      "status: Enum[Active, Inactive]",
      "doctor: ref → Doctor",
      "registered: Date",
    ],
  },
  {
    name: "Doctor",
    color: "#8B5CF6",
    fields: [
      "_id: ObjectId (ref → User)",
      "specialty: String",
      "schedule: String",
      "experience: Number",
      "status: Enum[Available, Busy, Off-Duty]",
      "patients: Number",
    ],
  },
  {
    name: "Appointment",
    color: "#F0A500",
    fields: [
      "_id: ObjectId",
      "patientId: ref → Patient",
      "doctorId: ref → Doctor",
      "date: Date",
      "time: String",
      "type: String",
      "status: Enum[Pending, Confirmed, Cancelled]",
      "notes: String",
    ],
  },
  {
    name: "Invoice",
    color: "#DC3545",
    fields: [
      "_id: ObjectId",
      "patientId: ref → Patient",
      "doctorId: ref → Doctor",
      "items: [{ desc: String, amount: Number }]",
      "status: Enum[Pending, Paid]",
      "date: Date",
    ],
  },
];

const RELATIONSHIPS = [
  "Patient → Doctor (many-to-one)",
  "Appointment → Patient (many-to-one)",
  "Appointment → Doctor (many-to-one)",
  "Invoice → Patient (many-to-one)",
  "Invoice → Doctor (many-to-one)",
  "Doctor extends User (one-to-one)",
];

export default function Schema() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: colors.text }}>Database Schema</h2>
        <p style={{ margin: "4px 0 0", color: colors.textMuted, fontSize: 14 }}>MongoDB collections — entity fields and relationships</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {ENTITIES.map(e => (
          <Card key={e.name} style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: e.color, padding: "10px 16px" }}>
              <p style={{ margin: 0, color: "#fff", fontWeight: 800, fontSize: 15, fontFamily: "monospace" }}>{e.name}</p>
            </div>
            <div style={{ padding: "10px 16px" }}>
              {e.fields.map(f => (
                <p key={f} style={{ margin: "4px 0", fontSize: 12, color: colors.textMuted, fontFamily: "monospace" }}>{f}</p>
              ))}
            </div>
          </Card>
        ))}

        {/* Relationships card */}
        <Card style={{ background: "#F8FAFC" }}>
          <h4 style={{ margin: "0 0 10px", fontSize: 14, color: colors.text }}>Relationships</h4>
          {RELATIONSHIPS.map(r => (
            <p key={r} style={{ margin: "5px 0", fontSize: 12, color: colors.textMuted, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: colors.primary }}>→</span> {r}
            </p>
          ))}
        </Card>
      </div>
    </div>
  );
}
