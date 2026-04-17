// src/pages/Billing.jsx — live MongoDB
import { useState, useEffect, useCallback } from "react";
import { invoicesApi, patientsApi, doctorsApi } from "../utils/api";
import { hasPermission } from "../utils/auth";
import { colors } from "../utils/theme";
import { Card, Avatar, Badge, Select, Btn, Modal } from "../components/UI";

export default function Billing({ user }) {
  const [invoices,  setInvoices]  = useState([]);
  const [patients,  setPatients]  = useState([]);
  const [doctors,   setDoctors]   = useState([]);
  const [summary,   setSummary]   = useState({ total: 0, pending: 0, count: 0 });
  const [modal,     setModal]     = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");
  const [invoice, setInvoice] = useState({ patientId: "", doctorId: "", items: [{ desc: "Consultation", amount: 150 }] });

  const canWrite = hasPermission(user.role, "billing", "w");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [inv, pts, docs, sum] = await Promise.all([
        invoicesApi.list(),
        patientsApi.list(),
        doctorsApi.list(),
        invoicesApi.summary(),
      ]);
      setInvoices(inv);
      setPatients(pts);
      setDoctors(docs);
      setSummary(sum);
      setInvoice(i => ({ ...i, patientId: pts[0]?._id || "", doctorId: docs[0]?._id || "" }));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addItem    = () => setInvoice(f => ({ ...f, items: [...f.items, { desc: "", amount: 0 }] }));
  const removeItem = (idx) => setInvoice(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx, key, val) => setInvoice(f => ({ ...f, items: f.items.map((item, i) => i === idx ? { ...item, [key]: val } : item) }));

  const generateInvoice = async () => {
    if (invoice.items.some(i => !i.desc.trim())) return alert("Please fill in all item descriptions.");
    setSaving(true);
    try {
      await invoicesApi.create(invoice);
      setModal(false);
      load();
    } catch (e) { alert("Error creating invoice: " + e.message); }
    finally { setSaving(false); }
  };

  const markPaid = async (id) => {
    try {
      await invoicesApi.update(id, { status: "Paid" });
      load();
    } catch (e) { alert("Error: " + e.message); }
  };

  if (loading) return <p style={{ color: colors.textMuted, padding: 20 }}>Loading billing data…</p>;
  if (error)   return <p style={{ color: colors.danger,   padding: 20 }}>Error: {error}</p>;

  const SUMMARY_CARDS = [
    { label: "Total Revenue",      value: `$${(summary.total || 0).toLocaleString()}`,   color: colors.success, bg: colors.successLight },
    { label: "Pending Collection", value: `$${(summary.pending || 0).toLocaleString()}`, color: "#B07800",      bg: "#FFFBF0" },
    { label: "Total Invoices",     value: summary.count || 0,                            color: "#3B82F6",      bg: "#EFF6FF" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: colors.text }}>Billing & Invoicing</h2>
          <p style={{ margin: "4px 0 0", color: colors.textMuted, fontSize: 14 }}>Live data from MongoDB</p>
        </div>
        {canWrite && <Btn onClick={() => setModal(true)}>+ Generate Invoice</Btn>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        {SUMMARY_CARDS.map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: "18px 22px", border: `1px solid ${s.color}25` }}>
            <p style={{ margin: "0 0 6px", fontSize: 12, color: s.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: 30, fontWeight: 800, color: s.color, letterSpacing: "-1px" }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {invoices.map(inv => {
          const patientName = inv.patientId?.name || "Unknown";
          const doctorName  = inv.doctorId?.name  || "Unknown";
          const total = inv.items.reduce((s, i) => s + Number(i.amount), 0);
          return (
            <Card key={inv._id} style={{ padding: "18px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <Avatar initials={patientName.split(" ").map(n => n[0]).join("")} size={40} color="#3B82F6" />
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: colors.text }}>{patientName}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: colors.textMuted }}>Invoice #{inv._id?.slice(-6)} · {new Date(inv.date).toLocaleDateString()} · {doctorName}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Badge status={inv.status} />
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: colors.text }}>${total}</p>
                </div>
              </div>
              <div style={{ background: "#F8FAFC", borderRadius: 8, padding: "10px 14px" }}>
                {inv.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: i < inv.items.length - 1 ? `1px solid ${colors.border}` : "none" }}>
                    <span style={{ color: colors.text }}>{item.desc}</span>
                    <span style={{ fontWeight: 600, color: colors.text }}>${item.amount}</span>
                  </div>
                ))}
              </div>
              {inv.status === "Pending" && canWrite && (
                <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                  <Btn variant="secondary" style={{ fontSize: 12, padding: "6px 14px" }} onClick={() => markPaid(inv._id)}>Mark as Paid</Btn>
                </div>
              )}
            </Card>
          );
        })}
        {invoices.length === 0 && <Card style={{ padding: 40, textAlign: "center" }}><p style={{ color: colors.textMuted, margin: 0 }}>No invoices yet. Generate one to get started.</p></Card>}
      </div>

      {modal && (
        <Modal title="Generate Invoice" onClose={() => setModal(false)}>
          <Select label="Patient" value={invoice.patientId} onChange={e => setInvoice(f => ({ ...f, patientId: e.target.value }))} options={patients.map(p => ({ value: p._id, label: p.name }))} />
          <Select label="Doctor"  value={invoice.doctorId}  onChange={e => setInvoice(f => ({ ...f, doctorId:  e.target.value }))} options={doctors.map(d => ({ value: d._id, label: d.name }))} />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Line Items</label>
            {invoice.items.map((item, idx) => (
              <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input value={item.desc} onChange={e => updateItem(idx, "desc", e.target.value)} placeholder="Description" style={{ flex: 3, padding: "8px 10px", border: `1px solid ${colors.border}`, borderRadius: 7, fontSize: 13, outline: "none" }} />
                <input value={item.amount} onChange={e => updateItem(idx, "amount", Number(e.target.value))} type="number" placeholder="$" style={{ flex: 1, padding: "8px 10px", border: `1px solid ${colors.border}`, borderRadius: 7, fontSize: 13, outline: "none" }} />
                <button onClick={() => removeItem(idx)} style={{ padding: "8px 10px", background: "#FFF0F0", border: "none", borderRadius: 7, cursor: "pointer", color: colors.danger, fontWeight: 700 }}>✕</button>
              </div>
            ))}
            <Btn variant="ghost" onClick={addItem} style={{ fontSize: 12, padding: "6px 12px" }}>+ Add Item</Btn>
          </div>
          <div style={{ padding: "10px 14px", background: "#F8FAFC", borderRadius: 8, marginBottom: 16 }}>
            <p style={{ margin: 0, fontWeight: 700, color: colors.text }}>Total: ${invoice.items.reduce((s, i) => s + Number(i.amount || 0), 0)}</p>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={generateInvoice} disabled={saving}>{saving ? "Saving…" : "Generate Invoice"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
