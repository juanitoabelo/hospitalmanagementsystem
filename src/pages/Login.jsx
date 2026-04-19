// src/pages/Login.jsx
import { useState } from "react";
import { authApi } from "../utils/api";
import { colors } from "../utils/theme";
import { Input, Btn } from "../components/UI";

function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

export default function Login({ onLogin }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return setError("Please enter your email and password.");
    setLoading(true);
    setError("");
    try {
      const { token, user } = await authApi.login(email, password);
      onLogin({ ...user, id: user._id, avatar: initials(user.name) }, token);
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${colors.sidebar} 0%, #162338 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 40, width: "100%", maxWidth: 420, boxShadow: "0 30px 80px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>⊕</div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: colors.text, letterSpacing: "-0.5px" }}>MediCore HMS</h1>
          <p style={{ margin: "6px 0 0", color: colors.textMuted, fontSize: 14 }}>Hospital Management System</p>
        </div>

        <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKey} placeholder="your@hospital.com" />
        <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKey} placeholder="••••••••" />

        {error && (
          <div style={{ background: "#FFF0F0", border: "1px solid #FFC0C0", borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
            <p style={{ color: colors.danger, fontSize: 13, margin: 0 }}>{error}</p>
          </div>
        )}

        <Btn onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: "11px 0", fontSize: 15, marginBottom: 20 }}>
          {loading ? "Signing in…" : "Sign In Securely"}
        </Btn>

        <div style={{ padding: 14, background: colors.primaryLight, borderRadius: 10, border: `1px solid ${colors.primary}30` }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: colors.primary }}>🔒 Secure Login</p>
          <p style={{ margin: 0, fontSize: 12, color: colors.primary, lineHeight: 1.6 }}>
            Enter your registered email and password. Credentials are verified against MongoDB. JWT tokens expire after 1 hour.
          </p>
        </div>

        <div style={{ marginTop: 16, padding: 12, background: "#F8FAFC", borderRadius: 8, border: `1px solid ${colors.border}` }}>
          <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: colors.textMuted }}>Demo Credentials:</p>
          <div style={{ fontSize: 11, color: colors.text }}>
            <p style={{ margin: "0 0 2px" }}><strong>Admin:</strong> admin@medicore.com / Admin1234!</p>
            <p style={{ margin: "0 0 2px" }}><strong>Doctor:</strong> sarah@medicore.com / Doctor123!</p>
            <p style={{ margin: "0 0 2px" }}><strong>Receptionist:</strong> reception@medicore.com / Reception123!</p>
            <p style={{ margin: "0" }}><strong>Patient:</strong> patient@medicore.com / Patient123!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
