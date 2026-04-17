// src/pages/Dashboard.jsx
// ─────────────────────────────────────────────
// Overview: stat cards, recent appointments,
// doctor availability panel
// ─────────────────────────────────────────────
import { colors } from "../utils/theme";
import { Card, Avatar, Badge } from "../components/UI";

export default function Dashboard({ data, user }) {
  const revenue     = data.invoices.reduce((s, inv) => s + inv.items.reduce((a, i) => a + i.amount, 0), 0);
  const todayAppts  = data.appointments.filter(a => a.date === "2025-07-14").length;

  const STATS = [
    { label: "Total Patients",      value: data.patients.length,                                delta: "+3 this week",  icon: "♡", color: "#3B82F6" },
    { label: "Appointments Today",  value: todayAppts,                                          delta: "2 confirmed",   icon: "⊡", color: colors.primary },
    { label: "Active Doctors",      value: data.doctors.filter(d => d.status === "Available").length, delta: "1 on leave",    icon: "✚", color: "#8B5CF6" },
    { label: "Total Revenue",       value: `$${revenue.toLocaleString()}`,                      delta: "+$420 today",   icon: "◎", color: "#F0A500" },
  ];

  return (
    <div>
      {/* Greeting */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: colors.text }}>Good morning, {user.name.split(" ")[0]} 👋</h2>
        <p style={{ margin: "4px 0 0", color: colors.textMuted, fontSize: 14 }}>Here's what's happening at MediCore today.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {STATS.map(s => (
          <Card key={s.label} style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: "0 0 8px", fontSize: 12, color: colors.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
                <p style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 800, color: colors.text, letterSpacing: "-1px" }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: 12, color: colors.success }}>{s.delta}</p>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: s.color }}>
                {s.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main content row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        {/* Recent appointments */}
        <Card>
          <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, color: colors.text }}>Recent Appointments</h3>
          {data.appointments.slice(0, 4).map(a => {
            const patient = data.patients.find(p => p.id === a.patientId);
            const doctor  = data.doctors.find(d => d.id === a.doctorId);
            return (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", borderBottom: `1px solid ${colors.border}` }}>
                <Avatar initials={patient?.name.split(" ").map(n => n[0]).join("") || "?"} size={38} color="#3B82F6" />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: colors.text }}>{patient?.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: colors.textMuted }}>{doctor?.name} · {a.type}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: "0 0 4px", fontSize: 12, color: colors.textMuted }}>{a.date} · {a.time}</p>
                  <Badge status={a.status} />
                </div>
              </div>
            );
          })}
        </Card>

        {/* Doctors on duty */}
        <Card>
          <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, color: colors.text }}>Doctors On Duty</h3>
          {data.doctors.map(d => (
            <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <Avatar initials={d.avatar} size={40} color={d.status === "Available" ? colors.primary : colors.textMuted} />
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
