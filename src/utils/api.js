// src/utils/api.js
// ─────────────────────────────────────────────
// Centralised API service — all HTTP calls go
// through here. Reads token from localStorage.
// Base URL auto-detects dev vs prod via the
// CRA proxy (package.json "proxy" field).
// ─────────────────────────────────────────────

const BASE = "/api";

// ── Helpers ───────────────────────────────────

function getToken() {
  return localStorage.getItem("hms_token") || "";
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || `Request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

const get  = (path)         => request("GET",    path);
const post = (path, body)   => request("POST",   path, body);
const put  = (path, body)   => request("PUT",    path, body);
const del  = (path)         => request("DELETE", path);

// ── Auth ──────────────────────────────────────
export const authApi = {
  login:    (email, password) => post("/auth/login",    { email, password }),
  register: (payload)         => post("/auth/register", payload),
  me:       ()                => get("/auth/me"),
};

// ── Patients ──────────────────────────────────
export const patientsApi = {
  list:   (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return get(`/patients${qs ? "?" + qs : ""}`);
  },
  get:    (id)     => get(`/patients/${id}`),
  create: (data)   => post("/patients", data),
  update: (id, data) => put(`/patients/${id}`, data),
  remove: (id)     => del(`/patients/${id}`),
};

// ── Doctors ───────────────────────────────────
export const doctorsApi = {
  list:   (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return get(`/doctors${qs ? "?" + qs : ""}`);
  },
  get:    (id)     => get(`/doctors/${id}`),
  create: (data)   => post("/doctors", data),
  update: (id, data) => put(`/doctors/${id}`, data),
  remove: (id)     => del(`/doctors/${id}`),
};

// ── Appointments ──────────────────────────────
export const appointmentsApi = {
  list:   (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return get(`/appointments${qs ? "?" + qs : ""}`);
  },
  get:    (id)     => get(`/appointments/${id}`),
  create: (data)   => post("/appointments", data),
  update: (id, data) => put(`/appointments/${id}`, data),
  remove: (id)     => del(`/appointments/${id}`),
};

// ── Invoices ──────────────────────────────────
export const invoicesApi = {
  list:    (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return get(`/invoices${qs ? "?" + qs : ""}`);
  },
  summary: ()           => get("/invoices/summary"),
  get:     (id)         => get(`/invoices/${id}`),
  create:  (data)       => post("/invoices", data),
  update:  (id, data)   => put(`/invoices/${id}`, data),
  remove:  (id)         => del(`/invoices/${id}`),
};
