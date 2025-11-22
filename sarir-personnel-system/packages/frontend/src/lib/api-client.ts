import { API_BASE_URL } from "@/lib/config";
import { getAccessToken } from "@/lib/auth";

export interface ApiError {
  detail: string;
  status: number;
}

export async function apiClient<T>(
  endpoint: string,
  { body, ...customConfig }: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: body ? "POST" : "GET",
    ...customConfig,
    headers: {
      ...headers,
      ...(customConfig.headers || {}),
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const response = await fetch(url, config);

  if (response.ok) {
    if (response.status === 204) return {} as T;
    return (await response.json()) as T;
  }

  const errorText = await response.text();
  let errorMessage = errorText;

  try {
    const jsonError = JSON.parse(errorText);
    errorMessage = jsonError.detail || jsonError.message || errorText;
  } catch {}

  const error = new Error(errorMessage) as Error & { status: number };
  error.status = response.status;
  throw error;
}
