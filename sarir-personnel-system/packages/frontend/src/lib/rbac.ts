import { decodeToken, getAccessToken } from "@/lib/auth";

export type Role = "admin" | "manager" | "viewer";

export function getCurrentUserRole(): Role {
  const token = getAccessToken();
  const claims = decodeToken(token);
  if (claims?.is_superuser) return "admin";
  if (claims && "role" in claims) {
    const r = String((claims as any).role);
    if (r === "admin" || r === "manager" || r === "viewer") return r;
  }
  return claims ? "manager" : "viewer";
}

export function canCreate(role: Role) {
  return role === "admin" || role === "manager";
}
export function canUpdate(role: Role) {
  return role === "admin" || role === "manager";
}
export function canDelete(role: Role) {
  return role === "admin";
}
