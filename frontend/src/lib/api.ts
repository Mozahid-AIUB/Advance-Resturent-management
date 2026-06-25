const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

export function setToken(token: string) {
  window.localStorage.setItem("token", token);
}

export function clearToken() {
  window.localStorage.removeItem("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

export async function login(email: string, password: string) {
  return request<{ access_token: string; token_type: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(email: string, password: string) {
  return request<{ id: number; email: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export interface Branch {
  id: number;
  name: string;
  location: string;
}

export async function listBranches() {
  return request<Branch[]>("/branches");
}

export async function createBranch(name: string, location: string) {
  return request<Branch>("/branches", {
    method: "POST",
    body: JSON.stringify({ name, location }),
  });
}

export interface ForecastPoint {
  date: string;
  predicted_revenue: number;
  lower_bound: number;
  upper_bound: number;
}

export async function generateForecast(branchId: number, horizonDays = 14) {
  return request<ForecastPoint[]>(`/branches/${branchId}/forecasts?horizon_days=${horizonDays}`, {
    method: "POST",
  });
}

export async function getForecastAccuracy(branchId: number) {
  return request<{ mae_pct: number | null; rmse_pct: number | null }>(
    `/branches/${branchId}/forecasts/accuracy`
  );
}

export async function uploadCsv(branchId: number, file: File, mapping: Record<string, string>) {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);
  form.append("mapping", JSON.stringify(mapping));
  const res = await fetch(`${API_BASE}/branches/${branchId}/uploads`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json() as Promise<{ rows_imported: number; rows_rejected: number; errors: string[] }>;
}
