// src/pages/Patients.jsx
// ─────────────────────────────────────────────
// Full CRUD for patient records
// Permissions enforced via RBAC
// ─────────────────────────────────────────────
import { useState } from "react";
import { hasPermission } from "../utils/auth";
import { colors, BLOOD_TYPES } from "../utils/theme";
import { Card, Avatar, Badge, Input, Select, Btn, Modal, Textarea } from "../components/UI";

// ── Patient form (shared for create & edit) ──────────────────
function PatientForm({ initial, onSave, onClose, doctors }) {
  const [form, setForm] = useState(
    initial || { name: "", age: "", blood: "A+", address: "", phone: "", history: "", status: "Active", doctor: doctors[0]?.id || "" }
  );
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <Input label="Full Name" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Jane Smith" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Age" type="number" value={form.age} onChange={e => set("age", e.target.value)} />
        <Select label="Blood Type" value={form.blood} onChange={e => set("blood", e.target.value)} options={BLOOD_TYPES.map(b => ({ value: b, label: b }))} />
      </div>
      <Input  label="Phone"   value={form.phone}   onChange={e => set("phone", e.target.value)}   placeholder="+1-555-0000" />
      <Input  label="Address" value={form.address} onChange={e => set("address", e.target.value)} />
      <Textarea label="Medical History" value={form.history} onChange={e => set("history", e.target.value)} />
      <Select label="Assigned Doctor" value={form.doctor} onChange={e => set("doctor", e.target.value)} options={doctors.map(d => ({ value: d.id, label: d.name }))} />
      <Select label="Status" value={form.status} onChange={e => set("status", e.target.value)} options={[{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }]} />
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={() => onSave(form)}>Save Patient</Btn>
      </div>
    </>
  );
}

// ── Main Patients page ────────────────────────────────────────
export default function Patients({ data, setData, user }) {
  const [search,     setSearch]     = useState("");
  const [modal,      setModal]      = useState(null);   // null | "form"
  const [editTarget, setEditTarget] = useState(null);

  const canWrite  = hasPermission(user.role, "patients", "w");
  const canDelete = hasPermission(user.role, "patients", "d");

  const filtered = data.patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.blood.includes(search) ||
    p.status.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (p) => { setEditTarget(p); setModal("form"); };
  const openNew  = ()  => { setEditTarget(null); setModal("form"); };
  const closeModal = () => { setModal(null); setEditTarget(null); };

  const savePatient = (form) => {
    if (editTarget) {
      setData(d => ({ ...d, patients: d.patients.map(p => p.id === editTarget.id ? { ...editTarget, ...form } : p) }));
    } else {
      const np = { ...form, id: "p" + Date.now(), registered: new Date().toISOString().slice(0, 10) };
      setData(d => ({ ...d, patients: [...d.patients, np] }));
    }
    closeModal();
  };

  const deletePatient = (id) => {
    if (window.confirm("Delete this patient record? This cannot be undone.")) {
      setData(d => ({ ...d, patients: d.patients.filter(p => p.id !== id) }));
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: colors.text }}>Patient Registry</h2>
          <p style={{ margin: "4px 0 0", color: colors.textMuted, fontSize: 14 }}>{data.patients.length} total patients registered</p>
        </div>
        {canWrite && <Btn onClick={openNew}>+ Register Patient</Btn>}
      </div>

      {/* Table */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${colors.border}` }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, blood type, or status…"
            style={{ width: "100%", padding: "9px 14px", border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FAFC" }}>
              {["Patient", "Age / Blood", "Phone", "Doctor", "History", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const doc = data.doctors.find(d => d.id === p.doctor);
              return (
                <tr key={p.id} style={{ borderTop: `1px solid ${colors.border}` }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar initials={p.name.split(" ").map(n => n[0]).join("")} size={34} color="#3B82F6" />
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: colors.text }}>{p.name}</p>
                        <p style={{ margin: "1px 0 0", fontSize: 11, color: colors.textMuted }}>Since {p.registered}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: colors.textMuted }}>
                    {p.age} yrs · <strong style={{ color: colors.danger }}>{p.blood}</strong>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: colors.textMuted }}>{p.phone}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: colors.textMuted }}>{doc?.name || "Unassigned"}</td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: colors.textMuted, maxWidth: 180 }}>
                    <span title={p.history} style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.history}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}><Badge status={p.status} /></td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      {canWrite  && <Btn variant="secondary" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => openEdit(p)}>Edit</Btn>}
                      {canDelete && <Btn variant="danger"    style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => deletePatient(p.id)}>Delete</Btn>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: colors.textMuted }}>
            No patients found matching "{search}"
          </div>
        )}
      </Card>

      {/* Modal */}
      {modal === "form" && (
        <Modal title={editTarget ? "Edit Patient" : "Register New Patient"} onClose={closeModal}>
          <PatientForm initial={editTarget} onSave={savePatient} onClose={closeModal} doctors={data.doctors} />
        </Modal>
      )}
    </div>
  );
}
