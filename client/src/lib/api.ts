export interface HealthResponse {
  status: "ok";
  app: string;
  timestamp: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getHealth() {
  return request<HealthResponse>("/api/health");
}
