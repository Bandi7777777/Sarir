const TOKEN_KEY = "sarir-access-token";

export function saveAccessToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export type TokenClaims = {
  sub?: string;
  username?: string;
  is_superuser?: boolean;
  exp?: number;
} & Record<string, unknown>;

export function decodeToken(token: string | null): TokenClaims | null {
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    const json = JSON.parse(atob(payload));
    return json as TokenClaims;
  } catch {
    return null;
  }
}
