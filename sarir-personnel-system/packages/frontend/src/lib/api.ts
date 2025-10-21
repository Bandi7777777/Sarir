import { logApi } from "@/lib/telemetry";

export async function api<T>(input: string, init?: RequestInit): Promise<T> {
  const started = performance.now();
  let OK = true, status = 0;

  try {
    const res = await fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });
    status = res.status;
    if (!res.ok) {
      OK = false;
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }
    return (await res.json()) as T;
  } finally {
    const elapsed = performance.now() - started;
    logApi({ url: input, ok: OK, status, ms: Math.round(elapsed) });
  }
}
