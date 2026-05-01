const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
export async function api(path, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const auth = {
  signup: (data) =>
    api("/api/auth/signup", { method: "POST", body: JSON.stringify(data) }),
  login: (data) =>
    api("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
  me: () => api("/api/auth/me"),
};

export const projects = {
  list: () => api("/api/projects"),
  create: (data) =>
    api("/api/projects", { method: "POST", body: JSON.stringify(data) }),
  get: (id) => api(`/api/projects/${id}`),
  delete: (id) => api(`/api/projects/${id}`, { method: "DELETE" }),
  getMembers: (id) => api(`/api/projects/${id}/members`),
  addMember: (id, data) =>
    api(`/api/projects/${id}/members`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const tasks = {
  list: (projectId) =>
    api(`/api/tasks${projectId ? `?project_id=${projectId}` : ""}`),
  create: (data) =>
    api("/api/tasks", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    api(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id) => api(`/api/tasks/${id}`, { method: "DELETE" }),
};

export const users = {
  list: () => api("/api/users"),
};

export const dashboard = {
  get: () => api("/api/dashboard"),
};
