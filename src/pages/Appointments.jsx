// src/pages/Appointments.jsx
// ─────────────────────────────────────────────
// Book, confirm, cancel appointments.
// Includes double-booking collision detection.
// ─────────────────────────────────────────────
import { useState } from "react";
import { hasPermission } from "../utils/auth";
import { colors, APPT_TYPES } from "../utils/theme";
import { Card, Avatar, Badge, Input, Select, Btn, Modal, Textarea } from "../components/UI";

export default function Appointments({ data, setData, user }) {
  const [modal,        setModal]        = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [form, setForm] = useState({
    patientId: data.patients[0]?.id,
    doctorId:  data.doctors[0]?.id,
    date: "", time: "", type: "Checkup", notes: "",
  });

  const canWrite  = hasPermission(user.role, "appointments", "w");
  const canDelete = hasPermission(user.role, "appointments", "d");

  const filtered = data.appointments.filter(a => filterStatus === "All" || a.status === filterStatus);

  /** Returns true if another non-cancelled appointment already occupies this slot */
  const isDoubleBooked = (doctorId, date, time, excludeId = null) =>
    data.appointments.some(a =>
      a.id !== excludeId &&
      a.doctorId === doctorId &&
      a.date     === date    &&
      a.time     === time    &&
      a.status   !== "Cancelled"
    );

  const bookAppointment = () => {
    if (!form.date || !form.time) return alert("Please select a date and time.");
    if (isDoubleBooked(form.doctorId, form.date, form.time)) {
      return alert("❌ Double-booking detected! This doctor already has an appointment at that date and time.");
    }
    const newAppt = { ...form, id: "a" + Date.now(), status: "Pending" };
    setData(d => ({ ...d, appointments: [...d.appointments, newAppt] }));
    setModal(false);
  };

  const updateStatus = (id, status) =>
    setData(d => ({ ...d, appointments: d.appointments.map(a => a.id === id ? { ...a, status } : a) }));

  const deleteAppt = (id) => {
    if (window.confirm("Delete this appointment permanently?")) {
      setData(d => ({ ...d, appointments: d.appointments.filter(a => a.id !== id) }));
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: colors.text }}>Appointment Scheduling</h2>
          <p style={{ margin: "4px 0 0", color: colors.textMuted, fontSize: 14 }}>Double-booking prevention active</p>
        </div>
        {canWrite && <Btn onClick={() => setModal(true)}>+ Book Appointment</Btn>}
      </div>

      {/* Status filter pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {["All", "Confirmed", "Pending", "Cancelled"].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              padding: "7px 16px", borderRadius: 20, cursor: "pointer",
              border: `1px solid ${filterStatus === s ? colors.primary : colors.border}`,
              background: filterStatus === s ? colors.primaryLight : "#fff",
              color:      filterStatus === s ? colors.primary : colors.textMuted,
              fontWeight: filterStatus === s ? 700 : 400,
              fontSize: 13,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Appointment cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(a => {
          const patient = data.patients.find(p => p.id === a.patientId);
          const doctor  = data.doctors.find(d => d.id === a.doctorId);
          return (
            <Card key={a.id} style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Avatar initials={patient?.name.split(" ").map(n => n[0]).join("") || "?"} size={42} color="#3B82F6" />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: colors.text }}>{patient?.name}</p>
                    <Badge status={a.status} />
                    <span style={{ fontSize: 12, color: colors.textMuted, background: "#F1F5F9", padding: "2px 8px", borderRadius: 6 }}>{a.type}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: colors.textMuted }}>
                    🩺 {doctor?.name} ({doctor?.specialty}) · 📅 {a.date} at {a.time}
                  </p>
                  {a.notes && <p style={{ margin: "4px 0 0", fontSize: 12, color: colors.textMuted, fontStyle: "italic" }}>"{a.notes}"</p>}
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {canWrite && a.status === "Pending" && (
                    <Btn variant="secondary" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => updateStatus(a.id, "Confirmed")}>Confirm</Btn>
                  )}
                  {canDelete && a.status !== "Cancelled" && (
                    <Btn variant="ghost" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => updateStatus(a.id, "Cancelled")}>Cancel</Btn>
                  )}
                  {canDelete && (
                    <Btn variant="danger" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => deleteAppt(a.id)}>✕</Btn>
                  )}
                </div>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card style={{ padding: 40, textAlign: "center" }}>
            <p style={{ color: colors.textMuted, margin: 0 }}>No appointments with status "{filterStatus}"</p>
          </Card>
        )}
      </div>

      {/* Book modal */}
      {modal && (
        <Modal title="Book New Appointment" onClose={() => setModal(false)}>
          <Select label="Patient" value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))} options={data.patients.map(p => ({ value: p.id, label: p.name }))} />
          <Select label="Doctor"  value={form.doctorId}  onChange={e => setForm(f => ({ ...f, doctorId: e.target.value  }))} options={data.doctors.map(d => ({ value: d.id, label: `${d.name} — ${d.specialty}` }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <Input label="Time" type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
          </div>
          <Select label="Appointment Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} options={APPT_TYPES.map(t => ({ value: t, label: t }))} />
          <Textarea label="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <div style={{ padding: "10px 14px", background: "#FFFBF0", borderRadius: 8, border: "1px solid #FAC75030", marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#B07800" }}>
              ⚠️ Double-booking check runs automatically. Same doctor + date + time will be rejected.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={bookAppointment}>Book Appointment</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
