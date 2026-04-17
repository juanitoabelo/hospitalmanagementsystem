// src/pages/Patients.jsx — live MongoDB CRUD
import { useState, useEffect, useCallback } from "react";
import { patientsApi, doctorsApi } from "../utils/api";
import { hasPermission } from "../utils/auth";
import { colors, BLOOD_TYPES } from "../utils/theme";
import { Card, Avatar, Badge, Input, Select, Btn, Modal, Textarea } from "../components/UI";

function PatientForm({ initial, onSave, onClose, doctors }) {
  const [form, setForm] = useState(
    initial
      ? { name: initial.name, age: initial.age, blood: initial.blood, address: initial.address, phone: initial.phone, history: initial.history, status: initial.status, doctor: initial.doctor?._id || initial.doctor || "" }
      : { name: "", age: "", blood: "A+", address: "", phone: "", history: "", status: "Active", doctor: doctors[0]?._id || "" }
  );
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <Input label="Full Name" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Jane Smith" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Age" type="number" value={form.age} onChange={e => set("age", e.target.value)} />
        <Select label="Blood Type" value={form.blood} onChange={e => set("blood", e.target.value)} options={BLOOD_TYPES.map(b => ({ value: b, label: b }))} />
      </div>
      <Input label="Phone" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+1-555-0000" />
      <Input label="Address" value={form.address} onChange={e => set("address", e.target.value)} />
      <Textarea label="Medical History" value={form.history} onChange={e => set("history", e.target.value)} />
      <Select label="Assigned Doctor" value={form.doctor} onChange={e => set("doctor", e.target.value)} options={[{ value: "", label: "— Unassigned —" }, ...doctors.map(d => ({ value: d._id, label: d.name }))]} />
      <Select label="Status" value={form.status} onChange={e => set("status", e.target.value)} options={[{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }]} />
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={() => onSave(form)}>Save Patient</Btn>
      </div>
    </>
  );
}

export default function Patients({ user }) {
  const [patients,   setPatients]   = useState([]);
  const [doctors,    setDoctors]    = useState([]);
  const [search,     setSearch]     = useState("");
  const [modal,      setModal]      = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");

  const canWrite  = hasPermission(user.role, "patients", "w");
  const canDelete = hasPermission(user.role, "patients", "d");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [p, d] = await Promise.all([patientsApi.list(), doctorsApi.list()]);
      setPatients(p);
      setDoctors(d);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.blood?.includes(search) ||
    p.status?.toLowerCase().includes(search.toLowerCase())
  );

  const savePatient = async (form) => {
    try {
      if (editTarget) {
        await patientsApi.update(editTarget._id, form);
      } else {
        await patientsApi.create(form);
      }
      setModal(null); setEditTarget(null);
      loadAll();
    } catch (e) { alert("Error saving patient: " + e.message); }
  };

  const deletePatient = async (id) => {
    if (!window.confirm("Delete this patient record? This cannot be undone.")) return;
    try {
      await patientsApi.remove(id);
      loadAll();
    } catch (e) { alert("Error deleting patient: " + e.message); }
  };

  if (loading) return <p style={{ color: colors.textMuted, padding: 20 }}>Loading patients…</p>;
  if (error)   return <p style={{ color: colors.danger, padding: 20 }}>Error: {error}</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: colors.text }}>Patient Registry</h2>
          <p style={{ margin: "4px 0 0", color: colors.textMuted, fontSize: 14 }}>{patients.length} total patients in MongoDB</p>
        </div>
        {canWrite && <Btn onClick={() => { setEditTarget(null); setModal("form"); }}>+ Register Patient</Btn>}
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${colors.border}` }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, blood type, or status…" style={{ width: "100%", padding: "9px 14px", border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
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
              const docName = p.doctor?.name || "Unassigned";
              return (
                <tr key={p._id} style={{ borderTop: `1px solid ${colors.border}` }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar initials={p.name?.split(" ").map(n => n[0]).join("") || "?"} size={34} color="#3B82F6" />
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: colors.text }}>{p.name}</p>
                        <p style={{ margin: "1px 0 0", fontSize: 11, color: colors.textMuted }}>Since {new Date(p.registered).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: colors.textMuted }}>{p.age} yrs · <strong style={{ color: colors.danger }}>{p.blood}</strong></td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: colors.textMuted }}>{p.phone}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: colors.textMuted }}>{docName}</td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: colors.textMuted, maxWidth: 180 }}>
                    <span title={p.history} style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.history}</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}><Badge status={p.status} /></td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      {canWrite  && <Btn variant="secondary" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => { setEditTarget(p); setModal("form"); }}>Edit</Btn>}
                      {canDelete && <Btn variant="danger"    style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => deletePatient(p._id)}>Delete</Btn>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding: 40, textAlign: "center", color: colors.textMuted }}>No patients found matching "{search}"</div>}
      </Card>

      {modal === "form" && (
        <Modal title={editTarget ? "Edit Patient" : "Register New Patient"} onClose={() => { setModal(null); setEditTarget(null); }}>
          <PatientForm initial={editTarget} onSave={savePatient} onClose={() => { setModal(null); setEditTarget(null); }} doctors={doctors} />
        </Modal>
      )}
    </div>
  );
}
