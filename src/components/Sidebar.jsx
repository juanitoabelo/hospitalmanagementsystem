// src/components/Sidebar.jsx
// ─────────────────────────────────────────────
// Left navigation rail with role display
// and sign-out button
// ─────────────────────────────────────────────
import { colors } from "../utils/theme";
import { Avatar, Btn } from "./UI";

const NAV_ITEMS = [
  { id: "dashboard",    label: "Dashboard",    icon: "⊞" },
  { id: "patients",     label: "Patients",     icon: "♡" },
  { id: "appointments", label: "Appointments", icon: "⊡" },
  { id: "doctors",      label: "Doctors",      icon: "✚" },
  { id: "billing",      label: "Billing",      icon: "◎" },
];

export default function Sidebar({ active, onNav, user, onLogout }) {
  return (
    <div style={{ width: 240, background: colors.sidebar, display: "flex", flexDirection: "column", height: "100vh", position: "fixed", top: 0, left: 0 }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⊕</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px" }}>MediCore</div>
            <div style={{ color: colors.sidebarText, fontSize: 11 }}>HMS Platform</div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                width: "100%", padding: "11px 20px",
                border: "none", cursor: "pointer",
                background: isActive ? colors.sidebarActive : "transparent",
                color: isActive ? "#fff" : colors.sidebarText,
                textAlign: "left",
                borderLeft: isActive ? `3px solid ${colors.primary}` : "3px solid transparent",
                transition: "all 0.15s",
                fontSize: 14,
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Avatar initials={user.avatar} size={34} color={colors.primary} />
          <div>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{user.name.split(" ")[0]}</div>
            <div style={{ color: colors.sidebarText, fontSize: 11 }}>{user.role}</div>
          </div>
        </div>
        <Btn
          variant="ghost"
          onClick={onLogout}
          style={{ width: "100%", color: colors.sidebarText, borderColor: "rgba(255,255,255,0.1)", fontSize: 12 }}
        >
          Sign Out
        </Btn>
      </div>
    </div>
  );
}
