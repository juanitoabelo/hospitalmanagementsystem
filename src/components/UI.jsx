// src/components/UI.jsx
// ─────────────────────────────────────────────
// Reusable base components: Badge, Avatar,
// Card, Input, Select, Btn, Modal
// ─────────────────────────────────────────────
import { colors, STATUS_COLORS } from "../utils/theme";

export const Badge = ({ status }) => {
  const s = STATUS_COLORS[status] || { bg: "#F0F4F8", color: "#64748B" };
  return (
    <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
      {status}
    </span>
  );
};

export const Avatar = ({ initials, size = 36, color = colors.primary }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: color + "20", color,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: size * 0.35, flexShrink: 0,
    border: `1.5px solid ${color}30`,
  }}>
    {initials}
  </div>
);

export const Card = ({ children, style }) => (
  <div style={{
    background: colors.card, borderRadius: 14,
    border: `1px solid ${colors.border}`,
    padding: "20px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    ...style,
  }}>
    {children}
  </div>
);

export const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && (
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </label>
    )}
    <input
      style={{ width: "100%", padding: "9px 12px", border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 14, outline: "none", color: colors.text, background: "#FAFBFC", boxSizing: "border-box" }}
      {...props}
    />
  </div>
);

export const Select = ({ label, options, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && (
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </label>
    )}
    <select
      style={{ width: "100%", padding: "9px 12px", border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 14, outline: "none", color: colors.text, background: "#FAFBFC", boxSizing: "border-box" }}
      {...props}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

export const Btn = ({ children, variant = "primary", onClick, style, disabled }) => {
  const VARIANTS = {
    primary:   { background: colors.primary,   color: "#fff",           border: "none" },
    secondary: { background: "transparent",     color: colors.primary,   border: `1px solid ${colors.primary}` },
    danger:    { background: colors.danger,     color: "#fff",           border: "none" },
    ghost:     { background: "transparent",     color: colors.textMuted, border: `1px solid ${colors.border}` },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...VARIANTS[variant],
        padding: "8px 18px", borderRadius: 8,
        fontWeight: 600, fontSize: 13,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
};

export const Modal = ({ title, onClose, children }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
    <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 18, color: colors.text }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: colors.textMuted, lineHeight: 1 }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

export const Textarea = ({ label, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && (
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </label>
    )}
    <textarea
      style={{ width: "100%", padding: "9px 12px", border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 14, outline: "none", minHeight: 80, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", color: colors.text }}
      {...props}
    />
  </div>
);
