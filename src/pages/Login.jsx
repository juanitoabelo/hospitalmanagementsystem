// src/pages/Login.jsx
// ─────────────────────────────────────────────
// Authentication screen with quick-role buttons
// JWT token is issued on successful login
// ─────────────────────────────────────────────
import { useState } from "react";
import { MOCK_DB } from "../data/mockDb";
import { signToken } from "../utils/auth";
import { colors } from "../utils/theme";
import { Input, Btn } from "../components/UI";

export default function Login({ onLogin }) {
  const [email, setEmail]     = useState("james@hospital.com");
  const [password, setPassword] = useState("demo");
  const [error, setError]     = useState("");

  const handleLogin = () => {
    const user = MOCK_DB.users.find(u => u.email === email);
    if (user && password === "demo") {
      onLogin(user, signToken(user));
    } else {
      setError("Invalid credentials. Use any listed email with password: demo");
    }
  };

  const quickLogin = (u) => onLogin(u, signToken(u));

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${colors.sidebar} 0%, #162338 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 40, width: "100%", maxWidth: 420, boxShadow: "0 30px 80px rgba(0,0,0,0.3)" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>⊕</div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: colors.text, letterSpacing: "-0.5px" }}>MediCore HMS</h1>
          <p style={{ margin: "6px 0 0", color: colors.textMuted, fontSize: 14 }}>Hospital Management System</p>
        </div>

        {/* Form */}
        <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@hospital.com" />
        <Input label="Password"      type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        {error && <p style={{ color: colors.danger, fontSize: 13, margin: "-8px 0 12px" }}>{error}</p>}

        <Btn onClick={handleLogin} style={{ width: "100%", padding: "11px 0", fontSize: 15, marginBottom: 20 }}>
          Sign In Securely
        </Btn>

        {/* Quick-access role buttons */}
        <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 20 }}>
          <p style={{ fontSize: 12, color: colors.textMuted, textAlign: "center", marginBottom: 10 }}>Quick access — Demo roles</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {MOCK_DB.users.map(u => (
              <Btn key={u.id} variant="ghost" onClick={() => quickLogin(u)} style={{ fontSize: 12, padding: "7px 10px" }}>
                {u.role}
              </Btn>
            ))}
          </div>
        </div>

        {/* Security note */}
        <div style={{ marginTop: 16, padding: 12, background: "#F0FFF6", borderRadius: 8, border: "1px solid #C6F1D6" }}>
          <p style={{ margin: 0, fontSize: 11, color: "#0A5C35", lineHeight: 1.6 }}>
            🔒 <strong>JWT Auth:</strong> Tokens encode role, subject ID, and 1-hour expiry. All modules enforce RBAC. HIPAA-compliant simulation.
          </p>
        </div>
      </div>
    </div>
  );
}
