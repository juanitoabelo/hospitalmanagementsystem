// src/pages/Billing.jsx
// ─────────────────────────────────────────────
// Invoice generation, line item management,
// revenue summary, mark-as-paid workflow
// ─────────────────────────────────────────────
import { useState } from "react";
import { hasPermission } from "../utils/auth";
import { colors } from "../utils/theme";
import { Card, Avatar, Badge, Select, Btn, Modal } from "../components/UI";

export default function Billing({ data, setData, user }) {
  const [modal, setModal] = useState(false);
  const [invoice, setInvoice] = useState({
    patientId: data.patients[0]?.id,
    doctorId:  data.doctors[0]?.id,
    items: [{ desc: "Consultation", amount: 150 }],
  });

  const canWrite = hasPermission(user.role, "billing", "w");

  const totalRevenue   = data.invoices.reduce((s, inv) => s + inv.items.reduce((a, i) => a + i.amount, 0), 0);
  const pendingRevenue = data.invoices
    .filter(i => i.status === "Pending")
    .reduce((s, inv) => s + inv.items.reduce((a, i) => a + i.amount, 0), 0);

  const addItem    = () => setInvoice(f => ({ ...f, items: [...f.items, { desc: "", amount: 0 }] }));
  const removeItem = (idx) => setInvoice(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx, key, val) =>
    setInvoice(f => ({ ...f, items: f.items.map((item, i) => i === idx ? { ...item, [key]: val } : item) }));

  const generateInvoice = () => {
    if (invoice.items.some(i => !i.desc.trim())) return alert("Please fill in all item descriptions.");
    const ni = {
      ...invoice,
      id:     "inv" + Date.now().toString().slice(-6),
      date:   new Date().toISOString().slice(0, 10),
      status: "Pending",
    };
    setData(d => ({ ...d, invoices: [...d.invoices, ni] }));
    setModal(false);
  };

  const markPaid = (id) =>
    setData(d => ({ ...d, invoices: d.invoices.map(inv => inv.id === id ? { ...inv, status: "Paid" } : inv) }));

  const SUMMARY = [
    { label: "Total Revenue",       value: `$${totalRevenue.toLocaleString()}`,   color: colors.success, bg: colors.successLight },
    { label: "Pending Collection",  value: `$${pendingRevenue.toLocaleString()}`,  color: "#B07800",      bg: "#FFFBF0" },
    { label: "Total Invoices",      value: data.invoices.length,                  color: "#3B82F6",      bg: "#EFF6FF" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: colors.text }}>Billing & Invoicing</h2>
          <p style={{ margin: "4px 0 0", color: colors.textMuted, fontSize: 14 }}>Manage consultations, treatments, and medications</p>
        </div>
        {canWrite && <Btn onClick={() => setModal(true)}>+ Generate Invoice</Btn>}
      </div>

      {/* Revenue summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        {SUMMARY.map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: "18px 22px", border: `1px solid ${s.color}25` }}>
            <p style={{ margin: "0 0 6px", fontSize: 12, color: s.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: 30, fontWeight: 800, color: s.color, letterSpacing: "-1px" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Invoice list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {data.invoices.map(inv => {
          const patient = data.patients.find(p => p.id === inv.patientId);
          const doctor  = data.doctors.find(d => d.id === inv.doctorId);
          const total   = inv.items.reduce((s, i) => s + Number(i.amount), 0);
          return (
            <Card key={inv.id} style={{ padding: "18px 22px" }}>
              {/* Invoice header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <Avatar initials={patient?.name.split(" ").map(n => n[0]).join("") || "?"} size={40} color="#3B82F6" />
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: colors.text }}>{patient?.name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: colors.textMuted }}>
                      Invoice #{inv.id} · {inv.date} · {doctor?.name}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Badge status={inv.status} />
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: colors.text }}>${total}</p>
                </div>
              </div>

              {/* Line items */}
              <div style={{ background: "#F8FAFC", borderRadius: 8, padding: "10px 14px" }}>
                {inv.items.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", justifyContent: "space-between",
                      fontSize: 13, padding: "4px 0",
                      borderBottom: i < inv.items.length - 1 ? `1px solid ${colors.border}` : "none",
                    }}
                  >
                    <span style={{ color: colors.text }}>{item.desc}</span>
                    <span style={{ fontWeight: 600, color: colors.text }}>${item.amount}</span>
                  </div>
                ))}
              </div>

              {/* Mark paid */}
              {inv.status === "Pending" && canWrite && (
                <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                  <Btn variant="secondary" style={{ fontSize: 12, padding: "6px 14px" }} onClick={() => markPaid(inv.id)}>
                    Mark as Paid
                  </Btn>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Generate invoice modal */}
      {modal && (
        <Modal title="Generate Invoice" onClose={() => setModal(false)}>
          <Select label="Patient" value={invoice.patientId} onChange={e => setInvoice(f => ({ ...f, patientId: e.target.value }))} options={data.patients.map(p => ({ value: p.id, label: p.name }))} />
          <Select label="Doctor"  value={invoice.doctorId}  onChange={e => setInvoice(f => ({ ...f, doctorId: e.target.value  }))} options={data.doctors.map(d => ({ value: d.id, label: d.name }))} />

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Line Items
            </label>
            {invoice.items.map((item, idx) => (
              <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  value={item.desc}
                  onChange={e => updateItem(idx, "desc", e.target.value)}
                  placeholder="Description"
                  style={{ flex: 3, padding: "8px 10px", border: `1px solid ${colors.border}`, borderRadius: 7, fontSize: 13, outline: "none" }}
                />
                <input
                  value={item.amount}
                  onChange={e => updateItem(idx, "amount", Number(e.target.value))}
                  type="number"
                  placeholder="$"
                  style={{ flex: 1, padding: "8px 10px", border: `1px solid ${colors.border}`, borderRadius: 7, fontSize: 13, outline: "none" }}
                />
                <button
                  onClick={() => removeItem(idx)}
                  style={{ padding: "8px 10px", background: "#FFF0F0", border: "none", borderRadius: 7, cursor: "pointer", color: colors.danger, fontWeight: 700 }}
                >
                  ✕
                </button>
              </div>
            ))}
            <Btn variant="ghost" onClick={addItem} style={{ fontSize: 12, padding: "6px 12px" }}>+ Add Item</Btn>
          </div>

          <div style={{ padding: "10px 14px", background: "#F8FAFC", borderRadius: 8, marginBottom: 16 }}>
            <p style={{ margin: 0, fontWeight: 700, color: colors.text }}>
              Total: ${invoice.items.reduce((s, i) => s + Number(i.amount || 0), 0)}
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={generateInvoice}>Generate Invoice</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
