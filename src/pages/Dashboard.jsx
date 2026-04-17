// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { patientsApi, doctorsApi, appointmentsApi, invoicesApi } from "../utils/api";
import { colors } from "../utils/theme";
import { Card, Avatar, Badge } from "../components/UI";

export default function Dashboard({ user }) {
  const [stats,    setStats]    = useState({ patients: 0, doctors: 0, todayAppts: 0, revenue: 0 });
  const [appts,    setAppts]    = useState([]);
  const [doctors,  setDoctors]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      patientsApi.list(),
      doctorsApi.list(),
      appointmentsApi.list(),
      invoicesApi.summary(),
    ]).then(([patients, docs, appointments, summary]) => {
      const todayAppts = appointments.filter(a => a.date === today).length;
      setStats({ patients: patients.length, doctors: docs.length, todayAppts, revenue: summary.total || 0 });
      setAppts(appointments.slice(0, 4));
      setDoctors(docs);
    }).catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error)   return <ErrorBox msg={error} />;

  const STAT_CARDS = [
    { label: "Total Patients",     value: stats.patients,              icon: "♡", color: "#3B82F6", delta: "registered" },
    { label: "Appointments Today", value: stats.todayAppts,            icon: "⊡", color: colors.primary, delta: "scheduled" },
    { label: "Active Doctors",     value: stats.doctors,               icon: "✚", color: "#8B5CF6", delta: "on staff" },
    { label: "Total Revenue",      value: `$${stats.revenue.toLocaleString()}`, icon: "◎", color: "#F0A500", delta: "all time" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: colors.text }}>Good morning, {user.name?.split(" ")[0]} 👋</h2>
        <p style={{ margin: "4px 0 0", color: colors.textMuted, fontSize: 14 }}>Live data from MongoDB · MediCore HMS</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {STAT_CARDS.map(s => (
          <Card key={s.label} style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: "0 0 8px", fontSize: 12, color: colors.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
                <p style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800, color: colors.text, letterSpacing: "-1px" }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: 12, color: colors.textMuted }}>{s.delta}</p>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: s.color }}>{s.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        <Card>
          <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, color: colors.text }}>Recent Appointments</h3>
          {appts.length === 0 && <p style={{ color: colors.textMuted, fontSize: 14 }}>No appointments yet.</p>}
          {appts.map(a => {
            const patientName = a.patientId?.name || "Unknown";
            const doctorName  = a.doctorId?.name  || "Unknown";
            return (
              <div key={a._id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", borderBottom: `1px solid ${colors.border}` }}>
                <Avatar initials={patientName.split(" ").map(n => n[0]).join("")} size={38} color="#3B82F6" />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: colors.text }}>{patientName}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: colors.textMuted }}>{doctorName} · {a.type}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: "0 0 4px", fontSize: 12, color: colors.textMuted }}>{a.date} · {a.time}</p>
                  <Badge status={a.status} />
                </div>
              </div>
            );
          })}
        </Card>

        <Card>
          <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, color: colors.text }}>Doctors On Duty</h3>
          {doctors.map(d => (
            <div key={d._id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <Avatar initials={d.avatar || d.name?.slice(0,2)} size={40} color={d.status === "Available" ? colors.primary : colors.textMuted} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: colors.text }}>{d.name}</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: colors.textMuted }}>{d.specialty}</p>
              </div>
              <Badge status={d.status} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
      <p style={{ color: "#64748B" }}>Loading dashboard…</p>
    </div>
  );
}

function ErrorBox({ msg }) {
  return (
    <div style={{ padding: 20, background: "#FFF0F0", borderRadius: 10, border: "1px solid #FFC0C0" }}>
      <p style={{ margin: 0, color: "#C0392B", fontWeight: 600 }}>Failed to load dashboard</p>
      <p style={{ margin: "6px 0 0", fontSize: 13, color: "#C0392B" }}>{msg}</p>
    </div>
  );
}
