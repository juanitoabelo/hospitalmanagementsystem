// src/utils/auth.js
// ─────────────────────────────────────────────
// JWT simulation + Role-Based Access Control
// In production: replace btoa/atob with real
// jsonwebtoken library on your Express server
// ─────────────────────────────────────────────

/** Sign a JWT-style token for a user (base64 encoded payload) */
export const signToken = (user) =>
  btoa(JSON.stringify({ sub: user.id, role: user.role, exp: Date.now() + 3_600_000 }));

/** Verify and decode a token. Returns null if invalid/expired. */
export const verifyToken = (token) => {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) return null; // token expired
    return payload;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────
// RBAC Permission Matrix
// Actions: "r" = read, "w" = write, "d" = delete
// ─────────────────────────────────────────────
const PERMISSIONS = {
  Admin:        { patients: ["r","w","d"], appointments: ["r","w","d"], doctors: ["r","w","d"], billing: ["r","w","d"] },
  Doctor:       { patients: ["r","w"],     appointments: ["r","w"],     doctors: ["r"],         billing: ["r"]         },
  Receptionist: { patients: ["r","w"],     appointments: ["r","w","d"], doctors: ["r"],         billing: ["r"]         },
  Patient:      { patients: ["r"],         appointments: ["r","w"],     doctors: ["r"],         billing: ["r"]         },
};

/**
 * Check if a role has permission to perform an action on a resource.
 * @param {string} role      - "Admin" | "Doctor" | "Receptionist" | "Patient"
 * @param {string} resource  - "patients" | "appointments" | "doctors" | "billing"
 * @param {string} action    - "r" | "w" | "d"
 */
export const hasPermission = (role, resource, action) =>
  PERMISSIONS[role]?.[resource]?.includes(action) ?? false;
