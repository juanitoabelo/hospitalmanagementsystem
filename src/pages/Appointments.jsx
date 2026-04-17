// src/pages/Appointments.jsx — live MongoDB
import { useState, useEffect, useCallback } from "react";
import { appointmentsApi, patientsApi, doctorsApi } from "../utils/api";
import { hasPermission } from "../utils/auth";
import { colors, APPT_TYPES } from "../utils/theme";
import { Card, Avatar, Badge, Input, Select, Btn, Modal, Textarea } from "../components/UI";

export default function Appointments({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [patients,     setPatients]     = useState([]);
  const [doctors,      setDoctors]      = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [modal,        setModal]        = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");
  const [form, setForm] = useState({ patientId: "", doctorId: "", date: "", time: "", type: "Checkup", notes: "" });

  const canWrite  = hasPermission(user.role, "appointments", "w");
  const canDelete = hasPermission(user.role, "appointments", "d");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [appts, pts, docs] = await Promise.all([
        appointmentsApi.list(),
        patientsApi.list(),
        doctorsApi.list(),
      ]);
      setAppointments(appts);
      setPatients(pts);
      setDoctors(docs);
      setForm(f => ({ ...f, patientId: pts[0]?._id || "", doctorId: docs[0]?._id || "" }));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const filtered = appointments.filter(a => filterStatus === "All" || a.status === filterStatus);

  const bookAppointment = async () => {
    if (!form.date || !form.time) return alert("Please select a date and time.");
    setSaving(true);
    try {
      await appointmentsApi.create(form);
      setModal(false);
      loadAll();
    } catch (e) {
      alert(e.status === 409 ? "❌ Double-booking detected! This doctor is already booked at that time." : "Error: " + e.message);
    } finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await appointmentsApi.update(id, { status });
      loadAll();
    } catch (e) { alert("Error: " + e.message); }
  };

  const deleteAppt = async (id) => {
    if (!window.confirm("Delete this appointment permanently?")) return;
    try {
      await appointmentsApi.remove(id);
      loadAll();
    } catch (e) { alert("Error: " + e.message); }
  };

  if (loading) return <p style={{ color: colors.textMuted, padding: 20 }}>Loading appointments…</p>;
  if (error)   return <p style={{ color: colors.danger,   padding: 20 }}>Error: {error}</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: colors.text }}>Appointment Scheduling</h2>
          <p style={{ margin: "4px 0 0", color: colors.textMuted, fontSize: 14 }}>Double-booking prevention enforced by MongoDB</p>
        </div>
        {canWrite && <Btn onClick={() => setModal(true)}>+ Book Appointment</Btn>}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {["All", "Confirmed", "Pending", "Cancelled"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: "7px 16px", borderRadius: 20, cursor: "pointer", border: `1px solid ${filterStatus === s ? colors.primary : colors.border}`, background: filterStatus === s ? colors.primaryLight : "#fff", color: filterStatus === s ? colors.primary : colors.textMuted, fontWeight: filterStatus === s ? 700 : 400, fontSize: 13 }}>
            {s}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(a => {
          const patientName = a.patientId?.name || "Unknown Patient";
          const doctorName  = a.doctorId?.name  || "Unknown Doctor";
          const specialty   = a.doctorId?.specialty || "";
          return (
            <Card key={a._id} style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Avatar initials={patientName.split(" ").map(n => n[0]).join("")} size={42} color="#3B82F6" />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: colors.text }}>{patientName}</p>
                    <Badge status={a.status} />
                    <span style={{ fontSize: 12, color: colors.textMuted, background: "#F1F5F9", padding: "2px 8px", borderRadius: 6 }}>{a.type}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: colors.textMuted }}>🩺 {doctorName}{specialty ? ` (${specialty})` : ""} · 📅 {a.date} at {a.time}</p>
                  {a.notes && <p style={{ margin: "4px 0 0", fontSize: 12, color: colors.textMuted, fontStyle: "italic" }}>"{a.notes}"</p>}
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {canWrite && a.status === "Pending" && <Btn variant="secondary" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => updateStatus(a._id, "Confirmed")}>Confirm</Btn>}
                  {canDelete && a.status !== "Cancelled" && <Btn variant="ghost" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => updateStatus(a._id, "Cancelled")}>Cancel</Btn>}
                  {canDelete && <Btn variant="danger" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => deleteAppt(a._id)}>✕</Btn>}
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && <Card style={{ padding: 40, textAlign: "center" }}><p style={{ color: colors.textMuted, margin: 0 }}>No appointments with status "{filterStatus}"</p></Card>}
      </div>

      {modal && (
        <Modal title="Book New Appointment" onClose={() => setModal(false)}>
          <Select label="Patient" value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))} options={patients.map(p => ({ value: p._id, label: p.name }))} />
          <Select label="Doctor"  value={form.doctorId}  onChange={e => setForm(f => ({ ...f, doctorId: e.target.value  }))} options={doctors.map(d => ({ value: d._id, label: `${d.name} — ${d.specialty}` }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <Input label="Time" type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
          </div>
          <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} options={APPT_TYPES.map(t => ({ value: t, label: t }))} />
          <Textarea label="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <div style={{ padding: "10px 14px", background: "#FFFBF0", borderRadius: 8, border: "1px solid #FAC75030", marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#B07800" }}>⚠️ MongoDB unique index prevents double-booking at database level.</p>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={bookAppointment} disabled={saving}>{saving ? "Booking…" : "Book Appointment"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
