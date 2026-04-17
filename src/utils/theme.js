// src/utils/theme.js
// ─────────────────────────────────────────────
// Shared design tokens — colors, status mappings
// ─────────────────────────────────────────────

export const colors = {
  primary:      "#0D7D6B",
  primaryHover: "#0B6B5A",
  primaryLight: "#E6F4F1",
  accent:       "#F0A500",
  danger:       "#DC3545",
  dangerLight:  "#FFF0F0",
  success:      "#1A7A4A",
  successLight: "#F0FFF6",
  warning:      "#F0A500",
  warningLight: "#FFFBF0",
  sidebar:      "#0A1628",
  sidebarText:  "#8FA3C0",
  sidebarActive:"#162338",
  card:         "#FFFFFF",
  bg:           "#F4F7FA",
  border:       "#E2E8F0",
  text:         "#1A2332",
  textMuted:    "#64748B",
};

export const STATUS_COLORS = {
  Active:     { bg: "#E6F9F0", color: "#0E7A45" },
  Inactive:   { bg: "#F0F4F8", color: "#64748B" },
  Confirmed:  { bg: "#E6F4F1", color: "#0D7D6B" },
  Pending:    { bg: "#FFFBF0", color: "#B07800" },
  Cancelled:  { bg: "#FFF0F0", color: "#C0392B" },
  Paid:       { bg: "#E6F9F0", color: "#0E7A45" },
  Available:  { bg: "#E6F9F0", color: "#0E7A45" },
  Busy:       { bg: "#FFFBF0", color: "#B07800" },
  "Off-Duty": { bg: "#F0F4F8", color: "#64748B" },
};

export const BLOOD_TYPES    = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];
export const SPECIALTIES    = ["Cardiology","Pulmonology","Orthopedics","Neurology","Oncology","Pediatrics","Dermatology","General Practice"];
export const APPT_TYPES     = ["Checkup","Consultation","Follow-up","Emergency","Surgery"];
export const DOCTOR_STATUSES= ["Available","Busy","Off-Duty"];
