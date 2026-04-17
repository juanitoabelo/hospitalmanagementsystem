// src/pages/Doctors.jsx — live MongoDB
import { useState, useEffect, useCallback } from "react";
import { doctorsApi } from "../utils/api";
import { hasPermission } from "../utils/auth";
import { colors, SPECIALTIES, DOCTOR_STATUSES } from "../utils/theme";
import { Card, Avatar, Badge, Input, Select, Btn, Modal } from "../components/UI";

export default function Doctors({ user }) {
  const [doctors, setDoctors] = useState([]);
  const [modal,   setModal]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [form, setForm] = useState({ name: "", specialty: SPECIALTIES[0], phone: "", email: "", schedule: "", experience: "", status: "Available" });

  const canWrite = hasPermission(user.role, "doctors", "w");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    setLoading(true);
    try { setDoctors(await doctorsApi.list()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addDoctor = async () => {
    if (!form.name.trim()) return alert("Please enter a doctor name.");
    const av = form.name.split(" ").filter(w => !/^dr\.?$/i.test(w)).slice(0, 2).map(w => w[0]).join("");
    setSaving(true);
    try {
      await doctorsApi.create({ ...form, avatar: av });
      setModal(false);
      setForm({ name: "", specialty: SPECIALTIES[0], phone: "", email: "", schedule: "", experience: "", status: "Available" });
      load();
    } catch (e) { alert("Error adding doctor: " + e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <p style={{ color: colors.textMuted, padding: 20 }}>Loading doctors…</p>;
  if (error)   return <p style={{ color: colors.danger,   padding: 20 }}>Error: {error}</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: colors.text }}>Medical Staff</h2>
          <p style={{ margin: "4px 0 0", color: colors.textMuted, fontSize: 14 }}>{doctors.length} physicians in MongoDB</p>
        </div>
        {canWrite && <Btn onClick={() => setModal(true)}>+ Add Doctor</Btn>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18 }}>
        {doctors.map(d => (
          <Card key={d._id}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <Avatar initials={d.avatar || d.name?.slice(0,2)} size={52} color={d.status === "Available" ? colors.primary : colors.textMuted} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: colors.text }}>{d.name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: colors.primary, fontWeight: 600 }}>{d.specialty}</p>
                  </div>
                  <Badge status={d.status} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", fontSize: 12, color: colors.textMuted }}>
                  {d.phone      && <span>📞 {d.phone}</span>}
                  {d.email      && <span>✉️ {d.email}</span>}
                  {d.schedule   && <span>🗓 {d.schedule}</span>}
                  {d.patients !== undefined && <span>👤 {d.patients} patients</span>}
                  {d.experience && <span>🎓 {d.experience} yrs exp.</span>}
                </div>
              </div>
            </div>
          </Card>
        ))}
        {doctors.length === 0 && <p style={{ color: colors.textMuted }}>No doctors registered yet. Add one to get started.</p>}
      </div>

      {modal && (
        <Modal title="Register New Doctor" onClose={() => setModal(false)}>
          <Input  label="Full Name (incl. Dr.)" value={form.name}       onChange={e => set("name", e.target.value)}       placeholder="Dr. Jane Smith" />
          <Select label="Specialty"             value={form.specialty}  onChange={e => set("specialty", e.target.value)}  options={SPECIALTIES.map(s => ({ value: s, label: s }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Phone" value={form.phone} onChange={e => set("phone", e.target.value)} />
            <Input label="Email" type="email" value={form.email} onChange={e => set("email", e.target.value)} />
          </div>
          <Input  label="Schedule"          value={form.schedule}   onChange={e => set("schedule",   e.target.value)} placeholder="Mon-Fri 09:00–17:00" />
          <Input  label="Years Experience"  value={form.experience} onChange={e => set("experience", e.target.value)} type="number" />
          <Select label="Status" value={form.status} onChange={e => set("status", e.target.value)} options={DOCTOR_STATUSES.map(s => ({ value: s, label: s }))} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={addDoctor} disabled={saving}>{saving ? "Saving…" : "Add Doctor"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
