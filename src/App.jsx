// src/App.jsx
// ─────────────────────────────────────────────
// Root shell: auth gate, sidebar, JWT bar,
// page routing, shared DB state
// ─────────────────────────────────────────────
import { useState } from "react";
import { MOCK_DB }     from "./data/mockDb";
import { signToken, verifyToken } from "./utils/auth";
import { colors }      from "./utils/theme";

import Sidebar       from "./components/Sidebar";
import Login         from "./pages/Login";
import Dashboard     from "./pages/Dashboard";
import Patients      from "./pages/Patients";
import Appointments  from "./pages/Appointments";
import Doctors       from "./pages/Doctors";
import Billing       from "./pages/Billing";
import Schema        from "./pages/Schema";

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [token,    setToken]    = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [db, setDb] = useState(MOCK_DB);

  const handleLogin  = (user, tok) => { setAuthUser(user); setToken(tok); };
  const handleLogout = ()          => { setAuthUser(null); setToken(null); };

  // Show login if not authenticated
  if (!authUser) return <Login onLogin={handleLogin} />;

  const tokenData = verifyToken(token);

  const PAGE = {
    dashboard:    <Dashboard    data={db}              user={authUser} />,
    patients:     <Patients     data={db} setData={setDb} user={authUser} />,
    appointments: <Appointments data={db} setData={setDb} user={authUser} />,
    doctors:      <Doctors      data={db} setData={setDb} user={authUser} />,
    billing:      <Billing      data={db} setData={setDb} user={authUser} />,
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: colors.bg, minHeight: "100vh" }}>
      <Sidebar active={activeTab} onNav={setActiveTab} user={authUser} onLogout={handleLogout} />

      <div style={{ marginLeft: 240, padding: "32px 36px", minHeight: "100vh" }}>
        {/* JWT session bar */}
        <div style={{
          marginBottom: 20, padding: "8px 14px",
          background: colors.primaryLight, borderRadius: 8,
          border: `1px solid ${colors.primary}25`,
          display: "flex", alignItems: "center", gap: 10,
          fontSize: 11, color: colors.primary,
        }}>
          <span>🔑</span>
          <span>
            <strong>JWT Token active</strong>
            {" — "}sub: {tokenData?.sub} · role: {tokenData?.role} · expires: {new Date(tokenData?.exp).toLocaleTimeString()}
          </span>
          <span style={{ marginLeft: "auto", background: colors.primary, color: "#fff", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
            SECURE SESSION
          </span>
        </div>

        {/* Active page */}
        {PAGE[activeTab]}

        {/* DB schema always at bottom */}
        <div style={{ marginTop: 40, paddingTop: 32, borderTop: `1px solid ${colors.border}` }}>
          <Schema />
        </div>
      </div>
    </div>
  );
}
