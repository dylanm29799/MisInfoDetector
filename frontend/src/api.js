// Thin fetch wrapper that attaches the JWT and normalises errors.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const TOKEN_KEY = "misinfo_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { detail: text };
    }
  }

  if (!res.ok) {
    const message =
      (data && (data.detail || data.message)) || `Request failed (${res.status})`;
    const err = new Error(
      typeof message === "string" ? message : "Request failed"
    );
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  signup: (email, password) =>
    request("/api/auth/signup", {
      method: "POST",
      body: { email, password },
      auth: false,
    }),
  login: (email, password) =>
    request("/api/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    }),
  runCheck: (url) => request("/api/checks", { method: "POST", body: { url } }),
  listChecks: () => request("/api/checks"),
  getCheck: (id) => request(`/api/checks/${id}`),
};
