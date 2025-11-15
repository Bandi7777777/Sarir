export type Role = "admin" | "manager" | "viewer";

export function getCurrentUserRole(): Role {
  if (typeof window !== "undefined") {
    const r = window.localStorage.getItem("sarir-role");
    if (r === "admin" || r === "manager" || r === "viewer") {
      return r;
    }
  }
  return "viewer";
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
