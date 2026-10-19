const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export async function fetchJson(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("sentinel_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error [${res.status}]: ${errorText}`);
  }

  return res.json();
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    return fetchJson("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  // Alerts
  getAlerts: async (status?: string, severity?: string, hideNoise = false) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (severity) params.append("severity", severity);
    if (hideNoise) params.append("hide_noise", "true");
    return fetchJson(`/alerts?${params.toString()}`);
  },

  // Incidents
  getIncidents: async () => {
    return fetchJson("/incidents");
  },

  getIncident: async (id: string) => {
    return fetchJson(`/incidents/${id}`);
  },

  triggerAnalysis: async (id: string) => {
    return fetchJson(`/incidents/${id}/analyze`, { method: "POST" });
  },

  // Actions
  approveAction: async (actionId: string) => {
    return fetchJson(`/actions/${actionId}/approve`, { method: "POST" });
  },

  rejectAction: async (actionId: string) => {
    return fetchJson(`/actions/${actionId}/reject`, { method: "POST" });
  },

  // Reports
  getReports: async (incidentId: string) => {
    return fetchJson(`/reports/${incidentId}`);
  },

  getDownloadPdfUrl: (incidentId: string, lang = "en") => {
    return `${API_BASE}/reports/${incidentId}/pdf?lang=${lang}`;
  },

  // Metrics / Benchmark
  getBenchmark: async () => {
    return fetchJson("/metrics/benchmark");
  },

  // Simulator
  runSimulator: async (scenario: string, attackerIp = "194.26.29.112", targetHost = "corp-db-01.internal") => {
    const params = new URLSearchParams({
      scenario,
      attacker_ip: attackerIp,
      target_host: targetHost,
    });
    return fetchJson(`/simulator/run?${params.toString()}`, { method: "POST" });
  },

  resetData: async () => {
    return fetchJson("/simulator/reset", { method: "POST" });
  },
};

