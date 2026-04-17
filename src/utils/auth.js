// src/utils/auth.js
// Client-side JWT decode + RBAC
export const verifyToken = (token) => {
  try {
    const base64url = token.split(".")[1];
    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
    );
    const payload = JSON.parse(json);
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch { return null; }
};

export const signToken = () => null;

const PERMISSIONS = {
  Admin:        { patients: ["r","w","d"], appointments: ["r","w","d"], doctors: ["r","w","d"], billing: ["r","w","d"] },
  Doctor:       { patients: ["r","w"],     appointments: ["r","w"],     doctors: ["r"],         billing: ["r"]         },
  Receptionist: { patients: ["r","w"],     appointments: ["r","w","d"], doctors: ["r"],         billing: ["r"]         },
  Patient:      { patients: ["r"],         appointments: ["r","w"],     doctors: ["r"],         billing: ["r"]         },
};

export const hasPermission = (role, resource, action) =>
  PERMISSIONS[role]?.[resource]?.includes(action) ?? false;
