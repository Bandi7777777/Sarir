import { decodeToken, getAccessToken } from "@/lib/auth";

export type Role = "admin" | "manager" | "viewer";

export function getCurrentUserRole(): Role {
  const token = getAccessToken();
  const claims = decodeToken(token);
  if (claims && typeof claims === "object") {
    if ("is_superuser" in claims && (claims as { is_superuser?: boolean }).is_superuser) {
      return "admin";
    }
    if ("role" in claims) {
      const roleValue = (claims as Record<string, unknown>).role;
      if (roleValue === "admin" || roleValue === "manager" || roleValue === "viewer") return roleValue;
    }
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
