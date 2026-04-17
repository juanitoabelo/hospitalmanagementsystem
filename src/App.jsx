// src/App.jsx
// ─────────────────────────────────────────────
// Root shell: real JWT auth via Express API,
// token persisted in localStorage, RBAC routing
// ─────────────────────────────────────────────
import { useState, useEffect } from "react";
import { verifyToken }   from "./utils/auth";
import { authApi }       from "./utils/api";
import { colors }        from "./utils/theme";

import Sidebar       from "./components/Sidebar";
import Login         from "./pages/Login";
import Dashboard     from "./pages/Dashboard";
import Patients      from "./pages/Patients";
import Appointments  from "./pages/Appointments";
import Doctors       from "./pages/Doctors";
import Billing       from "./pages/Billing";
import Schema        from "./pages/Schema";

function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

export default function App() {
  const [authUser,  setAuthUser]  = useState(null);
  const [token,     setToken]     = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [booting,   setBooting]   = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("hms_token");
    if (saved) {
      const payload = verifyToken(saved);
      if (payload) {
        authApi.me()
          .then(user => {
            setToken(saved);
            setAuthUser({ ...user, id: user._id, avatar: initials(user.name) });
          })
          .catch(() => localStorage.removeItem("hms_token"))
          .finally(() => setBooting(false));
      } else {
        localStorage.removeItem("hms_token");
        setBooting(false);
      }
    } else {
      setBooting(false);
    }
  }, []);

  const handleLogin = (user, tok) => {
    localStorage.setItem("hms_token", tok);
    setToken(tok);
    setAuthUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("hms_token");
    setAuthUser(null);
    setToken(null);
  };

  if (booting) {
    return (
      <div style={{ minHeight: "100vh", background: colors.sidebar, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>⊕</div>
        <p style={{ color: colors.sidebarText, fontSize: 14, margin: 0 }}>Loading MediCore…</p>
      </div>
    );
  }

  if (!authUser) return <Login onLogin={handleLogin} />;

  const tokenData = verifyToken(token);

  const PAGE = {
    dashboard:    <Dashboard    user={authUser} />,
    patients:     <Patients     user={authUser} />,
    appointments: <Appointments user={authUser} />,
    doctors:      <Doctors      user={authUser} />,
    billing:      <Billing      user={authUser} />,
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: colors.bg, minHeight: "100vh" }}>
      <Sidebar active={activeTab} onNav={setActiveTab} user={authUser} onLogout={handleLogout} />
      <div style={{ marginLeft: 240, padding: "32px 36px", minHeight: "100vh" }}>
        <div style={{ marginBottom: 20, padding: "8px 14px", background: colors.primaryLight, borderRadius: 8, border: `1px solid ${colors.primary}25`, display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: colors.primary }}>
          <span>🔑</span>
          <span><strong>JWT Token active</strong>{" — "}sub: {tokenData?.sub} · role: {tokenData?.role} · expires: {new Date((tokenData?.exp || 0) * 1000).toLocaleTimeString()}</span>
          <span style={{ marginLeft: "auto", background: colors.primary, color: "#fff", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>SECURE SESSION</span>
        </div>
        {PAGE[activeTab]}
        <div style={{ marginTop: 40, paddingTop: 32, borderTop: `1px solid ${colors.border}` }}>
          <Schema />
        </div>
      </div>
    </div>
  );
}
